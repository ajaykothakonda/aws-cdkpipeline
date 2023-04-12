import { App,  Stack } from 'aws-cdk-lib'
import { isExternalCompatible } from 'aws-cdk-lib/aws-ecs';
import { Budget } from '../../lib/constructs/budget';
import { Template  } from "aws-cdk-lib/assertions";

test("Budget construct", () => {
const app = new App;
    const stack = new Stack(app, "budgetStack");

    new Budget(stack, "Budget", {
        budgetAmount: 1,
        emailAddress: 'test@isExternalCompatible.com',
    })

    const template = Template.fromStack(stack)

    template.hasResourceProperties("AWS::Budgets::Budget", {
        Budget: {
            BudgetLimit: {
                Amount: 1
            }
        },
      });


})


