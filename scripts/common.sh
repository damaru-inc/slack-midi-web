. environment
#POD=$(kubectl get pods | grep slack | awk '{ print $1 }')
echo  pod: $POD
echo conn: $IP:$PORT
