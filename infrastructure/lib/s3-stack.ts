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

        })

        photosBucket.grantReadWrite(props.unauthenticatedRole);
        photosBucket.grantReadWrite(props.authenticatedRole);
    }
}