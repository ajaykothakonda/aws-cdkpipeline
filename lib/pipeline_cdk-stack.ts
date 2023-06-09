import * as cdk from 'aws-cdk-lib';
import { SecretValue, Environment } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BuildEnvironmentVariableType, BuildSpec, LinuxBuildImage, PipelineProject, Project } from 'aws-cdk-lib/aws-codebuild';
import { Artifact, IStage, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CodePipeline } from "aws-cdk-lib/pipelines";
import { CloudFormationCreateUpdateStackAction, CodeBuildAction, CodeBuildActionType, GitHubSourceAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { ServiceStack } from "./service-stack";
import * as yaml from 'yaml'; // https://www.npmjs.com/package/yaml
import * as path from "path";
import * as fs from "fs";
import { BillingSTack } from './billing-stack';
import { type } from 'os';
import { SnsTopic } from 'aws-cdk-lib/aws-events-targets';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { EventField, RuleTargetInput } from 'aws-cdk-lib/aws-events';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
//import { IStage } from 'aws-cdk-lib/aws-apigateway';

// import * as sqs from '@aws-cdk/aws-sqs';
//import { Construct } from '@aws-cdk/core';

export class PipelineCdkStack extends cdk.Stack {
  private readonly pipeline: Pipeline;
  private readonly cdkBuildOutput: Artifact;
  private readonly serviceBuildOutput: Artifact;
  private readonly serviceSourceOutput: Artifact;
  private readonly pipelineNotificationsTopic: Topic;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.pipeline = new Pipeline(this, "PipelineCDK", {
      pipelineName: 'PipelineCDK',
      crossAccountKeys: false,
      restartExecutionOnUpdate: true,
      
    });
    
    this.pipelineNotificationsTopic = new Topic(
      this, "PipelineNotificationsTopic", {
        topicName: "PipelineNotificationsTopic"
      }
    )

    this.pipelineNotificationsTopic.addSubscription(new EmailSubscription("pierre_kengne@yahoo.com"))

    const cdkSourceOutput = new Artifact('CDKsourceOutput');
    this.serviceSourceOutput = new Artifact('ServiceSourceOutput');

    this.pipeline.addStage({
      stageName: 'Source',
      actions: [
        new GitHubSourceAction({
          owner: 'kengne66',
          repo: 'aws-cdkpipeline',
          branch: 'master',
          actionName: 'Pipeline_Source',
          oauthToken: SecretValue.secretsManager('github-token'),
          output:  cdkSourceOutput
        }),
        new GitHubSourceAction({
          owner: 'kengne66',
          repo: 'express-lambda',
          branch: 'master',
          actionName: 'service_Source',
          oauthToken: SecretValue.secretsManager('github-token'),
          output:  this.serviceSourceOutput
        })
      ]
    });


    this.cdkBuildOutput = new Artifact('cdkBuildOutput')
    this.serviceBuildOutput = new Artifact('serviceBuildOutput')

    //const stringified = fs.readFileSync(path.join(__dirname, './buildspec.yml'), { encoding: 'utf-8', });
    //const parsed  = yaml.parse(stringified);

    const specFile = (this.serviceSourceOutput.atPath(`'build-specs/service-build-spec.yml'`)).fileName

    this.pipeline.addStage({
      stageName: "Build",
      actions: [
        new CodeBuildAction({
          actionName: 'CDK_Build',
          input:  cdkSourceOutput,
          outputs: [this.cdkBuildOutput],
          project: new PipelineProject(this, 'cdkBuildProject', {
            environment: {
              buildImage: LinuxBuildImage.STANDARD_5_0
            },
            buildSpec : BuildSpec.fromAsset(
              'build-specs/cdk-build-spec.yml'
            )
          })
        }),

        new CodeBuildAction({
          actionName: 'Service_Build',
          input:  this.serviceSourceOutput,
          outputs: [this.serviceBuildOutput],
          project: new PipelineProject(this, 'ServiceBuildProject', {
            environment: {
              buildImage: LinuxBuildImage.STANDARD_5_0
            },

          })
          
        })
      ]
    });

    this.pipeline.addStage( {
      stageName: "pipeline_Update",
      actions: [
        new CloudFormationCreateUpdateStackAction( {
          actionName: "Pipeline_Update",
          stackName: "PipelineCDKStack",
          templatePath: this.cdkBuildOutput.atPath("PipelineCDKStack.template.json"),
          adminPermissions: true
        }),
      ],
    });

  }

  public addServiceStage(serviceStack: ServiceStack, stageName: string): IStage {
    return this.pipeline.addStage({
      stageName: stageName,
      actions: [
        new CloudFormationCreateUpdateStackAction({
          account: serviceStack.account,
          region: serviceStack.region,
          actionName: "Service_Update",
          stackName: serviceStack.stackName,
          templatePath: this.cdkBuildOutput.atPath(`${serviceStack.stackName}.template.json`),
          adminPermissions: true,
          parameterOverrides: {
            ...serviceStack.servicecode.assign(this.serviceBuildOutput.s3Location)
          },
          extraInputs: [this.serviceBuildOutput]
          
        })
      ]
    })
  };

  public addBillingStackToStage(billingStack: BillingSTack, stage: IStage) {
    stage.addAction(new CloudFormationCreateUpdateStackAction({
      actionName: "Billing_Update",
      stackName: billingStack.stackName,
      templatePath: this.cdkBuildOutput.atPath(`${billingStack.stackName}.template.json`),
      adminPermissions: true
    }))
  };
  // coment
  public addServiceIntegrationTestStage(
    stage:IStage, 
    serviceEndpoint: string
  ) {
    const integTestAction = new CodeBuildAction({
      actionName: "Integration_Tests",
      input: this.serviceSourceOutput,
      project: new PipelineProject(this, "ServiceIntegrationTestProject", {
        environment: {
          buildImage: LinuxBuildImage.STANDARD_5_0,
        },
        buildSpec: BuildSpec.fromSourceFilename("buildspec-test.yml"),
      }),
      environmentVariables: {
        SERVICE_ENDPOINT: {
          value: serviceEndpoint,
          type: BuildEnvironmentVariableType.PLAINTEXT
        }
      },
      type: CodeBuildActionType.TEST,
      runOrder: 2
    });
    stage.addAction(integTestAction);
    integTestAction.onStateChange(
      "IntegrationTestFailed",
      new SnsTopic(this.pipelineNotificationsTopic, {
        message: RuleTargetInput.fromText(`Integration test failed, see results here: ${EventField.fromPath(
          '$.detail.execution-result.external-execution-url'
        )}`
        )
      }),
      {
        ruleName: "IntegrationTestFailed",
        eventPattern: {
          detail: {
            state: ["FAILED"]
          },
        },
        description: "Integration test that fails"
      }
    )  
  }
  
}
