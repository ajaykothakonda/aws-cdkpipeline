import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline'
import {aws_codepipeline} from "aws-cdk-lib";
import { GitHubSourceAction, CodeBuildAction } from "aws-cdk-lib/aws-codepipeline-actions";
import { SecretValue } from "aws-cdk-lib";
import {LinuxBuildImage, PipelineProject, BuildSpec} from "aws-cdk-lib/aws-codebuild";


// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkpipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new Pipeline(this, 'Pipeline', {
      pipelineName: 'Pipeline',
      crossAccountKeys: false
    })

    const sourceOutput = new Artifact('sourceOutput');

    pipeline.addStage({
      stageName: "source",
      actions: [
          new GitHubSourceAction({
            owner: 'kengne66',
            repo: 'aws-cdkpipeline',
            branch: 'master',
            actionName: 'Pipeline_Source',
            oauthToken: SecretValue.secretsManager('github-token'),
            output: sourceOutput
          })
      ]
    })

    const cdkBuildOutput = new Artifact('cdkBuildOutput')

    pipeline.addStage( {
      stageName: 'Build',
      actions: [
          new CodeBuildAction({
            actionName: "CDK_Build",
            input: sourceOutput,
            outputs: [cdkBuildOutput],
            project: new PipelineProject(this, 'cdkBuildProject', {
              environment: {
                buildImage: LinuxBuildImage.AMAZON_LINUX_2,
              },
              buildSpec: BuildSpec.fromSourceFilename("build-specs/cdk-build-spec"),


            })
          })

      ]
    })

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkpipelineQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
