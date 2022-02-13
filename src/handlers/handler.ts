import { APIGatewayProxyResult } from 'aws-lambda';
import Debug from 'debug';
import { asyncHandlerWithStatus } from '../utils/utils';
import { GetImagesHandlerPath, HandlerEvent } from '../models/handlers';
const logger = Debug('handler');
type GetImagesHandlerProps = HandlerEvent<GetImagesHandlerPath>;

async function asyncGetImages(
  event: GetImagesHandlerProps,
): Promise<APIGatewayProxyResult> {
  logger.debug('in asyncGetImages handler');

  const { perPage, pageNumber } = event.pathParameters;

  logger.info('Looking up images for ', perPage, pageNumber);

  return { statusCode: 200 };
}

export async function getImages(
  event: GetImagesHandlerProps,
): Promise<APIGatewayProxyResult> {
  return asyncHandlerWithStatus<GetImagesHandlerProps>(event, asyncGetImages);
}
