import json
import logging
import socket

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)
ec2 = boto3.client('ec2')

PORT_TEST_TIMEOUT = 2


def server_status_handler(event, context):
    """
    Handles API Gateway event for /server_status

    Example:
    {
      "path": "/server_status",
      "httpMethod": "POST",
      "isBase64Encoded": true,
      "queryStringParameters": {
        "key": "value",
      },
    }
    :param event: API Gateway Event
    :param context: Lambda context
    :return: List of servers (EC2 Instances)
        {
            'body': {
                'servers': [
                    {
                        'instance_id': '', # EC2 instance id
                        'state': '', # EC@ instance state
                        'public_dns_name': '', # EC2 default public DNS name
                        'public_ip_address': '', # Public IP address
                        'is_minecraft_running': '', # True if Minecraft Java port is open
                        'is_bedrock_running': '', # True if Minecraft Bedrock port is open
                    }
                ]
            }
    """
    logger.info(f'Event: {event}')
    response_headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': event['headers'].get(
            'origin') or 'https://memerson.dev, http://localhost:3000',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    }

    try:
        response = {
            'statusCode': 200,
            'headers': response_headers,
            'body': json.dumps({
                'servers': get_instances()
            })
        }
        logger.info(f'Response: {response}')
        return response
    except Exception as e:
        # Catch all exceptions to include required headers in the response
        return {
            'statusCode': 500,
            'headers': response_headers,
            'body': json.dumps({
                'error': f'Error: {str(e)}'
            })
        }


def get_instances():
    """
    Gets all EC2 instances using `describe_instances`

    :return: List of server details
    """
    response = ec2.describe_instances()
    instances = []
    for reservation in response['Reservations']:
        if 'Instances' not in reservation or not reservation['Instances']:
            break
        for instance in reservation['Instances']:
            dns_name = instance.get('PublicDnsName')
            ip_address = instance.get('PublicIpAddress')
            instances.append({
                'instance_id': instance['InstanceId'],
                'state': instance['State']['Name'],
                'public_dns_name': dns_name,
                'public_ip_address': ip_address,
                'is_minecraft_running': is_minecraft_running(instance['PublicIpAddress']) if ip_address else False,
                'is_bedrock_running': is_bedrock_running(instance['PublicIpAddress']) if ip_address else False
            })
    logger.info(f'Instances: {response}')
    return instances


def is_minecraft_running(host: str) -> bool:
    """
    Tests if the Minecraft default Java server port is open

    :param host: Target minecraft hostname or IP
    :return: True if the port is open False otherwise
    """
    return is_port_open(host, 25565)


def is_bedrock_running(host: str) -> bool:
    """
    Tests if the Minecraft bedrock server default port is open

    :param host: Target minecraft hostname or IP
    :return: True if the port is open False otherwise
    """
    return is_port_open(host, 19132, socket.SOCK_DGRAM)


def is_port_open(host: str, port: int, socket_type: int = socket.SOCK_STREAM) -> bool:
    """
    Tests if a port is open with a short timeout

    :param host: Target hostname or IP
    :param port: Target port
    :param socket_type: socket.SOCK_STREAM (default) for TCP or socket.SOCK_DGRAM for UDP
    :return: True if the port is open False otherwise
    """
    sock = socket.socket(socket.AF_INET, socket_type)
    sock.settimeout(PORT_TEST_TIMEOUT)
    connect_result = sock.connect_ex((host, port))
    if connect_result == 0:
        # success
        return True
    else:
        # fail
        return False
