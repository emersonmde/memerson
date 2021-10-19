import * as lambda_nodejs from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';
import { join } from 'path';
      
export class LambdaStack extends cdk.Stack {
  // public readonly lambdaCode: lambda.CfnParametersCode;
      
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaName = 'ListPhotosLambda'
    new lambda_nodejs.NodejsFunction(this, lambdaName, {
      functionName: lambdaName,
      projectRoot: join(__dirname, '..'),
      entry: join(__dirname, '..', 'lambda', 'lambda-stack.ListPhotosLambda.ts'),
      bundling: {
        nodeModules: []
      }
    });
      
    // this.lambdaCode = lambda.Code.fromCfnParameters();
      
    // const func = new lambda.Function(this, 'ListPhotosLambda', {
    //   code: this.lambdaCode,
    //   handler: 'index.main',
    //   runtime: lambda.Runtime.NODEJS_10_X,
    //   description: `Function generated on: ${new Date().toISOString()}`,
    // });
      
    // const alias = new lambda.Alias(this, 'ListPhotosLambdaAlias', {
    //   aliasName: 'Prod',
    //   version: func.currentVersion,
    // });
      
    // new codedeploy.LambdaDeploymentGroup(this, 'ListPhotosDeploymentGroup', {
    //   alias,
    //   deploymentConfig: codedeploy.LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
    // });
  }
}