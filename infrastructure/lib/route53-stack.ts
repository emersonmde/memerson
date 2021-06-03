import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';



export class MemersonRoute53Stack extends cdk.Stack {
  hostedZone: route53.PublicHostedZone;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.hostedZone = new route53.PublicHostedZone(this, 'MemersonHostedZone', {
        zoneName: 'memerson.net'
    });

    new route53.TxtRecord(this, 'ProtonMailTxtRecord', {
        zone: this.hostedZone,
        values: [
            'protonmail-verification=12f676345e1db386f504a9bbd2b52ce906a3ccdd',
            'v=spf1 include:_spf.protonmail.ch mx ~all',
        ],
    });

    new route53.MxRecord(this, 'ProtonMailMxRecord', {
        zone: this.hostedZone,
        values: [
            {
                hostName: 'mail.protonmail.ch',
                priority: 10
            },
            {
                hostName: 'mailsec.protonmail.ch',
                priority: 20
            },
        ]
        
    });

    const nameservers = this.hostedZone.hostedZoneNameServers as string[];
    new cdk.CfnOutput(this, 'MemersonNameServers', { value: cdk.Fn.join(',', nameservers) });
  }
}