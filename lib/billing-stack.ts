// import { Stack,  StackProps } from "aws-cdk-lib";
import { Scope } from "aws-cdk-lib/aws-ecs";
import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { Budget } from "./constructs/budget";

interface BillingStackProps extends StackProps {

    budgetAmount: number
    emailAddress: string
}  

export class BillingSTack extends Stack {
    constructor(scope: Construct, id: string, props: BillingStackProps) {

        super(scope, id, props);

        new Budget(this, 'Budget', {
            budgetAmount: props.budgetAmount,
           emailAddress: props.emailAddress
        })


    }
}
