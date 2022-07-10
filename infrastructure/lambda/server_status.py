import logging

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def server_status_handler(event, context):
    logger.info(f'Event: {event}')
    headers = {
        "Access-Control-Allow-Headers": 'Content-Type',
        "Access-Control-Allow-Origin": event['headers'].get(
            'origin') or 'https://memerson.dev, http://localhost:3000',
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }

    response = {
        'statusCode': 200,
        'headers': headers,
        'body': {'auth_ech': 'scucess'}
    }
    logger.info(f'Response: {response}')
    return response