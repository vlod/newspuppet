PID=`docker ps -a -q --filter name="beanstalkd"`

echo "beanstalkd stopping: $PID"
docker stop $PID

echo "beanstalkd rm: $PID"
docker rm $PID