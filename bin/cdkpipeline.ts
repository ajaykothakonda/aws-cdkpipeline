#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

//import * as PipelineCdkStack from '../lib/pipeline_cdk-stack';
import { BillingSTack } from '../lib/billing-stack';
import { ServiceStack } from '../lib/service-stack';
import { PipelineCdkStack } from '../lib/pipeline_cdk-stack';
import { App, Environment } from "aws-cdk-lib";

const usEast1Env: Environment = {
  account: "673233218795",
  region: "us-east-1",
};

const euWest1Env: Environment = {
  account: "673233218795",
  region: "eu-west-1",
};

const account2Env: Environment = {
  account: "673233218795",
  region: "us-east-1",
};

const app = new cdk.App();


const pipelineStack = new PipelineCdkStack(app, 'PipelineCDKStack', {env: usEast1Env,});

const billingStack = new BillingSTack(app, "BillingStack", {
  env: usEast1Env,
  budgetAmount: 5,
  emailAddress: "pierre_kengne@yahoo.com",

});

const serviceStackTest  = new ServiceStack(app, "ServiceStackTest", {
  env: usEast1Env,
  stageName: "Test"
});

/*
const serviceStackProd  = new ServiceStack(app, "ServiceStackProd", {
  env: usEast1Env,
  stageName: "Prod"
});

const testStage = pipelineStack.addServiceStage(serviceStackTest, "Test");

const prodStage = pipelineStack.addServiceStage(serviceStackProd, "Prod");

pipelineStack.addBillingStackToStage(billingStack, prodStage);


pipelineStack.addServiceIntegrationTestStage(
  testStage,
  serviceStackTest.serviceEnpointOutput.importValue

)
*/

