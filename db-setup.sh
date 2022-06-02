kubectl create ns db

cd "C:\Users\ALCH390\GolandProjects\TIBCO-OM-DB\postgresql\9.6\helm"
helm install -n db postgres -f minikube-values.yaml .

minikube tunnel