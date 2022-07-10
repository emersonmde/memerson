import * as lambda_nodejs from '@aws-cdk/aws-lambda-nodejs';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import * as cognito from '@aws-cdk/aws-cognito';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as cdk from '@aws-cdk/core';
import {join} from 'path';
import {Runtime} from "@aws-cdk/aws-lambda";
import {Duration} from "@aws-cdk/core";
import * as lambda_python from '@aws-cdk/aws-lambda-python';


export interface ApiStackProps extends cdk.StackProps {
  readonly userPool: cognito.UserPool;
  readonly userPoolClient: cognito.UserPoolClient;
  readonly authorizedRole: iam.IRole;
  readonly publicPhotosBucket: s3.IBucket;
}

export class ApiStack extends cdk.Stack {
  public photosBucket: s3.IBucket

  constructor(scope: cdk.Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);


    const api = new apigateway.RestApi(this, 'MemersonApi', {
      restApiName: 'MemersonApi',
      description: 'REST API for memerson.dev',
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
        allowOrigins: ['http://localhost:3000', 'https://memerson.dev'],
      },
    });

    // List Photos
    this.photosBucket = new s3.Bucket(this, 'MemersonApiPhotos', {
      bucketName: 'memerson-api-photos',
      publicReadAccess: true
    })
    const oldListPhotosLambdaName = 'MemersonApiOldListPhotos'
    const oldListPhotosLambda = new lambda_nodejs.NodejsFunction(this, oldListPhotosLambdaName, {
      functionName: oldListPhotosLambdaName,
      runtime: lambda.Runtime.NODEJS_14_X,
      projectRoot: join(__dirname, '..'),
      entry: join(__dirname, '..', 'lambda', 'list-photos.ts'),
      bundling: {
        nodeModules: []
      }
    });
    this.photosBucket.grantReadWrite(oldListPhotosLambda);
    props.publicPhotosBucket.grantRead(oldListPhotosLambda);

    const listPhotosLambdaName = 'MemersonApiListPhotos';
    const listPhotosLambda = new lambda_python.PythonFunction(this, listPhotosLambdaName, {
      functionName: listPhotosLambdaName,
      entry: join(__dirname, '..', 'lambda'),
      index: 'list_photos.py',
      handler: 'list_photos_handler',
      runtime: Runtime.PYTHON_3_9,
      timeout: Duration.seconds(30),
    });
    this.photosBucket.grantReadWrite(listPhotosLambda);
    props.publicPhotosBucket.grantRead(listPhotosLambda);

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

    const serverStatusLambdaName = 'MemersonApiServerStatus'
    const serverStatusLambda = new lambda_python.PythonFunction(this, serverStatusLambdaName, {
      functionName: serverStatusLambdaName,
      entry: join(__dirname, '..', 'lambda'),
      index: 'server_status.py',
      handler: 'server_status_handler',
      runtime: Runtime.PYTHON_3_9,
      timeout: Duration.seconds(30),
    });
    serverStatusLambda.addToRolePolicy(new iam.PolicyStatement(
      {
        resources: ['*'],
        actions: [
          'ec2:DescribeInstances',
        ],
      }
    ));

    const serverStatusApi = api.root.addResource('server_status');
    const serverStatusMethod = serverStatusApi.addMethod(
      'GET',
      new apigateway.LambdaIntegration(serverStatusLambda, {proxy: true}),
      {
        authorizationType: apigateway.AuthorizationType.IAM
      }
    );

    const serverControlLambdaName = 'MemersonApiServerControl'
    const serverControlLambda = new lambda_python.PythonFunction(this, serverControlLambdaName, {
      functionName: serverControlLambdaName,
      entry: join(__dirname, '..', 'lambda'),
      index: 'server_control.py',
      handler: 'server_control_handler',
      runtime: Runtime.PYTHON_3_9,
      timeout: Duration.seconds(30),
    });
    serverControlLambda.addToRolePolicy(new iam.PolicyStatement(
      {
        resources: ['*'],
        actions: [
          'ec2:DescribeInstances',
          'ec2:StopInstances',
          'ec2:StartInstances',
        ],
      }
    ));

    const serverControlApi = api.root.addResource('server_control');
    const serverControlMethod = serverControlApi.addMethod(
      'GET',
      new apigateway.LambdaIntegration(serverControlLambda, {proxy: true}),
      {
        authorizationType: apigateway.AuthorizationType.IAM
      }
    );

    props.authorizedRole.attachInlinePolicy(new iam.Policy(this, 'AllowAuthEcho', {
      statements: [
        new iam.PolicyStatement({
          actions: ['execute-api:Invoke'],
          effect: iam.Effect.ALLOW,
          resources: [authEchoMethod.methodArn, serverStatusMethod.methodArn, serverControlMethod.methodArn]
        })
      ]
    }));


    new cdk.CfnOutput(this, 'memersonApiUrl', {
      value: api.url || '',
    });

  }
}