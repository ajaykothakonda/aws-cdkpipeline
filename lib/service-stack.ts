//import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs";
import { CfnOutput, CfnParameter, Stack, StackProps } from "aws-cdk-lib";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { HttpApi } from  "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpUrlIntegration  } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as integrations from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from  "aws-cdk-lib/aws-lambda"
import { LambdaDeploymentConfig, LambdaDeploymentGroup } from "aws-cdk-lib/aws-codedeploy";


interface serviceStackProps extends StackProps {
  stageName: string
}

export class ServiceStack extends Stack {
  public readonly servicecode: lambda.CfnParametersCode;
  public readonly serviceEnpointOutput: CfnOutput;
  constructor(scope: Construct, id: string, props: serviceStackProps) {
    super(scope, id, props);

    this.servicecode = Code.fromCfnParameters();

    const Lambda = new Function(this, "serviceLambda", {
      runtime: Runtime.NODEJS_14_X,
      handler: "scr/lambda.handler",
      code: this.servicecode,
      functionName: `serviceLambda${props.stageName}`,
      description: `Generated on ${new Date().toISOString}`
    });

    const alias = new lambda.Alias(this, "ServiceLambdaAlias", {
      version: Lambda.currentVersion,
      aliasName: `serviceLambdaAlias${props.stackName}`

    })
    
    const DefaultIntegration = new HttpLambdaIntegration('LambdaIntegration', alias);
        
    const httpApi = new HttpApi(this, "ServiceAPI", {
      defaultIntegration: DefaultIntegration,
      apiName: `myService${props.stageName}`,
    });

    if (props.stackName === 'Prod') {
      new LambdaDeploymentGroup(this, "DeploymentGroup", {
        alias: alias,
        deploymentConfig: LambdaDeploymentConfig.CANARY_10PERCENT_10MINUTES
      
      })
    }



    this.serviceEnpointOutput = new CfnOutput(this, "ApiEndpointOutput", {
      exportName: `serviceEnpoint${props.stageName}`,
      value: httpApi.apiEndpoint,
      description: "Api Endpoint"
    });

  }

}
