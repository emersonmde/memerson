import * as cdk from '@aws-cdk/core';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as s3 from '@aws-cdk/aws-s3';
import { RemovalPolicy } from '@aws-cdk/core';

export interface PipelineStackProps extends cdk.StackProps {
  autoDeployedStacks?: string[];
  websiteAssetsBucket: s3.Bucket;
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    let autoDeployedStacks: string[] = [id];
    if (props.autoDeployedStacks) {
      autoDeployedStacks.push.apply(autoDeployedStacks, props.autoDeployedStacks);
    }

    // const cdkBuild = new codebuild.PipelineProject(this, 'CdkBuild', {
    //   buildSpec: codebuild.BuildSpec.fromObject({
    //     version: '0.2',
    //     phases: {
    //       install: {
    //         commands: [
    //             'cd infrastructure',
    //             'npm install',
    //         ]
    //       },
    //       build: {
    //         commands: [
    //           'npm run build',
    //           'npm run cdk synth -- -o dist'
    //         ],
    //       },
    //     },
    //     artifacts: {
    //       'base-directory': 'infrastructure/dist',
    //       files: autoDeployedStacks.map((stack: string) => stack + '.template.json')
    //       // files: [
    //       //   'MemersonAmplifyStack.template.json',
    //       //   'MemersonRoute53Stack.template.json',
    //       // ],
    //     },
    //   }),
    //   environment: {
    //     buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
    //       computeType: codebuild.ComputeType.SMALL
    //   },
    // });

    const reactBuildProject = new codebuild.PipelineProject(this, 'reactBuild', {
      buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        computeType: codebuild.ComputeType.SMALL
      }
    })

    const artifactBucket = new s3.Bucket(this, 'reactPipelineArtifactBucket', {
      removalPolicy: RemovalPolicy.DESTROY
    })


    const sourceOutput = new codepipeline.Artifact();
    // const cdkBuildOutput = new codepipeline.Artifact('CdkBuildOutput');
    const reactBuildOutput = new codepipeline.Artifact('ReactBuildOutput');


    // https://docs.aws.amazon.com/cdk/latest/guide/codepipeline_example.html
    const pipeline = new codepipeline.Pipeline(this, 'CodePipeline', {
      pipelineName: 'MakeItSo',
      artifactBucket: artifactBucket,
    });

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new codepipeline_actions.GitHubSourceAction({
          actionName: 'GitHub_Source',
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
          actionName: 'ReactBuild',
          project: reactBuildProject,
          input: sourceOutput,
          outputs: [reactBuildOutput]
        }),
        //   new codepipeline_actions.CodeBuildAction({
        //     actionName: 'Lambda_Build',
        //     project: lambdaBuild,
        //     input: sourceOutput,
        //     outputs: [lambdaBuildOutput],
        //   }),

        // new codepipeline_actions.CodeBuildAction({
        //   actionName: 'CDK_Build',
        //   project: cdkBuild,
        //   input: sourceOutput,
        //   outputs: [cdkBuildOutput],
        // }),
      ],
    });

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [
        new codepipeline_actions.S3DeployAction({
          actionName: 'DeployReactApp',
          input: reactBuildOutput,
          bucket: props.websiteAssetsBucket
      })
      ]
    });

    // const deployStage = pipeline.addStage({
    //   stageName: 'Deploy',
    // });

    // autoDeployedStacks.forEach((stack: string) => {
    //   deployStage.addAction(new codepipeline_actions.CloudFormationCreateUpdateStackAction({
    //     actionName: stack + '_CFN_Deploy',
    //     templatePath: cdkBuildOutput.atPath(stack + '.template.json'),
    //     stackName: stack,
    //     adminPermissions: true,
    //   }));
    // });
  }
}