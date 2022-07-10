import json
import logging
import socket
from collections import defaultdict

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)
ec2 = boto3.client('ec2')

PORT_TEST_TIMEOUT = 2


def server_status_handler(event, context):
    logger.info(f'Event: {event}')
    response_headers = {
        "Access-Control-Allow-Headers": 'Content-Type',
        "Access-Control-Allow-Origin": event['headers'].get(
            'origin') or 'https://memerson.dev, http://localhost:3000',
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
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
        return {
            'statusCode': 500,
            'headers': response_headers,
            'body': json.dumps({
                'error': f'Error: {str(e)}'
            })
        }


def get_instances():
    response = ec2.describe_instances()
    instances = []
    for reservation in response['Reservations']:
        if "Instances" not in reservation or not reservation["Instances"]:
            break
        for instance in reservation["Instances"]:
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
    logger.info(f"Instances: {response}")
    return instances


def is_minecraft_running(host: str) -> bool:
    return is_port_open(host, 25565)


def is_bedrock_running(host: str) -> bool:
    return is_port_open(host, 19132, socket.SOCK_DGRAM)


def is_port_open(host: str, port: int, socket_type: int = socket.SOCK_STREAM) -> bool:
    sock = socket.socket(socket.AF_INET, socket_type)
    sock.settimeout(PORT_TEST_TIMEOUT)
    connect_result = sock.connect_ex((host, port))
    if connect_result == 0:
        # success
        return True
    else:
        # fail
        return False
