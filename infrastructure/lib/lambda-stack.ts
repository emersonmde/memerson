import * as codedeploy from '@aws-cdk/aws-codedeploy';
import * as lambda from '@aws-cdk/aws-lambda';
import { App, Stack, StackProps } from '@aws-cdk/core';
      
export class LambdaStack extends Stack {
  public readonly lambdaCode: lambda.CfnParametersCode;
      
  constructor(app: App, id: string, props?: StackProps) {
    super(app, id, props);
      
    this.lambdaCode = lambda.Code.fromCfnParameters();
      
    const func = new lambda.Function(this, 'ListPhotosLambda', {
      code: this.lambdaCode,
      handler: 'index.main',
      runtime: lambda.Runtime.NODEJS_10_X,
      description: `Function generated on: ${new Date().toISOString()}`,
    });
      
    const alias = new lambda.Alias(this, 'ListPhotosLambdaAlias', {
      aliasName: 'Prod',
      version: func.currentVersion,
    });
      
    new codedeploy.LambdaDeploymentGroup(this, 'ListPhotosDeploymentGroup', {
      alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
    });
  }
}