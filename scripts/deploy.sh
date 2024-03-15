container_name=$(basename $(pwd) | awk '{print $NF}')
container_id=$(docker ps | grep "$container_name" | awk '{print $1}')
if [ ! -z "$container_id" ]; then
    echo "Stopping $container_name ($container_id)..."
    docker stop "$container_id"
fi

docker build -t "$container_name" .

image=$(docker images | grep "$container_name" | awk '{print $3}')
#docker run -d -it \
docker run -d -it --rm \
    -p 3000:3000 \
    --name "$container_name" \
    -v ./volumes/checkin-results:/app/checkin-results \
    -v ./volumes/lists:/app/lists "$image"
