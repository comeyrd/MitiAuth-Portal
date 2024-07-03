#!/bin/bash
MARKER_FILE="/usr/vol/volume.mportal.init"
if [ ! -f "$MARKER_FILE" ]; then
    echo "Initializing database for the first time..."
    echo "Running initialization commands..."
    node tools/setupDb.mjs
    touch "$MARKER_FILE"
    echo "Initialization complete."
else
    echo "Initialization already done."
fi
exec "$@"
