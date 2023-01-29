
import { Construct, StackProps } from '@aws-cdk/core';

import { aws_budgets as budgets, Stack } from 'aws-cdk-lib';
import { CfnBudget } from '@aws-cdk/aws-budgets';



interface Budgetprops extends StackProps {
    budgetAmount: number
    emailAddress: string

}

export class Budget extends Construct {
    constructor(scope: Construct, id: string, props: Budgetprops) {
        super(scope, id);

        new CfnBudget(this, "Budget", {
            budget: {
              budgetType: 'COST',
              timeUnit: 'MONTHLY',
          
              // the properties below are optional
              budgetLimit: {
                amount: props.budgetAmount,
                unit: 'USD',
              },
              budgetName: 'Monthly budget',

            },
            notificationsWithSubscribers: [{
                notification: {
                  comparisonOperator: 'GREATER_THAN',
                  notificationType: 'ACTUAL',
                  threshold: 100,
            
                  // the properties below are optional
                  thresholdType: 'PERCENTAGE',
                },

                subscribers: [{
                  address: props.emailAddress ,
                  subscriptionType: 'EMAIL'
                }],
              }],


        });
    }
}