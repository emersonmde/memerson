import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';



export class MemersonRoute53Stack extends cdk.Stack {
  hostedZone: route53.PublicHostedZone;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.hostedZone = new route53.PublicHostedZone(this, 'MemersonHostedZone', {
        zoneName: 'memerson.net'
    });

    const nameservers = this.hostedZone.hostedZoneNameServers as string[];
    new cdk.CfnOutput(this, 'MemersonNameServers', { value: cdk.Fn.join(',', nameservers) });
  }
}