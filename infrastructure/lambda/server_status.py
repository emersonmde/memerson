import json
import logging
from collections import defaultdict

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)
ec2 = boto3.client('ec2')



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
        'body': {
            # TODO: "Object of type datetime is not JSON serializable"
            'servers': json.dumps(server_status(), default=str)
        }
    }
    logger.info(f'Response: {response}')
    return response


def server_status():
    response = ec2.describe_instances()
    logger.info(f"Instances: {response}")
    return response