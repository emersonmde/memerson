
import * as cdk from '@aws-cdk/core';
import { LambdaStack } from './lambda-stack';

export class LambdaStage extends cdk.Stage {

  constructor(scope: cdk.Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new LambdaStack(this, 'MemersonLambdaStack', props);
  }

}