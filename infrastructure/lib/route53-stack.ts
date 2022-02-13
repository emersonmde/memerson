import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as certificatemanager from '@aws-cdk/aws-certificatemanager'
import {Duration} from "@aws-cdk/core";


export class Route53Stack extends cdk.Stack {
    domain: string = 'memerson.net'
    hostedZone: route53.PublicHostedZone;
    certificate: certificatemanager.Certificate;

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.hostedZone = new route53.PublicHostedZone(this, 'MemersonHostedZone', {
            zoneName: this.domain,
        });

        this.certificate = new certificatemanager.Certificate(this, 'MemersonCert', {
            domainName: this.domain,
            validation: certificatemanager.CertificateValidation.fromDns(this.hostedZone),
            // subjectAlternativeNames: [`*.${this.domain}`],
        });
        // this.certificate = new certificatemanager.DnsValidatedCertificate(this, 'MemersonCert', {
        //     region: 'us-east-1',
        //     hostedZone: this.hostedZone,
        //     domainName: this.domain,
        //     // subjectAlternativeNames: [`*.${this.domain}`],
        //     validationDomains: {
        //         [this.domain]: this.domain,
        //         // [`*.${this.domain}`]: this.domain
        //     },
        //     validationMethod: certificatemanager.ValidationMethod.DNS,
        // });

        // new route53.PublicHostedZone(this, 'TestMemersonHostedZone', {
        //     zoneName: 'test.memerson.net',
        // });

        new route53.TxtRecord(this, 'MemersonNetTxtRecord', {
            zone: this.hostedZone,
            recordName: '',
            values: [
                'hey-verification:CTeRPLx7npx9uiEP7x9b8xL9',
                'v=spf1 include:_spf.hey.com ~all'
            ],
            ttl: Duration.hours(1)
        });

        new route53.TxtRecord(this, 'MemersonNetDmarcRecord', {
            zone: this.hostedZone,
            recordName: '_dmarc',
            values: [
                'v=DMARC1; p=none;',
            ],
            ttl: Duration.hours(1)
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

        new route53.CnameRecord(this, 'ProtonMailDkimRecord1', {
            zone: this.hostedZone,
            recordName: 'protonmail._domainkey',
            domainName: 'protonmail.domainkey.dbmqw4ugiuaymzfaa65feupnggq2i3kjd36pe4soqavlqlozij64a.domains.proton.ch.'
        });


        new route53.CnameRecord(this, 'ProtonMailDkimRecord2', {
            zone: this.hostedZone,
            recordName: 'protonmail2._domainkey',
            domainName: 'protonmail2.domainkey.dbmqw4ugiuaymzfaa65feupnggq2i3kjd36pe4soqavlqlozij64a.domains.proton.ch.'
        });

        new route53.CnameRecord(this, 'ProtonMailDkimRecord3', {
            zone: this.hostedZone,
            recordName: 'protonmail3._domainkey',
            domainName: 'protonmail3.domainkey.dbmqw4ugiuaymzfaa65feupnggq2i3kjd36pe4soqavlqlozij64a.domains.proton.ch.'
        });

        const memersonNetNameservers = this.hostedZone.hostedZoneNameServers as string[];
        new cdk.CfnOutput(this, 'MemersonNetNameServers', {value: cdk.Fn.join(',', memersonNetNameservers)});


        // memerson.dev
        const memersonDevHostedZone = new route53.PublicHostedZone(this, 'MemersonDevHostedZone', {
            zoneName: this.domain,
        });

        const memersonDevCertificate = new certificatemanager.Certificate(this, 'MemersonDevCert', {
            domainName: this.domain,
            validation: certificatemanager.CertificateValidation.fromDns(this.hostedZone),
        });

        // new route53.MxRecord(this, 'MemersonDevMxRecord', {
        //     zone: memersonDevHostedZone,
        //     values: [
        //         {
        //             hostName: 'mail.protonmail.ch',
        //             priority: 10
        //         },
        //         {
        //             hostName: 'mailsec.protonmail.ch',
        //             priority: 20
        //         },
        //     ]
        // });

        const memersonDevNameservers = this.hostedZone.hostedZoneNameServers as string[];
        new cdk.CfnOutput(this, 'MemersonDevNameServers', {value: cdk.Fn.join(',', memersonDevNameservers)});
    }
}