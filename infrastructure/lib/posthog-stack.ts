import * as cdk from '@aws-cdk/core';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';

export class PostHogReverseProxyStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create a custom cache policy
        const cachePolicy = new cloudfront.CachePolicy(this, 'OriginCORSCachePolicy', {
            cachePolicyName: 'origin-cors',
            comment: 'Cache policy for origin CORS',
            defaultTtl: cdk.Duration.seconds(0),
            maxTtl: cdk.Duration.seconds(0),
            minTtl: cdk.Duration.seconds(0),
        });

        // Create the CloudFront distribution
        const distribution = new cloudfront.Distribution(this, 'PostHogDistribution', {
            defaultBehavior: {
                origin: new origins.HttpOrigin('us.i.posthog.com'),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                cachePolicy: cachePolicy,
                originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_CUSTOM_ORIGIN,
            },
            additionalBehaviors: {
                '/static/*': {
                    origin: new origins.HttpOrigin('us-assets.i.posthog.com'), // or 'eu-assets.i.posthog.com' for EU
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                    cachePolicy: cachePolicy,
                    originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_CUSTOM_ORIGIN,
                },
            },
        });
    }
}
