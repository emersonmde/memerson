#!/usr/bin/env python3

import os
import boto3
import sys
from botocore.exceptions import ClientError
from PIL import Image

if len(sys.argv) < 3:
    print('./photo_upload.py bucket-name /path/to/photos')
    sys.exit()

bucket_name = sys.argv[1]
base_path = sys.argv[2]
photo_file_names = [f for f in os.listdir(base_path) if os.path.isfile(os.path.join(base_path, f)) and f.endswith('.jpg')]
photo_paths = list(map(lambda f: os.path.join(base_path, f), photo_file_names))

s3 = boto3.client('s3')
for photo_path in photo_paths:
    photo = Image.open(photo_path)
    
    width = photo.width
    height = photo.height
    filename = os.path.basename(photo_path)
    metadata = {
        'Metadata': {
            'height': str(photo.height),
            'width': str(photo.width) 
        }
    }
    print(f'Uploading file {photo_path}, {bucket_name}, {filename}, {metadata}')
    try:
        s3.upload_file(photo_path, bucket_name, filename, ExtraArgs=metadata)
    except ClientError as e:
        print(e)

    