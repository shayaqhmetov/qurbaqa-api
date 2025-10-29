#!/bin/bash
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

DOCKER_IMAGE_NAME="${KEYCLOAK_DOCKER_IMAGE_NAME:-qurbaqa-keycloak}"

if docker images --format '{{.Repository}}' | grep -q $DOCKER_IMAGE_NAME; then
  echo "Docker image $DOCKER_IMAGE_NAME already exists."
else 
  echo "Docker image $DOCKER_IMAGE_NAME does not exist. Proceeding to build."
  echo KC_DB_URL=${KC_DB_URL}
  echo KC_DB_USERNAME=${KC_DB_USERNAME}
  echo KC_DB_PASSWORD=${KC_DB_PASSWORD} 
  echo KC_HOSTNAME=${KC_HOSTNAME}
  echo "Building Keycloak Docker image with the provided database configuration..."
  docker buildx build -t $DOCKER_IMAGE_NAME:latest -f Dockerfile.keycloak .
  echo "Keycloak Docker image built successfully with the provided database configuration."
fi 

if docker ps -a --format '{{.Names}}' | grep -q "^${DOCKER_IMAGE_NAME}$"; then
  if docker ps --format '{{.Names}}' | grep -q "^${DOCKER_IMAGE_NAME}$"; then
    echo "Keycloak container $DOCKER_IMAGE_NAME is already running."
    docker stop $DOCKER_IMAGE_NAME
    echo "Stopped running Keycloak container."
  else
    echo "Keycloak container $DOCKER_IMAGE_NAME exists but is not running."
  fi
  docker rm $DOCKER_IMAGE_NAME
  echo "Removed existing Keycloak container."
fi

docker run --name $DOCKER_IMAGE_NAME \
        -d \
        -p 8080:8080 \
        -p 8443:8443 -p 9000:9000 \
        -e KC_BOOTSTRAP_ADMIN_USERNAME=${KC_USERNAME} -e KC_BOOTSTRAP_ADMIN_PASSWORD=${KC_PASSWORD} \
        -e KC_DB=postgres \
        -e KC_DB_URL=${KC_DB_URL} \
        -e KC_DB_USERNAME=${KC_DB_USERNAME} \
        -e KC_DB_PASSWORD=${KC_DB_PASSWORD} \
        -e KC_HOSTNAME=${KC_HOSTNAME} \
        -e KC_HTTP_ENABLED=true \
        -e KC_PROXY=edge \
        --network qurbaqa \
        $DOCKER_IMAGE_NAME:latest \
        start-dev

echo "Keycloak container $DOCKER_IMAGE_NAME is running on port 8443."
