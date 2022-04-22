### Install okteto CLI using Scoop in Windows Powershell

Set-ExecutionPolicy RemoteSigned -scope CurrentUser
iwr -useb get.scoop.sh | iex
scoop install okteto

## copy jdk-11.0.4_linux-x64_bin.tar.gz
cp <path/to/jdk-11.0.4_linux-x64_bin.tar.gz> tibco/base/1.0/jdk-11.0.4_linux-x64_bin.tar.gz

### okteto build
okteto build

### okteto deploy
okteto deploy

### Port forwarding
kubectl port-forward --namespace db-alpanachaphalkar svc/om-db-postgresql 5432:5432