import * as cdk from '@aws-cdk/core';
import {Duration} from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as certificatemanager from '@aws-cdk/aws-certificatemanager'


export class Route53Stack extends cdk.Stack {
  memersonNetDomain: string = 'memerson.net';
  memersonDevDomain: string = 'memerson.dev';
  hostedZone: route53.PublicHostedZone;
  memersonDevHostedZone: route53.PublicHostedZone;
  certificate: certificatemanager.Certificate;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const memersonNetHostedZone = new route53.PublicHostedZone(this, 'MemersonHostedZone', {
      zoneName: this.memersonNetDomain,
    });

    new route53.TxtRecord(this, 'MemersonNetAcmeRecord', {
      zone: memersonNetHostedZone,
      recordName: '_acme-challenge.memerson.net',
      values: [
        'XMHp2b1yME6Lvll8FeN46iGZWCfbHv7CyvJCAEBERRQ',
        'L5D0DTINBOT1zYM6Yb1u6B5NuOYeZsc_KREt4_LI3XQ',
      ],
      ttl: Duration.hours(1)
    });

    const memersonNetCertificate = new certificatemanager.Certificate(this, 'MemersonCert', {
      domainName: this.memersonNetDomain,
      validation: certificatemanager.CertificateValidation.fromDns(memersonNetHostedZone),
      // subjectAlternativeNames: [`*.${this.memersonNetDomain}`],
    });
    const memersonNetNameservers = memersonNetHostedZone.hostedZoneNameServers as string[];
    new cdk.CfnOutput(this, 'MemersonNetNameServers', {value: cdk.Fn.join(',', memersonNetNameservers)});


    // memerson.dev
    const memersonDevHostedZone = new route53.PublicHostedZone(this, 'MemersonDevHostedZone', {
      zoneName: this.memersonDevDomain,
    });

    const memersonDevCertificate = new certificatemanager.Certificate(this, 'MemersonDevCert', {
      domainName: this.memersonDevDomain,
      validation: certificatemanager.CertificateValidation.fromDns(memersonDevHostedZone),
    });

    const memersonDevNameservers = memersonDevHostedZone.hostedZoneNameServers as string[];
    new cdk.CfnOutput(this, 'MemersonDevNameServers', {value: cdk.Fn.join(',', memersonDevNameservers)});


    new route53.TxtRecord(this, 'MemersonDevTxtRecord', {
      zone: memersonDevHostedZone,
      recordName: '',
      values: [
        'hey-verification:SzL4Ngn97gGu5rHM8pvFiJ68',
        'v=spf1 include:_spf.hey.com ~all'
      ],
      ttl: Duration.hours(1)
    });

    new route53.TxtRecord(this, 'MemersonDevDmarcRecord', {
      zone: memersonDevHostedZone,
      recordName: '_dmarc',
      values: [
        'v=DMARC1; p=none;',
      ],
      ttl: Duration.hours(1)
    });

    new route53.CnameRecord(this, 'MemersonDevHeyDomainKey', {
      zone: memersonDevHostedZone,
      recordName: 'heymail._domainkey',
      domainName: 'heymail._domainkey.hey.com.',
      ttl: Duration.hours(1)
    });

    new route53.MxRecord(this, 'MemersonDevMxRecord', {
      zone: memersonDevHostedZone,
      values: [
        {
          hostName: 'work-mx.app.hey.com',
          priority: 10
        },
      ],
      ttl: Duration.hours(1)
    });

    this.hostedZone = memersonDevHostedZone;
    this.certificate = memersonDevCertificate;
  }
}