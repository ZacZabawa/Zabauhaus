import json
import os
import re

json_file_path = "notes_flat.json"
posts_dir = "_posts/"

def slugify(text):
    return re.sub(r'\W+', '-', text).lower().strip('-')

def generate_post_url(note):
    title_slug = slugify(note["title"])
    function_slug = slugify(note.get("function", "general"))
    return f"/_posts/{function_slug}/{title_slug}.html"

with open(json_file_path, 'r') as f:
    data = json.load(f)

for note in data:
    title = note["title"]
    id = note["id"]
    datetime_create = note["datetimeCreate"]
    datetime_update = note["datetimeUpdate"]
    subheader = note.get("subheader", "")
    body = note.get("body", "")
    post_url = generate_post_url(note)

    date_str = datetime_create.split('T')[0]
    filename = os.path.join(posts_dir, f"{date_str}-{id}.md")

    with open(filename, 'w') as post_file:
        post_file.write(f"---\n")
        post_file.write(f"title: {title}\n")
        post_file.write(f"date: {datetime_create}\n")
        post_file.write(f"last_modified_at: {datetime_update}\n")
        post_file.write(f"subheader: {subheader}\n")
        post_file.write(f"url: {post_url}\n")
        post_file.write(f"---\n\n")
        post_file.write(body + "\n")

print("Posts generated successfully!")
