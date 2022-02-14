import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import Debug from 'debug';
import { asyncHandlerWithStatus } from '../utils/utils';
import { GetRecent } from '../managers/flickrManager';
const logger = Debug('handler');

function getPathParam(e: APIGatewayEvent, param: string): string | undefined {
  return e.pathParameters?.[param];
}

async function asyncGetImages(
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> {
  logger('in asyncGetImages handler');

  const pageNumber = getPathParam(event, 'pageNumber');
  const perPage = getPathParam(event, 'perPage');
  logger('Looking up images for ', perPage, pageNumber);

  const result = await GetRecent(
    parseInt(pageNumber || '1'),
    parseInt(perPage || '20'),
  );
  return { statusCode: 200, body: JSON.stringify(result) };
}

export async function getImages(
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> {
  return asyncHandlerWithStatus(event, asyncGetImages);
}
