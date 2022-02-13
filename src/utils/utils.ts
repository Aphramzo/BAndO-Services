import * as AWSXRay from 'aws-xray-sdk-core';
import { APIGatewayProxyResult } from 'aws-lambda';
import Debug from 'debug';
const logger = Debug('utils');
AWSXRay.captureHTTPsGlobal(require('http'), false); // eslint-disable-line @typescript-eslint/no-var-requires
AWSXRay.captureHTTPsGlobal(require('https'), false); // eslint-disable-line @typescript-eslint/no-var-requires

export async function asyncHandlerWithStatus<T>(
  event: T,
  method: (event: T) => Promise<APIGatewayProxyResult>,
): Promise<APIGatewayProxyResult> {
  try {
    AWSXRay.capturePromise();
    const result = await method(event);
    logger.debug('result', result);
    return result;
  } catch (e: any) {
    logger.console.error(e);
    // if we return a status code in the 400's, return it to the user instead of throwing
    if (e.statusCode && e.statusCode < 500) {
      return e;
    }
    throw e;
  }
}
