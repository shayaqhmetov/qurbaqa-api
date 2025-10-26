#!/bin/bash
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

image_name=${POSTGRES_IMAGE_NAME:-qurbaqa-postgres}

docker build -f ./Dockerfile.postgres -t ${image_name} .

if [ "$(docker ps -q -f name=${image_name})" ]; then
  echo "Postgres container is already running. Stopping and removing..."
  docker stop ${image_name}
  docker rm ${image_name}
fi

docker run -d --network qurbaqa \
  -e POSTGRES_USER=${POSTGRES_USER} \
  -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
  -e POSTGRES_DB=${POSTGRES_DB} \
  -p ${POSTGRES_PORT:-5432}:5432 \
  ${image_name}

echo "Postgres container built and run successfully."

pgadmin_image_name=${PGADMIN_IMAGE_NAME:-dpage/pgadmin4}
pgadmin_container_name=${PGADMIN_CONTAINER_NAME:-pgadmin4}
pgadmin_port=${PGADMIN_PORT:-5050}

if [ "$(docker ps -q -f name=${pgadmin_container_name})" ]; then
  echo "pgAdmin container is already running. Stopping and removing..."
  docker stop ${pgadmin_container_name}
  docker rm ${pgadmin_container_name}
fi

docker run -d --network qurbaqa \
  --name ${pgadmin_container_name} \
  -e PGADMIN_DEFAULT_EMAIL=${PGADMIN_DEFAULT_EMAIL:-admin@admin.com} \
  -e PGADMIN_DEFAULT_PASSWORD=${PGADMIN_DEFAULT_PASSWORD:-admin} \
  -p ${pgadmin_port}:80 \
  ${pgadmin_image_name}

echo "pgAdmin container built and run successfully."
