import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import {Effect} from '@aws-cdk/aws-iam';

export class GlacierStack extends cdk.Stack {
  readonly glacierBackupUser: iam.User;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.glacierBackupUser = new iam.User(this, 'GlacierBackup', {
      userName: 'GlacierBackup',

    });

    this.glacierBackupUser.attachInlinePolicy(new iam.Policy(this, 'SynologyGlacier', {
      statements: [
        new iam.PolicyStatement({
          sid: 'SynologyGlacierBackup',
          effect: Effect.ALLOW,
          actions: [
            "glacier:InitiateJob",
            "glacier:AbortMultipartUpload",
            "glacier:GetVaultAccessPolicy",
            "glacier:CreateVault",
            "glacier:ListTagsForVault",
            "glacier:DescribeVault",
            "glacier:AddTagsToVault",
            "glacier:GetJobOutput",
            "glacier:ListParts",
            "glacier:GetVaultNotifications",
            "glacier:DescribeJob",
            "glacier:ListJobs",
            "glacier:ListMultipartUploads",
            "glacier:CompleteMultipartUpload",
            "glacier:InitiateMultipartUpload",
            "glacier:UploadMultipartPart",
            "glacier:UploadArchive",
            "glacier:GetVaultLock",
            "glacier:DeleteArchive"
          ],
          resources: [`arn:aws:glacier:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:vaults/Synology_*`],
        }),
        new iam.PolicyStatement({
          sid: 'SynologyGlacierList',
          effect: Effect.ALLOW,
          actions: [
            "glacier:GetDataRetrievalPolicy",
            "glacier:ListVaults",
            "glacier:ListProvisionedCapacity"
          ],
          resources: ['*']
        })
      ]
    }));
  }
}