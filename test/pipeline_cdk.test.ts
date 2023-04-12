import * as cdk from 'aws-cdk-lib';
// import { Template } from 'aws-cdk-lib/assertions';
import * as Cdkpipeline from '../lib/pipeline_cdk-stack';

//import { expect as expectCDK, matchTemplate, MatchStyle, SynthUtils, } from "aws-cdk-lib/assets";
import { Capture, Match, Template } from "aws-cdk-lib/assertions";

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
