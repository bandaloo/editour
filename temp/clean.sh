#!/bin/bash

# delete directories older than 5 days
find ./ -mtime +5 -type d -exec rm -r {} +
