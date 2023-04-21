#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

//import * as PipelineCdkStack from '../lib/pipeline_cdk-stack';
import { BillingSTack } from '../lib/billing-stack';
import { ServiceStack } from '../lib/service-stack';
import { PipelineCdkStack } from '../lib/pipeline_cdk-stack';

const app = new cdk.App();


const pipelineStack = new PipelineCdkStack(app, 'PipelineCDKStack', {});

const billingStack = new BillingSTack(app, "BillingStack", {
  budgetAmount: 5,
  emailAddress: "pierre_kengne@yahoo.com",

});

const serviceStackTest  = new ServiceStack(app, "ServiceStackTest", {
  stageName: "Test"
});


const serviceStackProd  = new ServiceStack(app, "ServiceStackProd", {
  stageName: "Prod"
});
/*
const testStage = pipelineStack.addServiceStage(serviceStackTest, "Test");

const prodStage = pipelineStack.addServiceStage(serviceStackProd, "Prod");

pipelineStack.addBillingStackToStage(billingStack, prodStage);


pipelineStack.addServiceIntegrationTestStage(
  testStage,
  serviceStackTest.serviceEnpointOutput.importValue

)
*/
