import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as iam from '@aws-cdk/aws-iam';

export class CognitoStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const userPool = new cognito.UserPool(this, 'UserPool', {
            userPoolName: 'memerson-net-user-pool',
            selfSignUpEnabled: true,
            signInAliases: {
                email: true,
            },
            autoVerify: {
                email: true,
            },
            standardAttributes: {
                givenName: {
                    required: true,
                    mutable: true,
                },
                familyName: {
                    required: true,
                    mutable: true,
                },
            },
            customAttributes: {
                country: new cognito.StringAttribute({ mutable: true }),
                city: new cognito.StringAttribute({ mutable: true }),
                isAdmin: new cognito.StringAttribute({ mutable: true }),
            },
            passwordPolicy: {
                minLength: 6,
                requireLowercase: true,
                requireDigits: true,
                requireUppercase: false,
                requireSymbols: false,
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });

        const standardCognitoAttributes = {
            givenName: true,
            familyName: true,
            email: true,
            emailVerified: true,
            address: true,
            birthdate: true,
            gender: true,
            locale: true,
            middleName: true,
            fullname: true,
            nickname: true,
            phoneNumber: true,
            phoneNumberVerified: true,
            profilePicture: true,
            preferredUsername: true,
            profilePage: true,
            timezone: true,
            lastUpdateTime: true,
            website: true,
        };

        const clientReadAttributes = new cognito.ClientAttributes()
            .withStandardAttributes(standardCognitoAttributes)
            .withCustomAttributes(...['country', 'city', 'isAdmin']
        );

        const clientWriteAttributes = new cognito.ClientAttributes()
            .withStandardAttributes({
                ...standardCognitoAttributes,
                emailVerified: false,
                phoneNumberVerified: false,
            })
            .withCustomAttributes(...['country', 'city']
        );

        const userPoolClient = new cognito.UserPoolClient(this, 'MemersonUserPoolClient', {
            userPool,
            authFlows: {
                adminUserPassword: true,
                custom: true,
                userSrp: true,
            },
            supportedIdentityProviders: [
                cognito.UserPoolClientIdentityProvider.COGNITO
            ],
            readAttributes: clientReadAttributes,
            writeAttributes: clientWriteAttributes,
        });

        const identityPool = new cognito.CfnIdentityPool(this, 'MemersonIdentityPool', {
            identityPoolName: 'memerson-net-identity-pool',
            allowUnauthenticatedIdentities: true,
            cognitoIdentityProviders: [
              {
                  clientId: userPoolClient.userPoolClientId,
                  providerName: userPool.userPoolProviderName,
              },
            ],
          });

          const unauthenticatedRole = new iam.Role(this, 'MemersonUnauthenticatedRole', {
              description: 'Default role for unauthenticated users',
              assumedBy: new iam.FederatedPrincipal(
                'cognito-identity.amazonaws.com',
                {
                  StringEquals: {
                    'cognito-identity.amazonaws.com:aud': identityPool.ref,
                  },
                  'ForAnyValue:StringLike': {
                    'cognito-identity.amazonaws.com:amr': 'unauthenticated',
                  },
                },
                'sts:AssumeRoleWithWebIdentity',
              ),
            },
          );
        
        const authenticatedRole = new iam.Role(this, 'MemersonAuthenticatedRole', {
          description: 'Default role for authenticated users',
          assumedBy: new iam.FederatedPrincipal(
            'cognito-identity.amazonaws.com',
            {
              StringEquals: {
                'cognito-identity.amazonaws.com:aud': identityPool.ref,
              },
              'ForAnyValue:StringLike': {
                'cognito-identity.amazonaws.com:amr': 'authenticated',
              },
            },
            'sts:AssumeRoleWithWebIdentity',
          ),
        //   managedPolicies: [
        //     iam.ManagedPolicy.fromAwsManagedPolicyName(
        //       'service-role/AWSLambdaBasicExecutionRole',
        //     ),
        //   ],
        });

        new cognito.CfnIdentityPoolRoleAttachment(
            this,
            'IdentityPoolRoleAttachment',
            {
              identityPoolId: identityPool.ref,
              roles: {
                authenticated: authenticatedRole.roleArn,
                unauthenticated: unauthenticatedRole.roleArn,
              },
              roleMappings: {
                mapping: {
                  type: 'Token',
                  ambiguousRoleResolution: 'AuthenticatedRole',
                  identityProvider: `cognito-idp.${
                    cdk.Stack.of(this).region
                  }.amazonaws.com/${userPool.userPoolId}:${
                    userPoolClient.userPoolClientId
                  }`,
                },
              },
            },
          );
          
        


    }
}