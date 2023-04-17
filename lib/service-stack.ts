//import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs";
import { CfnParameter, Stack, StackProps } from "aws-cdk-lib";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { HttpApi } from  "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpUrlIntegration  } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as integrations from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from  "aws-cdk-lib/aws-lambda"


interface serviceStackProps extends StackProps {
  stageName: string
}

export class ServiceStack extends Stack {
  public readonly servicecode: lambda.CfnParametersCode
  constructor(scope: Construct, id: string, props: serviceStackProps) {
    super(scope, id, props);

    this.servicecode = Code.fromCfnParameters();

    const Lambda = new Function(this, "serviceLambda", {
      runtime: Runtime.NODEJS_14_X,
      handler: "scr/lambda.handler",
      code: this.servicecode,
      functionName: `serviceLambda${props.stageName}`
    });
    
    const DefaultIntegration = new HttpLambdaIntegration('BooksIntegration', Lambda);
        
    new HttpApi(this, "ServiceLambda", {
      defaultIntegration: DefaultIntegration,
      apiName: `myService${props.stageName}`
    })

  }

}