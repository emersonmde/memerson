import * as lambda_nodejs from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import { join } from 'path';

export interface S3StackProps extends cdk.StackProps {
    readonly unauthenticatedRole: iam.Role;
    readonly authenticatedRole: iam.Role;
}

export class S3Stack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: S3StackProps) {
        super(scope, id, props);

        const photosBucket = new s3.Bucket(this, 'MemersonPhotos', {
            bucketName: 'memerson-photos',
            cors: [
                {
                    allowedMethods: [
                        s3.HttpMethods.GET,
                        s3.HttpMethods.POST,
                        s3.HttpMethods.PUT,
                        s3.HttpMethods.HEAD,
                        s3.HttpMethods.DELETE,
                    ],
                    allowedOrigins: ['*'],
                    allowedHeaders: ['*'],
                    exposedHeaders: [
                        'x-amz-server-side-encryption',
                        'x-amz-request-id',
                        'x-amz-id-2',
                        'ETag',
                    ],
                    maxAge: 3000
                },
            ],

        })

        photosBucket.grantRead(props.unauthenticatedRole);
        photosBucket.grantReadWrite(props.authenticatedRole);
    }
}