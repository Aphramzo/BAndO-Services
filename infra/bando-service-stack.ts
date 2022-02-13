import * as apigateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cognito from '@aws-cdk/aws-cognito';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';

export enum Env {
  local = 'local',
  prd = 'prd',
}

export type DefaultProcessEnv = {
  ENV_NAME: Env;
  CORS_DOMAIN: string;
  LOG_LEVEL: string;
};

export class BandoServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const {
      ENV_NAME: envName,
      CORS_DOMAIN: corsDomain,
      LOG_LEVEL: logLevel,
    } = process.env as DefaultProcessEnv;
    const accountId = cdk.Stack.of(this).account;
    const region = cdk.Stack.of(this).region;
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

    const api = new apigateway.RestApi(this, `${stackName}-api`, {
      restApiName: `${stackName}-api`,
      description: 'Services to provide images and metadata for brokkandodin',
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      apiKeySourceType: apigateway.ApiKeySourceType.HEADER,
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: [...(corsDomain ? corsDomain.split(',') : ['*'])],
      },
    });

    const defaultLambdaEnvs = {
      corsDomain,
      envName,
      logLevel,
    };

    const getImagesFunction = createFunction(
      this,
      'get-images',
      'getImages',
      `src/handlers/handler.ts`,
      defaultLambdaEnvs,
    );

    const getImagesResource = api.root.resourceForPath(
      '/images/{pageNumber}/{perPage}',
    );
    getImagesResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getImagesFunction, { proxy: true }),
    );

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
