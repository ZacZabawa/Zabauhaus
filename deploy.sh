#!/bin/bash

# Paths
OBSIDIAN_PATH="/c/Users/zzaba/obsidian/Zabauhaus"
JEKYLL_POSTS_PATH="/c/Users/zzaba/collusion/_posts"

# Sync Obsidian notes to Jekyll
cp -r "$OBSIDIAN_PATH/"* "$JEKYLL_POSTS_PATH/"

# Build Jekyll site
cd /c/Users/zzaba/collusion/_site
jekyll build

# # Server details
# SERVER_USER="u863410603"
# SERVER_IP="195.35.39.104"
# SERVER_PORT="65002"
# REMOTE_PATH="/path/on/server/where/site/should/be/uploaded"

# # Upload site to server
# rsync -avz -e "ssh -p $SERVER_PORT" /c/Users/zzaba/collusion/jekyll_site/_site/ $SERVER_USER@$SERVER_IP:$REMOTE_PATH/
