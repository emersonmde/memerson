import * as cdk from '@aws-cdk/core';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as s3 from '@aws-cdk/aws-s3';
import * as lambda from '@aws-cdk/aws-lambda';
import { RemovalPolicy } from '@aws-cdk/core';

export interface PipelineStackProps extends cdk.StackProps {
  readonly autoDeployedStacks?: string[];
  readonly websiteAssetsBucket: s3.Bucket;
  readonly lambdaStackId: string;
  readonly lambdaCode: lambda.CfnParametersCode;
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);


    let autoDeployedStacks: string[] = props.autoDeployedStacks ? props.autoDeployedStacks : [];
    const cdkBuild = new codebuild.PipelineProject(this, 'CdkBuild', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
              'cd infrastructure',
              'npm install',
            ]
          },
          build: {
            commands: [
              'npm run build',
              'npm run cdk synth -- -o dist'
            ],
          },
        },
        artifacts: {
          'base-directory': 'infrastructure/dist',
          files: [
            `${props.lambdaStackId}.template.json`,
            ...autoDeployedStacks.map((stack: string) => `${stack}.template.json`)
          ]
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        computeType: codebuild.ComputeType.SMALL
      },
    });

    const lambdaBuild = new codebuild.PipelineProject(this, 'LambdaBuild', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
              'cd lambda',
              'npm install',
            ],
          },
          build: {
            commands: 'npm run build',
          },
        },
        artifacts: {
          'base-directory': 'lambda',
          files: [
            'index.js',
            'node_modules/**/*',
          ],
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
      },
    });

    const reactBuildProject = new codebuild.PipelineProject(this, 'ReactBuild', {
      buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        computeType: codebuild.ComputeType.SMALL
      }
    })

    const artifactBucket = new s3.Bucket(this, 'MemersonPipelineArtifactBucket', {
      removalPolicy: RemovalPolicy.DESTROY
    })


    const sourceOutput = new codepipeline.Artifact();
    const reactBuildOutput = new codepipeline.Artifact('ReactBuildOutput');
    const cdkBuildOutput = new codepipeline.Artifact('CDKBuildOutput');
    const lambdaBuildOutput = new codepipeline.Artifact('LambdaBuildOutput');


    // https://docs.aws.amazon.com/cdk/latest/guide/codepipeline_example.html
    const pipeline = new codepipeline.Pipeline(this, 'CodePipeline', {
      pipelineName: 'MakeItSo',
      artifactBucket: artifactBucket,
    });

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new codepipeline_actions.GitHubSourceAction({
          actionName: 'GitHubSource',
          owner: 'emersonmde',
          repo: 'memerson',
          oauthToken: cdk.SecretValue.secretsManager("github-access-token", {
            jsonField: "github-access-token",
          }),
          output: sourceOutput,
          branch: 'main',
        }),
      ],
    });

    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'React',
          project: reactBuildProject,
          input: sourceOutput,
          outputs: [reactBuildOutput]
        }),
        new codepipeline_actions.CodeBuildAction({
          actionName: 'Lambda',
          project: lambdaBuild,
          input: sourceOutput,
          outputs: [lambdaBuildOutput],
        }),
        new codepipeline_actions.CodeBuildAction({
          actionName: 'CDK',
          project: cdkBuild,
          input: sourceOutput,
          outputs: [cdkBuildOutput],
        }),
      ],
    });

    pipeline.addStage({
      stageName: 'DeployPipeline',
      actions: [
        new codepipeline_actions.CloudFormationCreateUpdateStackAction({
          actionName: 'Pipeline',
          templatePath: cdkBuildOutput.atPath(`${id}.template.json`),
          stackName: id,
          adminPermissions: true,
        }),
      ]
    });

    const cdkDeployStage = pipeline.addStage({
      stageName: 'DeployCDK',
      actions: [
        new codepipeline_actions.CloudFormationCreateUpdateStackAction({
          actionName: 'LambdaStack',
          templatePath: cdkBuildOutput.atPath('MemersonLambdaStack.template.json'),
          stackName: 'MemersonLambdaStack',
          adminPermissions: true,
          parameterOverrides: {
            ...props.lambdaCode.assign(lambdaBuildOutput.s3Location),
          },
          extraInputs: [lambdaBuildOutput],
        }),
      ]
    });

    autoDeployedStacks.forEach((stack: string) => {
      cdkDeployStage.addAction(new codepipeline_actions.CloudFormationCreateUpdateStackAction({
        actionName: `${stack}Stack`,
        templatePath: cdkBuildOutput.atPath(`${stack}.template.json`),
        stackName: stack,
        adminPermissions: true,
      }));
    });

    pipeline.addStage({
      stageName: 'DeployReact',
      actions: [
        new codepipeline_actions.S3DeployAction({
          actionName: 'DeployReact',
          input: reactBuildOutput,
          bucket: props.websiteAssetsBucket
        }),
      ]
    });
  }
}