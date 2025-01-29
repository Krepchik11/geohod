#!/bin/bash

while [ ! -f /etc/nginx/certs/fullchain.pem ]; do
  echo "Waiting for certificates..."
  sleep 5
done

nginx -g "daemon off;"