import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';


export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    console.log('event', JSON.stringify(event, null, 2));

    try {
        console.log('auth_echo');

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers": 'Content-Type',
                "Access-Control-Allow-Origin": event.headers.origin || 'https://memerson.dev',
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({auth_echo: 'scucess'})
        }
    } catch (e: any) {
        return {
            statusCode: 500,
            body: e.message,
        }
    }
}

