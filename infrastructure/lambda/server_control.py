import json
import logging

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)
ec2 = boto3.client('ec2')


def server_control_handler(event, context):
    """
    Handles API Gateway event for /server_status

    Example:
    {
      "path": "/server_status",
      "httpMethod": "POST",
      "isBase64Encoded": true,
      "queryStringParameters": {
        "action": "start" | "stop",
        "instance_id": "<ec2_instance_id>"
      },
    }
    :param event: API Gateway Event, requires queryStringParamters with action ('start' or 'stop')
        and the EC2 instance_id
    :param context: Lambda context
    :return: Response from start_instance or stop_instance
    """
    logger.info(f'Event: {event}')
    response_headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': event['headers'].get(
            'origin') or 'https://memerson.dev, http://localhost:3000',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    }
    try:
        if 'queryStringParameters' not in event or event['queryStringParameters'] is None:
            return {
                'statusCode': 400,
                'headers': response_headers,
                'body': json.dumps({'error': f'Must provide action and instance_id'})
            }

        action = event['queryStringParameters'].get('action')
        instance_id = event['queryStringParameters'].get('instance_id')

        if action is None or action == '' or instance_id is None or instance_id == '':
            return {
                'statusCode': 400,
                'headers': response_headers,
                'body': json.dumps({'error': f'Must provide action and instance_id'})
            }

        if action == 'stop':
            result = stop_instance(event['queryStringParameters']['instance_id'])
        elif action == 'start':
            result = start_instance(event['queryStringParameters']['instance_id'])
        else:
            return {
                'statusCode': 400,
                'headers': response_headers,
                'body': json.dumps({'error': f'Unknown action: {action}'})
            }

        response = {
            'statusCode': 200,
            'headers': response_headers,
            'body': json.dumps({
                'servers': result
            })
        }
        logger.info(f'Response: {response}')
        return response
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': response_headers,
            'body': json.dumps({
                'error': f'Error: {str(e)}'
            })
        }

def stop_instance(instancei_id: str):
    """
    Call stop_instance() for an EC2 instance_id

    :param instancei_id: Instance ID
    :return: stop_instance() response
    """
    response = ec2.stop_instances(
        InstanceIds=[instancei_id],
    )
    logger.info(f'Stop Instances: {response}')
    return response


def start_instance(instancei_id: str):
    """
    Call stop_instance() for an EC2 instance_id

    :param instancei_id: Instance ID
    :return: stop_instance() response
    """
    response = ec2.start_instances(
        InstanceIds=[instancei_id],
    )
    logger.info(f'Start Instances: {response}')
    return response
