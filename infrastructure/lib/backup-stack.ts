import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import {Effect} from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as kms from '@aws-cdk/aws-kms';

export class BackupStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const prefix = 'RivendellBackup';
    const backupUser = new iam.User(this, `${prefix}User`, {
      userName: `${prefix}User`,
    });

    const bucketKey = new kms.Key(this, `${prefix}BucketKey`, {
      enableKeyRotation: true,
      trustAccountIdentities: true,
    })

    const bucket = new s3.Bucket(this, `${prefix}Bucket`, {
      bucketName: `${cdk.Stack.of(this).region}-${cdk.Stack.of(this).account}-${prefix.toLowerCase()}`,
      publicReadAccess: false,
      enforceSSL: true,
      // versioned: true,
      accessControl: s3.BucketAccessControl.LOG_DELIVERY_WRITE,
      serverAccessLogsPrefix: 'access-logs',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: bucketKey,
      lifecycleRules: [
        {
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30),
            },
          ],
        },
      ],
    });

    bucket.grantReadWrite(backupUser)
    bucketKey.grantEncryptDecrypt(backupUser);

    backupUser.attachInlinePolicy(new iam.Policy(this, `${prefix}S3Policy`, {
      statements: [
        new iam.PolicyStatement({
          sid: `${prefix}S3PolicyStatement`,
          effect: Effect.ALLOW,
          actions: [
            's3:GetBucketLocation',
            's3:ListAllMyBuckets'
          ],
          resources: ['*']
        })
      ]
    }));
    new cdk.CfnOutput(this, `${prefix}BucketOutput`, {
      value: bucket.bucketName,
      description: `The name of the ${prefix} bucket`,
      exportName: `${prefix}BucketExport`,
    });
    new cdk.CfnOutput(this, `${prefix}UserOutput`, {
      value: backupUser.userArn,
      description: `The ARN of the ${prefix} user`,
      exportName: `${prefix}UserExport`,
    });
  }
}