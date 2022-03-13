import logging

import boto3


logger = logging.getLogger()
logger.setLevel(logging.INFO)

def list_photos_handler(event, context):
    logger.info(f'Event: {event}')

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : 'Content-Type',
            "Access-Control-Allow-Origin": event['headers']['origin'] or 'https://memerson.net',
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
    }