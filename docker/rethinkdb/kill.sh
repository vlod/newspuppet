set -x
CONTAINER_NAME="rethinkdb"
PID=`docker ps -a -q --filter name=$CONTAINER_NAME`

echo "$CONTAINER_NAME stopping: $PID"
docker stop $PID

echo "$CONTAINER_NAME rm: $PID"
docker rm $PID
