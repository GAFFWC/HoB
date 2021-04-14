source config.sh

gcloud container clusters get-credentials ${CLUSTER_NAME} --zone ${ZONE} --project ${PROJECT_ID}

# kubectl get pods --selector=app=${APP_NAME} --output=jsonpath={.items..metadata.name} --namespace=${NAMESPACE}

POD_NAME=$(kubectl get pods --selector=app=${APP_NAME} --output=jsonpath={.items..metadata.name} --namespace=${NAMESPACE})

echo $POD_NAME

IFS=' ' read -ra PODS <<< "$POD_NAME"

for pod in "${PODS}"; do
    kubectl logs -f $pod
done