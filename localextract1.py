import os
import json
import re
import yaml

# Path to your Obsidian vault
VAULT_PATH = "C:/Users/zzaba/Obsidian/Zabauhaus"

# Regular expression to extract front matter
FRONT_MATTER_REGEX = re.compile(r'^---\r?\n(.*?)\r?\n---\r?\n', re.DOTALL)


# Extract data from a note


import yaml

# Extract data from a note
def extract_data_from_note(note_path):
    with open(note_path, 'r', encoding='utf-8') as file:
        content = file.read()
        match = FRONT_MATTER_REGEX.match(content)
        if not match:
            print(f"No front matter found in {note_path}")
            return None

        front_matter = match.group(1)
        try:
            note_data = yaml.safe_load(front_matter)
        except yaml.YAMLError as e:
            print(f"Error parsing front matter in {note_path}: {e}")
            return None

        note_data['content'] = content[match.end():].strip()

        return note_data

# Main function
def main():
    all_notes_data = []

    for note_file in os.listdir(VAULT_PATH):
        if note_file.endswith('.md'):
            note_data = extract_data_from_note(os.path.join(VAULT_PATH, note_file))
            if note_data:
                all_notes_data.append(note_data)

    # Save to notes.json
    with open('notes.json', 'w', encoding='utf-8') as file:
        json.dump(all_notes_data, file, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    main()
