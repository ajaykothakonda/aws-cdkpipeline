import * as cdk from 'aws-cdk-lib';
import { SecretValue } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BuildSpec, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CloudFormationCreateUpdateStackAction, CodeBuildAction, GitHubSourceAction } from 'aws-cdk-lib/aws-codepipeline-actions';
// import * as sqs from '@aws-cdk/aws-sqs';
//import { Construct } from '@aws-cdk/core';

export class PipelineCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new Pipeline(this, "PipelineCDK2", {
      pipelineName: 'PipelineCDK2',
      crossAccountKeys: false
    });

    const cdkSourceOutput = new Artifact('CDKsourceOutput2');
    const serviceSourceOutput = new Artifact('ServiceSourceOutput2');

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new GitHubSourceAction({
          owner: 'kengne66',
          repo: 'aws-cdkpipeline',
          branch: 'master',
          actionName: 'Pipeline_Source2',
          oauthToken: SecretValue.secretsManager('github-token'),
          output: cdkSourceOutput
        }),
        new GitHubSourceAction({
          owner: 'kengne66',
          repo: 'express-lambda',
          branch: 'master',
          actionName: 'service_Source2',
          oauthToken: SecretValue.secretsManager('github-token'),
          output: serviceSourceOutput
        })
      ]
    });


    const cdkBuildOutput = new Artifact('cdkBuildOutput2')
    const ServiceBuildOutput = new Artifact('serviceBuildOutput2')

    pipeline.addStage({
      stageName: "Build",
      actions: [
        new CodeBuildAction({
          actionName: 'CDK_Build2',
          input: cdkSourceOutput,
          outputs: [cdkBuildOutput],
          project: new PipelineProject(this, 'cdkBuildProject2', {
            environment: {
              buildImage: LinuxBuildImage.STANDARD_5_0
            },
            buildSpec : BuildSpec.fromSourceFilename(
              'build-specs/buildspec.yml'
            )
          })
        }),

        new CodeBuildAction({
          actionName: 'Service_Build2',
          input: serviceSourceOutput,
          outputs: [ServiceBuildOutput],
          project: new PipelineProject(this, 'ServiceBuildProject2', {
            environment: {
              buildImage: LinuxBuildImage.STANDARD_5_0
            },
            buildSpec: BuildSpec.fromSourceFilename(
              'build-specs/service-build-spec.yml'
            )
          })
        })
      ]
    });

/*
    pipeline.addStage( {
      stageName: "pipeline_Update",
      actions: [
        new CloudFormationCreateUpdateStackAction( {
          actionName: "Pipeline_Update",
          stackName: "PipelineStack",
          templatePath: cdkBuildOutput.atPath("PipelineStack.template.json"),
          adminPermissions: true
        }),
      ]
    }
    )
    */

  }
}
