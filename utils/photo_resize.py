#!/usr/bin/env python3

import os
import sys
from PIL import Image


if len(sys.argv) < 2:
    print('./photo_resize.py /path/to/photos')
    sys.exit()

base_path = sys.argv[1]
photo_file_names = [f for f in os.listdir(base_path) if os.path.isfile(os.path.join(base_path, f)) and f.endswith('.jpg')]
photo_paths = list(map(lambda f: os.path.join(base_path, f), photo_file_names))

for photo_path in photo_paths:
    photo = Image.open(photo_path)
    
    width = photo.width
    height = photo.height
    filename = os.path.basename(photo_path)
    split_filename = os.path.splitext(filename)
    new_filename = f'{split_filename[0]}_{photo.width}x{photo.height}{split_filename[1]}'
    
    print(f'Old filename: {photo_path} new fileame: {os.path.join(base_path, new_filename)}')
    # os.rename(photo_path, os.path.join(base_path, new_filename))
    print('done')
