#!/usr/bin/env python3

import logging
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


def resize_photo(event, context):
    logger.info(f'Event: {event}')

    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key']
        logger.info(f'Resizing image: {bucket}:{key}')
