import * as lambda_nodejs from '@aws-cdk/aws-lambda-nodejs';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import * as cognito from '@aws-cdk/aws-cognito';
import * as apigateway from '@aws-cdk/aws-apigatewayv2';
import * as apiGatewayAuthorizers from '@aws-cdk/aws-apigatewayv2-authorizers';
import * as apiGatewayIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as cdk from '@aws-cdk/core';
import { join } from 'path';
import { IResolveContext } from '@aws-cdk/core';

export interface ApiStackProps extends cdk.StackProps {
  readonly userPool: cognito.UserPool;
  readonly userPoolClient: cognito.UserPoolClient;
}
      
export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const photosBucket = new s3.Bucket(this, 'MemersonApiPhotos', {
      bucketName: 'memerson-api-photos',
    })

    const lambdaName = 'MemersonApiListPhotos'
    const listPhotosLambda = new lambda_nodejs.NodejsFunction(this, lambdaName, {
      functionName: lambdaName,
      projectRoot: join(__dirname, '..'),
      entry: join(__dirname, '..', 'lambda', 'lambda-stack.ListPhotosLambda.ts'),
      bundling: {
        nodeModules: []
      }
    });

    const api = new apigateway.HttpApi(this, "MemersonApi", {
      apiName: "MemersonApi",
      description: "API for memerson.net",
    });
    photosBucket.grantReadWrite(listPhotosLambda);

    const authorizer = new apiGatewayAuthorizers.HttpUserPoolAuthorizer({
      userPool: props.userPool,
      userPoolClient: props.userPoolClient,
      identitySource: ['$request.header.Authorization'],
    });

    api.addRoutes({
      integration: new apiGatewayIntegrations.LambdaProxyIntegration({
        handler: listPhotosLambda,
      }),
      path: '/photos',
      authorizer: new apigateway.HttpNoneAuthorizer(),
    });

    new cdk.CfnOutput(this, 'memersonApiUrl', {
      value: api.url || '',
    });

  }
}