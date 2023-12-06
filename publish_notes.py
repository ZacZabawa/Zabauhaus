import json
import os
import re

# Path to the flat JSON file
json_file_path = "notes_flat.json"

# Path to the Jekyll posts directory
posts_dir = "_posts/"

# Path to the attachments directory
attachments_dir = "attachments/"

# Load the data from the JSON file
with open(json_file_path, 'r') as f:
    data = json.load(f)

# Function to replace image references in the body
def replace_image_references(body, title):
    pattern = r"!\[\[(.*?)\]\]"
    def replace_func(match):
        image_name = match.group(1)
        image_path = os.path.join(attachments_dir, image_name)
        return f"![{title} Image]({image_path})"
    return re.sub(pattern, replace_func, body)

# Generate a markdown file for each child node
for grandparent in data:
    if "children" in grandparent:
        for parent in grandparent["children"]:
            if "children" in parent:
                for child in parent["children"]:
                    # Extract relevant data
                    title = child["title"]
                    id = child["id"]
                    datetime_create = child["datetimeCreate"]
                    datetime_update = child["datetimeUpdate"]
                    subheader = child.get("subheader", "")
                    body = child.get("body", "")
                    
                    # Convert datetime to a format suitable for Jekyll filenames
                    date_str = datetime_create.split('T')[0]
                    
                    # Replace image references in the body
                    body = replace_image_references(body, title)

                    # Create the filename for the post
                    filename = os.path.join(posts_dir, f"{date_str}-{id}.md")
                    
                    # Write the post content to the file
                    with open(filename, 'w') as post_file:
                        post_file.write(f"---\n")
                        post_file.write(f"title: {title}\n")
                        post_file.write(f"date: {datetime_create}\n")
                        post_file.write(f"last_modified_at: {datetime_update}\n")
                        post_file.write(f"subheader: {subheader}\n")
                        post_file.write(f"---\n\n")
                        post_file.write(body + "\n")

print("Posts generated successfully!")
