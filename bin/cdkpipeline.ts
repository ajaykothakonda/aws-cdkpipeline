#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as Cdkpipeline from '../lib/pipeline_cdk-stack';
import { BillingSTack } from '../lib/billing-stack';

const app = new cdk.App();

// new CdkpipelineStack(app, 'CdkpipelineStack', {});

new BillingSTack(app, "BillingStack", {
  budgetAmount: 5,
  emailAddress: "pierre_kengne@yahoo.com",

});