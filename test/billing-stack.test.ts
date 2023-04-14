import * as cdk from 'aws-cdk-lib';
import { App, Stack } from 'aws-cdk-lib';
import { BillingSTack } from '../lib/billing-stack';
import { Template } from "aws-cdk-lib/assertions";


import { Construct } from 'constructs';

test("Billing stack", () => {
   const app = new cdk.App();
   const stack = new BillingSTack(app, "BillingStack", {
      budgetAmount: 1,
      emailAddress: "test@examlple.com"
    });    
    
    expect(Template.fromStack(stack).toJSON()).toMatchSnapshot;

})