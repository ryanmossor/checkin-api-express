container_name=$(basename $(pwd) | awk '{print $NF}')
container_id=$(docker ps | grep "$container_name" | awk '{print $1}')
docker stop "$container_id"
