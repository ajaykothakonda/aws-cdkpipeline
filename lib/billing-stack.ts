// import { Stack,  StackProps } from "aws-cdk-lib";
import { App } from "aws-cdk-lib";
import { Stack, StackProps } from 'aws-cdk-lib';
import { Budget } from "./constructs/budget";
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface BillingStackProps extends StackProps {

    budgetAmount: number
    emailAddress: string
}  

const app = new App()

export class BillingSTack extends Stack {
    constructor(scope: Construct, id: string, props: BillingStackProps) {

        super(scope, id, props);

        new Budget(this, 'Budget', {
            budgetAmount: props.budgetAmount,
           emailAddress: props.emailAddress
        })


    }
}
