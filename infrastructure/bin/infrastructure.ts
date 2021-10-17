#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
// import { AmplifyStack } from '../lib/amplify-stack';
import { Route53Stack } from '../lib/route53-stack';
import { PipelineStack } from '../lib/pipeline-stack';
import { CloudFrontStack } from '../lib/cloudfront-stack';
import { CognitoStack } from '../lib/cognito-stack';

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  // env: { account: '123456789012', region: 'us-east-1' },

const app = new cdk.App();
const route53Stack = new Route53Stack(app, 'MemersonRoute53Stack', {});

// TODO: replace amplify with custom infrastructure
// const amplifyStack = new AmplifyStack(app, 'MemersonAmplifyStack', {
//   hostedZone: route53Stack.hostedZone
// });
const cloudfrontStack = new CloudFrontStack(app, 'MemersonCloudFrontStack', {
  hostedZone: route53Stack.hostedZone,
  certificate: route53Stack.certificate
});

const autoDeployedStages: string[] = [
];

new PipelineStack(app, 'MemersonPipelineStack', {
  autoDeployedStacks: autoDeployedStages,
  websiteAssetsBucket: cloudfrontStack.assetsBucket,
});

new CognitoStack(app, 'MemersonCognitoStack', {});