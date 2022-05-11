import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as certificatemanager from '@aws-cdk/aws-certificatemanager'
import {Duration} from "@aws-cdk/core";


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

        this.hostedZone = memersonDevHostedZone;
        this.certificate = memersonDevCertificate;
    }
}