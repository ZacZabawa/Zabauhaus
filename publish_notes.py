import json
import os

# Path to the flat JSON file
json_file_path = "notes_flat.json"

# Path to the Jekyll posts directory
posts_dir = "_posts/"

# Load the data from the JSON file
with open(json_file_path, 'r') as f:
    data = json.load(f)

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
                    portfolio_images = child.get("portfolioimages", "")
                    
                    # Convert datetime to a format suitable for Jekyll filenames
                    date_str = datetime_create.split('T')[0]
                    
                    # Create the filename for the post
                    filename = os.path.join(posts_dir, f"{date_str}-{id}.md")
                    
                    # Write the post content to the file
                    with open(filename, 'w') as post_file:
                        post_file.write(f"---\n")
                        post_file.write(f"title: {title}\n")
                        post_file.write(f"date: {datetime_create}\n")
                        post_file.write(f"last_modified_at: {datetime_update}\n")
                        post_file.write(f"subheader: {subheader}\n")
                        post_file.write(f"portfolio_images: {portfolio_images}\n")
                        post_file.write(f"---\n\n")
                        post_file.write(f"Content for {title} goes here.\n")

print("Posts generated successfully!")
