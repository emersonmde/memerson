#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { Route53Stack } from '../lib/route53-stack';
import { PipelineStack } from '../lib/pipeline-stack';
import { CloudFrontStack } from '../lib/cloudfront-stack';
import { CognitoStack } from '../lib/cognito-stack';
import { LambdaStack } from '../lib/lambda-stack';

const app = new cdk.App();
const route53Stack = new Route53Stack(app, 'MemersonRoute53Stack', {});

const cloudfrontStack = new CloudFrontStack(app, 'MemersonCloudFrontStack', {
  hostedZone: route53Stack.hostedZone,
  certificate: route53Stack.certificate
});

const cognitoStack = new CognitoStack(app, 'MemersonCognitoStack', {});

const lambdaStack = new LambdaStack(app, 'MemersonLambdaStack', {});

const autoDeployedStages: string[] = [
];

new PipelineStack(app, 'MemersonPipelineStack', {
  autoDeployedStacks: autoDeployedStages,
  websiteAssetsBucket: cloudfrontStack.assetsBucket,
  lambdaCode: lambdaStack.lambdaCode,
});