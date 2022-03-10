#!/usr/bin/env python3
import logging
import os
from io import BytesIO

import boto3
from PIL import Image

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


def resize_photo(source_bucket, source_key, destination_bucket):
    logger.info(f'Resizing image: {source_bucket}:{source_key}')

    buffer = BytesIO()
    s3 = boto3.client('s3')
    photo_object = s3.get_object(Bucket=source_bucket, key=source_key)
    photo = photo_object['Body'].read()

    image = Image.open(BytesIO(photo))
    size = 1200, 1200
    image.thumbnail(size, Image.ANTIALIAS)
    image.save(buffer, format=image.format)
    buffer.seek(0)

    key, extension = os.path.splitext(source_key)

    width = image.width
    height = image.height
    response = s3.put_object(
        Body=buffer,
        Bucket=destination_bucket,
        # TODO: Remove 20% attribute after updating list-photos
        Key=f'{key}-20_{width}x{height}{extension}'
    )


def resize_photo_handler(event, context):
    logger.info(f'Event: {event}')

    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key']
        resize_photo(bucket, key, 'memerson-public-photos')
