#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { Route53Stack } from '../lib/route53-stack';
import { CloudFrontStack } from '../lib/cloudfront-stack';
import { CognitoStack } from '../lib/cognito-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { CdkPipelineStack } from '../lib/cdk-pipeline-stack';

const app = new cdk.App();
// const route53Stack = new Route53Stack(app, 'MemersonRoute53Stack', {});

// const cloudfrontStack = new CloudFrontStack(app, 'MemersonCloudFrontStack', {
//   hostedZone: route53Stack.hostedZone,
//   certificate: route53Stack.certificate
// });

// const cognitoStack = new CognitoStack(app, 'MemersonCognitoStack', {});

// const lambdaStack = new LambdaStack(app, 'MemersonLambdaStack', {});

// const autoDeployedStages: string[] = [
// ];

// new PipelineStack(app, 'MemersonPipelineStack', {
//   autoDeployedStacks: autoDeployedStages,
//   websiteAssetsBucket: cloudfrontStack.assetsBucket,
//   lambdaStackId: lambdaStack.stackId,
//   lambdaCode: lambdaStack.lambdaCode,
// });

new CdkPipelineStack(app, 'MemersonCdkPipelineStack', {});