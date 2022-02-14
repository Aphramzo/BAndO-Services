import * as apigateway from '@aws-cdk/aws-apigatewayv2';
import * as apiGatewayAuthorizers from '@aws-cdk/aws-apigatewayv2-authorizers';
import * as apiGatewayIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cognito from '@aws-cdk/aws-cognito';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';
import { CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { UserPoolEmail } from '@aws-cdk/aws-cognito';

export enum Env {
  local = 'local',
  prd = 'prd',
}

export type DefaultProcessEnv = {
  ENV_NAME: Env;
  CORS_DOMAIN: string;
  LOG_LEVEL: string;
  FLICKR_USER: string;
  FLICKR_API_KEY: string;
};

export class BandoServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const {
      ENV_NAME: envName,
      CORS_DOMAIN: corsDomain,
      LOG_LEVEL: logLevel,
      FLICKR_USER,
      FLICKR_API_KEY,
    } = process.env as DefaultProcessEnv;
    const stackName = `${envName}-bando-service`;

    const userPool = new cognito.UserPool(this, `${stackName}-up`, {
      // ...
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: 'Verify your email for Brokk and Odin',
        emailBody: 'Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
        smsMessage: 'Your verification code is {####}',
      },
      signInAliases: {
        email: true,
        phone: true,
      },
      email: cognito.UserPoolEmail.withCognito('im.t.wal@gmail.com'),
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
        phoneNumber: {
          required: false,
          mutable: true,
        },
      },
    });

    new cognito.CfnUserPoolDomain(this, `${stackName}-upDomain`, {
      userPoolId: userPool.userPoolId,
      domain: stackName,
    });

    const userPoolClient = new cognito.UserPoolClient(
      this,
      `${stackName}-userPoolClient`,
      {
        userPool,
        authFlows: {
          userPassword: true,
        },
        supportedIdentityProviders: [
          cognito.UserPoolClientIdentityProvider.COGNITO,
        ],
      },
    );

    const authorizer = new apiGatewayAuthorizers.HttpUserPoolAuthorizer(
      `${stackName}-authorizer`,
      userPool,
      {
        userPoolClients: [userPoolClient],
        identitySource: ['$request.header.Authorization'],
      },
    );

    const api = new apigateway.HttpApi(this, `${stackName}-api2`, {
      apiName: `${stackName}-api`,
      description: 'Services to provide images and metadata for brokkandodin',
      corsPreflight: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.OPTIONS],
        allowCredentials: true,
        allowOrigins: [...(corsDomain ? corsDomain.split(',') : ['*'])],
      },
    });

    const defaultLambdaEnvs = {
      corsDomain,
      envName,
      logLevel,
      FLICKR_USER,
      FLICKR_API_KEY,
    };

    const getImagesFunction = createFunction(
      this,
      'get-images',
      'getImages',
      `src/handlers/handler.ts`,
      defaultLambdaEnvs,
    );

    api.addRoutes({
      integration: new apiGatewayIntegrations.HttpLambdaIntegration(
        'getImagesIntegration',
        getImagesFunction,
      ),
      path: '/images/{pageNumber}/{perPage}',
      authorizer,
    });

    new cdk.CfnOutput(this, 'apiUrl', { value: api.url || '' });

    function createFunction(
      stack: cdk.Stack,
      name: string,
      handler: string,
      entry: string,
      env: Object,
    ): NodejsFunction {
      return new NodejsFunction(stack, name, {
        memorySize: 1024,
        timeout: cdk.Duration.seconds(15),
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: handler,
        entry: entry,
        environment: env as Record<string, string>,
      });
    }
  }
}
