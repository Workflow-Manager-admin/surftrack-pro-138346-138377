#!/bin/bash
cd /home/kavia/workspace/code-generation/surftrack-pro-138346-138377/surfsync_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

