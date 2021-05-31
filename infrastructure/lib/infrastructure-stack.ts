import * as cdk from '@aws-cdk/core';
import * as amplify from "@aws-cdk/aws-amplify";


export class MemersonInfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const amplifyApp = new amplify.App(this, "memerson-amplify-app ", {
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: "emersonmde",
        repository: "memerson",
        oauthToken: cdk.SecretValue.secretsManager("github-access-token", {
          jsonField: "github-access-token",
        }),
      }),
    });
    const masterBranch = amplifyApp.addBranch("main");

  }
}
