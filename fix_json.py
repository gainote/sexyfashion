input_path = "images/2025_06_18/data.json"


import json
import os

with open(input_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for i in range(len(data['images'])):
    data['images'][i]['filename'] = input_path.replace("data.json","") + data['images'][i]['filename']
    data['images'][i]['thumb_path'] = data['images'][i]['filename'].replace('.webp', '_thumb.webp')


with open(input_path, "w") as f:
    json.dump(data, f, indent=2)