import * as lambda_nodejs from '@aws-cdk/aws-lambda-nodejs';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import * as cognito from '@aws-cdk/aws-cognito';
import * as apigateway from '@aws-cdk/aws-apigateway';
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

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'cognitoAuthorizer', {
      cognitoUserPools: [props.userPool]
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
      new apigateway.LambdaIntegration(listPhotosLambda, { proxy: true }),
      { authorizationType: apigateway.AuthorizationType.NONE }
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
    authEchoApi.addMethod(
        'GET',
        new apigateway.LambdaIntegration(authEchoLambda, { proxy: true }),
        {
          authorizer: authorizer,
          authorizationType: apigateway.AuthorizationType.COGNITO
        }
    );

    // photosApi.addMethod('OPTIONS', new apigateway.MockIntegration({
    //   integrationResponses: [{
    //     statusCode: '200',
    //     responseParameters: {
    //       'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
    //       'method.response.header.Access-Control-Allow-Origin': "'http://localhost:3000, https://memerson.net'",
    //       'method.response.header.Access-Control-Allow-Credentials': "'false'",
    //       'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
    //     },
    //   }],
    //   passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
    //   requestTemplates: {
    //     "application/json": "{\"statusCode\": 200}"
    //   },
    // }), {
    //   methodResponses: [{
    //     statusCode: '200',
    //     responseParameters: {
    //       'method.response.header.Access-Control-Allow-Headers': true,
    //       'method.response.header.Access-Control-Allow-Methods': true,
    //       'method.response.header.Access-Control-Allow-Credentials': true,
    //       'method.response.header.Access-Control-Allow-Origin': true,
    //     },
    //   }]
    // });

    // const authorizer = new apiGatewayAuthorizers.HttpUserPoolAuthorizer({
    //   userPool: props.userPool,
    //   userPoolClient: props.userPoolClient,
    //   identitySource: ['$request.header.Authorization'],
    // });

    // .addRoutes({
    //   integration: new apiGatewayIntegrations.LambdaProxyIntegration({
    //     handler: listPhotosLambda,
    //   }),
    //   path: '/photos',
    //   authorizer: new apigateway.HttpNoneAuthorizer(),
    // });

    new cdk.CfnOutput(this, 'memersonApiUrl', {
      value: api.url || '',
    });

  }
}