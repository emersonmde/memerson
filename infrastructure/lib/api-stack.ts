import * as lambda_nodejs from '@aws-cdk/aws-lambda-nodejs';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import * as cognito from '@aws-cdk/aws-cognito';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as cdk from '@aws-cdk/core';
import {join} from 'path';

export interface ApiStackProps extends cdk.StackProps {
  readonly userPool: cognito.UserPool;
  readonly userPoolClient: cognito.UserPoolClient;
  readonly authorizedRole: iam.IRole;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);


    const api = new apigateway.RestApi(this, 'MemersonApi', {
      restApiName: 'MemersonApi',
      description: 'REST API for memerson.net',
      deployOptions: {
        stageName: 'dev',
      },
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'x-amz-security-token'
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: ['http://localhost:3000', 'https://memerson.net'],
      },
    });

    // List Photos
    const photosBucket = new s3.Bucket(this, 'MemersonApiPhotos', {
      bucketName: 'memerson-api-photos',
    })
    const listPhotosLambdaName = 'MemersonApiListPhotos'
    const listPhotosLambda = new lambda_nodejs.NodejsFunction(this, listPhotosLambdaName, {
      functionName: listPhotosLambdaName,
      runtime: lambda.Runtime.NODEJS_14_X,
      projectRoot: join(__dirname, '..'),
      entry: join(__dirname, '..', 'lambda', 'list-photos.ts'),
      bundling: {
        nodeModules: []
      }
    });
    photosBucket.grantReadWrite(listPhotosLambda);

    const photosApi = api.root.addResource('photos');
    photosApi.addMethod(
      'GET',
      new apigateway.LambdaIntegration(listPhotosLambda, {proxy: true}),
      {authorizationType: apigateway.AuthorizationType.NONE}
    )

    // Auth Echo
    const authEchoLambdaName = 'MemersonApiAuthEcho'
    const authEchoLambda = new lambda_nodejs.NodejsFunction(this, authEchoLambdaName, {
      functionName: authEchoLambdaName,
      runtime: lambda.Runtime.NODEJS_14_X,
      projectRoot: join(__dirname, '..'),
      entry: join(__dirname, '..', 'lambda', 'auth_echo.ts'),
      bundling: {
        nodeModules: []
      }
    });

    const authEchoApi = api.root.addResource('auth_echo');
    const authEchoMethod = authEchoApi.addMethod(
      'GET',
      new apigateway.LambdaIntegration(authEchoLambda, {proxy: true}),
      {
        authorizationType: apigateway.AuthorizationType.IAM
      }
    );

    props.authorizedRole.attachInlinePolicy(new iam.Policy(this, 'AllowAuthEcho', {
      statements: [
        new iam.PolicyStatement({
          actions: ['execute-api:Invoke'],
          effect: iam.Effect.ALLOW,
          resources: [authEchoMethod.methodArn]
        })
      ]
    }));


    new cdk.CfnOutput(this, 'memersonApiUrl', {
      value: api.url || '',
    });

  }
}