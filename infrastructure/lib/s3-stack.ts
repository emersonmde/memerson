import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda-python';
import * as event from '@aws-cdk/aws-lambda-event-sources';
import * as s3 from '@aws-cdk/aws-s3';
import {IBucket} from '@aws-cdk/aws-s3';
import {Runtime} from '@aws-cdk/aws-lambda';
import {join} from 'path';
import {Duration} from "@aws-cdk/core";

export interface S3StackProps extends cdk.StackProps {
  readonly unauthenticatedRole: iam.Role;
  readonly authenticatedRole: iam.Role;
}

export class S3Stack extends cdk.Stack {
  public publicPhotosBucket: IBucket;

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
            'x-amz-meta-height',
            'x-amz-meta-width'
          ],
          maxAge: 3000
        },
      ],

    })

    photosBucket.grantRead(props.unauthenticatedRole);
    photosBucket.grantReadWrite(props.authenticatedRole);

    const resizeLambdaName = "MemersonResize";
    const resizeLambda = new lambda.PythonFunction(this, resizeLambdaName, {
      functionName: resizeLambdaName,
      entry: join(__dirname, '..', 'lambda'),
      index: 'resize_photo.py',
      handler: 'resize_photo_handler',
      runtime: Runtime.PYTHON_3_9,
      timeout: Duration.minutes(2),
      memorySize: 512
    });

    photosBucket.grantReadWrite(resizeLambda);

    resizeLambda.addEventSource(new event.S3EventSource(photosBucket, {
      events: [s3.EventType.OBJECT_CREATED],
      filters: [{prefix: 'public/'}]
    }));

    this.publicPhotosBucket = new s3.Bucket(this, 'MemersonPublicPhotos', {
      bucketName: 'memerson-public-photos',
      publicReadAccess: true
    });

    this.publicPhotosBucket.grantReadWrite(resizeLambda);
  }
}