#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AmplifyStack } from '../lib/amplify-stack';
import { Route53Stack } from '../lib/route53-stack';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();
const route53Stack = new Route53Stack(app, 'MemersonRoute53Stack', {});
const amplifyStack = new AmplifyStack(app, 'MemersonAmplifyStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  hostedZone: route53Stack.hostedZone
});

// const autoDeployedStages = [
//   route53Stack.stackName
// ]

// new PipelineStack(app, 'MemersonPipelineStack', {autoDeployedStacks: autoDeployedStages});
new PipelineStack(app, 'MemersonPipelineStack', {});