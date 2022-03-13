#!/usr/bin/env python3
import logging
import os
import re
from io import BytesIO

import boto3
from PIL import Image

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

IMAGE_SIZES = [(1920, 1920), (1280, 1280), (640, 640)]
s3 = boto3.client('s3')


def resize_photo(source_bucket, source_key, destination_bucket):
    logger.info(f'Resizing image: {source_bucket}:{source_key}')

    key, extension = os.path.splitext(source_key)
    photo_object = s3.get_object(Bucket=source_bucket, Key=source_key)
    photo_buffer = BytesIO(photo_object['Body'].read())

    image = Image.open(photo_buffer)
    width = image.width
    height = image.height
    s3.put_object(
        Body=photo_buffer,
        Bucket=destination_bucket,
        Key=f'{key}/{width}x{height}_full{extension}'
    )
    photo_buffer.seek(0)

    for size in IMAGE_SIZES:
        temp_buffer = BytesIO()
        image = Image.open(photo_buffer)
        image.thumbnail(size, Image.ANTIALIAS)
        image.save(temp_buffer, format=image.format)
        temp_buffer.seek(0)

        width = image.width
        height = image.height
        s3.put_object(
            Body=temp_buffer,
            Bucket=destination_bucket,
            # TODO: add size identifiers to filename (ie small/medium/large or percentages)
            Key=f'{key}/{width}x{height}{extension}'
        )


def resize_photo_handler(event, context):
    logger.info(f'Event: {event}')

    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key']
        resize_photo(bucket, re.sub(r'^/public', '', key), 'memerson-public-photos')
