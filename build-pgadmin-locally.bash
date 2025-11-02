#! /bin/bash
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi
DOCKER_IMAGE_NAME=dpage/pgadmin4
docker run -p 5050:80 \
    -e 'PGADMIN_DEFAULT_EMAIL='$PGADMIN_DEFAULT_EMAIL'' \
    -e 'PGADMIN_DEFAULT_PASSWORD='$PGADMIN_DEFAULT_PASSWORD'' \
    -d $DOCKER_IMAGE_NAME