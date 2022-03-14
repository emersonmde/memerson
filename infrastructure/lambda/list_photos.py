import json
import logging
import re
from collections import defaultdict

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client('s3')
BUCKET = 'memerson-public-photos'


def list_photos_handler(event, context):
    logger.info(f'Event: {event}')
    headers = {
        "Access-Control-Allow-Headers": 'Content-Type',
        "Access-Control-Allow-Origin": event['headers'].get(
            'origin') or 'https://memerson.net, http://localhost:3000',
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }

    try:
        photos = list_photos()
        response = {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(photos)
        }
        logger.info(f'Response: {response}')
        return response
    except Exception as e:
        logger.error(f'Error listing photos: {e}')
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'message': e})
        }


def s3_url(bucket, *args):
    return f"https://{bucket}.s3.amazonaws.com/{'/'.join(args)}"


def get_dimensions(url):
    r = re.search(r'([\d]+)x([\d]+)', url)
    if not r:
        return 0, 0
    width = int(r.group(1))
    height = int(r.group(2))
    return width, height


def list_photos():
    s3_response = s3.list_objects_v2(Bucket=BUCKET)
    contents = s3_response.get('Contents', [])
    photo_keys = defaultdict(list)
    for k, v in (obj.get('Key').rsplit('/', 1) for obj in contents if obj.get('Key')):
        photo_keys[k].append(v)
    logger.info(f'Photo keys: {photo_keys}')
    photos = []
    for k, v in photo_keys.items():
        v.sort(key=lambda i: get_dimensions(i)[0])
        width, height = get_dimensions(v[0])
        photos.append({
            'src': s3_url(BUCKET, k, v[0]),
            'srcSet': [s3_url(BUCKET, k, f'{photo} {i + 1}x') for i, photo in enumerate(v)],
            # 'sizes': [],
            'width': width,
            'height': height,
        })
    return photos
