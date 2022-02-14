import * as apigateway from '@aws-cdk/aws-apigatewayv2';
import * as apiGatewayAuthorizers from '@aws-cdk/aws-apigatewayv2-authorizers';
import * as apiGatewayIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cognito from '@aws-cdk/aws-cognito';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';
import { CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2';

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

    new cognito.UserPool(this, `${stackName}-userPool`, {
      // ...
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: 'Verify your email for Brokk and Odin',
        emailBody: 'Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
        smsMessage: 'Your verification code is {####}',
      },
      signInAliases: {
        username: true,
        email: true,
        phone: true,
      },
    });

    // const authorizer = new apiGatewayAuthorizers.HttpUserPoolAuthorizer(
    //   'user-pool-authorizer',
    //   userPool,
    //   {
    //     userPoolClients: [userPoolClient],
    //     identitySource: ['$request.header.Authorization'],
    //   },
    // );

    const api = new apigateway.HttpApi(this, `${stackName}-api`, {
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

    // const getImagesResource = api.root.resourceForPath(
    //   '/images/{pageNumber}/{perPage}',
    // );
    // getImagesResource.addMethod(
    //   'GET',
    //   new apigateway.LambdaIntegration(getImagesFunction, { proxy: true }),
    // );

    api.addRoutes({
      integration: new apiGatewayIntegrations.HttpLambdaIntegration(
        'getImagesIntegration',
        getImagesFunction,
      ),
      path: '/images/{pageNumber}/{perPage}',
    });

    new cdk.CfnOutput(this, 'apiUrl', { value: api.url });

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
