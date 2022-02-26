#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import {Route53Stack} from '../lib/route53-stack';
import {CloudFrontStack} from '../lib/cloudfront-stack';
import {CognitoStack} from '../lib/cognito-stack';
import {ApiStack} from '../lib/api-stack';
import {PipelineStack} from '../lib/pipeline-stack';
import {S3Stack} from '../lib/s3-stack';

const app = new cdk.App();
const route53Stack = new Route53Stack(app, 'MemersonRoute53Stack', {});

const cloudfrontStack = new CloudFrontStack(app, 'MemersonCloudFrontStack', {
  hostedZone: route53Stack.hostedZone,
  certificate: route53Stack.certificate
});

const cognitoStack = new CognitoStack(app, 'MemersonCognitoStack', {});

new S3Stack(app, 'MemersonS3Stack', {
  unauthenticatedRole: cognitoStack.unauthenticatedRole,
  authenticatedRole: cognitoStack.authenticatedRole
});

new ApiStack(app, 'MemersonApiStack', {
  userPool: cognitoStack.userPool,
  userPoolClient: cognitoStack.userPoolClient,
  authorizedRole: cognitoStack.authenticatedRole
});

const autoDeployedStages: string[] = [];

new PipelineStack(app, 'MemersonReactPipelineStack', {
  autoDeployedStacks: autoDeployedStages,
  websiteAssetsBucket: cloudfrontStack.assetsBucket,
});

// new CdkPipelineStack(app, 'MemersonCdkPipelineStack', {});