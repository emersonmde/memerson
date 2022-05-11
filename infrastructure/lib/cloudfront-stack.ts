import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as certificatemanager from '@aws-cdk/aws-certificatemanager';
import * as s3 from '@aws-cdk/aws-s3';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as patterns from '@aws-cdk/aws-route53-patterns';


export interface CloudFrontStackProps extends cdk.StackProps {
  hostedZone: route53.PublicHostedZone;
  certificate: certificatemanager.Certificate;
}

export class CloudFrontStack extends cdk.Stack {
  assetsBucket: s3.Bucket;

  constructor(scope: cdk.Construct, id: string, props: CloudFrontStackProps) {
    super(scope, id, props);

    
    const assetsBucket = new s3.Bucket(this, 'WebsiteAssetsBucket', {
        // websiteErrorDocument: ''
        websiteIndexDocument: 'index.html',
        publicReadAccess: false,
        encryption: s3.BucketEncryption.S3_MANAGED,
    });
    this.assetsBucket = assetsBucket;

    const accessIdentity = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity', {
        comment: `${assetsBucket.bucketName}-access-identity`
    });
    assetsBucket.grantRead(accessIdentity);
    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'CloudFrontWebDistribution', {
        // https://github.com/nideveloper/CDK-SPA-Deploy/blob/master/lib/spa-deploy/spa-deploy-construct.ts#L116
        originConfigs: [
            {
                s3OriginSource: {
                    s3BucketSource: assetsBucket,
                    originAccessIdentity: accessIdentity,
                },
                behaviors: [{
                    isDefaultBehavior: true
                }],
            },
        ],
        errorConfigurations: [
            {
                errorCode: 403,
                responsePagePath: '/index.html',
                responseCode: 200,
            },
            {
                errorCode: 404,
                responsePagePath: '/index.html',
                responseCode: 200,
            }
        ],
        viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(props.certificate, {
            aliases: [props.hostedZone.zoneName]
        }),
    });

    new route53.ARecord(this, 'CloudFrontARecord', {
        zone: props.hostedZone,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });
  }
}