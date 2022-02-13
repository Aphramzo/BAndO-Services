import { APIGatewayEvent } from 'aws-lambda';

export interface GetImagesHandlerPath {
  perPage: number;
  pageNumber: number;
}

export type HandlerEvent<
  P = unknown,
  Q = unknown,
  B = unknown,
  H = unknown,
> = APIGatewayEvent & {
  pathParameters: P;
  queryStringParameters: Q;
  body: B;
  headers: H;
};
