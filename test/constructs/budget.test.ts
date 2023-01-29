import { App,  Stack } from '@aws-cdk/core'
import { isExternalCompatible } from 'aws-cdk-lib/aws-ecs';
import { Budget } from '../../lib/constructs/budget';
import { expect as expectCDK, haveResource, haveResourceLike  } from "@aws-cdk/assert";

test("Budget construct", () => {
    const app = new App;
    const stack = new Stack(app, "Stact");

    new Budget(stack, "Budget", {
        budgetAmount: 1,
        emailAddress: 'test@isExternalCompatible.com',
    })

    expectCDK(Stack).to(haveResourceLike("AWS::Budgets::Budget", {
        Budget: {
            BudgetLimit: {
                Amount: 1
            }
        },

        NotificationWithSubscribers: [
            {
                Subscribers: [
                    {
                        Address: "test@exqmple.com"
                    }
                ]
            }
        ]
    }));





})


