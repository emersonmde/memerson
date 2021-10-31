import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  console.log('This function can be invoked by anyone');
  console.log('event', JSON.stringify(event, null, 2));

  return {body: JSON.stringify({message: 'SUCCESS'}), statusCode: 200};
}

