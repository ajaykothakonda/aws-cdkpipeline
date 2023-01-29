import { App } from '@aws-cdk/core';
import { BillingSTack } from '../lib/billing-stack';
import  { SynthUtils } from '@aws-cdk/assert';

test("Billing stack", () => {
    const app = new App();

    const stack = new BillingSTack(app, "BillingStack", {
        budgetAmount: 1,
        emailAddress: "test@exactlyMatchTemplate.com"
    });

    // expect(SynthUtils.toCloudFormation(stack).toWhatchSnatshot());

})