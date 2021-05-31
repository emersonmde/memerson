import * as cdk from '@aws-cdk/core';
import * as amplify from "@aws-cdk/aws-amplify";
import * as route53 from '@aws-cdk/aws-route53';

export interface MemersonAmplifyStackProps extends cdk.StackProps {
  hostedZone: route53.PublicHostedZone;
}

export class MemersonAmplifyStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: MemersonAmplifyStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const amplifyApp = new amplify.App(this, "memerson", {
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: "emersonmde",
        repository: "memerson",
        oauthToken: cdk.SecretValue.secretsManager("github-access-token", {
          jsonField: "github-access-token",
        }),
      }),
    });
    const mainBranch = amplifyApp.addBranch("main");

    const domain = new amplify.Domain(this, "memerson-domain", {
      app: amplifyApp,
      domainName: props.hostedZone.zoneName,
    });
    domain.mapRoot(mainBranch)

  }
}
