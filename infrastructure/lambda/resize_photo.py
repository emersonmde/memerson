#!/usr/bin/env python3

import logging
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


def resize_photo(event, context):
    logger.info(f'Event: {event}')