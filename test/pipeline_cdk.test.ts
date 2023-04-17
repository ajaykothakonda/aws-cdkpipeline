import * as cdk from 'aws-cdk-lib';
// import { Template } from 'aws-cdk-lib/assertions';
import * as Cdkpipeline from '../lib/pipeline_cdk-stack';
import { App, Environment } from "aws-cdk-lib";
//import { expect as expectCDK, matchTemplate, MatchStyle, SynthUtils, } from "aws-cdk-lib/assets";
import { Capture, Match, Template } from "aws-cdk-lib/assertions";

import * as Pipeline from "../lib/pipeline_cdk-stack";
import { ServiceStack } from "../lib/service-stack";
import { PipelineCdkStack } from "../lib/pipeline_cdk-stack";

// example test. To run these tests, uncomment this file along with the
// example resource in lib/cdkpipeline-stack.ts
test('Pipeline Stack', () => {
   const app = new cdk.App();
//     // WHEN
   const stack1 = new Cdkpipeline.PipelineCdkStack(app, 'MyTestStack');
//     // THEN


   const template = Template.fromStack(stack1)
   expect(template.toJSON()).toMatchSnapshot()
});

test("Adding service stage", () => {
   // GIVEN
   const app = new App();
   const serviceStack = new ServiceStack(app, "ServiceStack");
   const pipelineStack = new PipelineCdkStack(app, "PipelineStack");
 
   // WHEN
   pipelineStack.addServiceStage(serviceStack, "Test");
 
   // THEN
   Template.fromStack(pipelineStack).hasResourceProperties(
     "AWS::CodePipeline::Pipeline",
     {
       Stages: Match.arrayWith([
         Match.objectLike({
           Name: "Test",
         }),
       ]),
     }
   );
 });
 