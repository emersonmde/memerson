import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as certificatemanager from '@aws-cdk/aws-certificatemanager'
import {Duration} from "@aws-cdk/core";


export class Route53Stack extends cdk.Stack {
    memersonNetDomain: string = 'memerson.net';
    memersonDevDomain: string = 'memerson.dev';
    hostedZone: route53.PublicHostedZone;
    certificate: certificatemanager.Certificate;

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const memersonNetHostedZone = new route53.PublicHostedZone(this, 'MemersonHostedZone', {
            zoneName: this.memersonNetDomain,
        });

        const memersonNetCertificate = new certificatemanager.Certificate(this, 'MemersonCert', {
            domainName: this.memersonNetDomain,
            validation: certificatemanager.CertificateValidation.fromDns(memersonNetHostedZone),
            // subjectAlternativeNames: [`*.${this.memersonNetDomain}`],
        });
        // this.certificate = new certificatemanager.DnsValidatedCertificate(this, 'MemersonCert', {
        //     region: 'us-east-1',
        //     hostedZone: this.hostedZone,
        //     domainName: this.memersonNetDomain,
        //     // subjectAlternativeNames: [`*.${this.memersonNetDomain}`],
        //     validationDomains: {
        //         [this.memersonNetDomain]: this.memersonNetDomain,
        //         // [`*.${this.memersonNetDomain}`]: this.memersonNetDomain
        //     },
        //     validationMethod: certificatemanager.ValidationMethod.DNS,
        // });

        // new route53.PublicHostedZone(this, 'TestMemersonHostedZone', {
        //     zoneName: 'test.memerson.net',
        // });

        new route53.TxtRecord(this, 'MemersonTxtRecord', {
            zone: memersonNetHostedZone,
            recordName: '',
            values: [
                'hey-verification:CTeRPLx7npx9uiEP7x9b8xL9',
                'v=spf1 include:_spf.hey.com ~all'
            ],
            ttl: Duration.hours(1)
        });

        new route53.TxtRecord(this, 'MemersonNetDmarcRecord', {
            zone: memersonNetHostedZone,
            recordName: '_dmarc',
            values: [
                'v=DMARC1; p=none;',
            ],
            ttl: Duration.hours(1)
        });

        new route53.MxRecord(this, 'MemersonNetMxRecord', {
            zone: memersonNetHostedZone,
            values: [
                {
                    hostName: 'work-mx.app.hey.com',
                    priority: 10
                },
            ],
            ttl: Duration.hours(1)
        });

        new route53.CnameRecord(this, 'MemersonNetHeyDomainKey', {
            zone: memersonNetHostedZone,
            recordName: 'heymail._domainkey',
            domainName: 'heymail._domainkey.hey.com.',
            ttl: Duration.hours(1)
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


        this.hostedZone = memersonNetHostedZone;
        this.certificate = memersonNetCertificate;
    }
}