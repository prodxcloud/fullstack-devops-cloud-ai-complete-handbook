cluster_name="prodxcloud-cluster-dev"
UUID="0d22999b-xxxx"

curl -sL https://github.com/UpCloudLtd/upcloud-cli/releases/latest/download/upctl-linux-amd64 -o upctl

chmod +x upctl

# (Optional) Move upctl to /usr/local/bin/
# sudo mv upctl /usr/local/bin/
upctl --version

export UPCLOUD_USERNAME="pxx"
export UPCLOUD_PASSWORD="xxx"
# upctl account login --username prodxcloud --password Michael@5151

upctl kubernetes config 0d22999b-6008-4e2d-af9e-9bc9ec655d62 --write prodxcloud-cluster-dev_kubeconfig.yaml

./upctl cluster create $cluster_name --zone fi-hel1 --plan 1xCPU-1GB --storage 10GB --labels $cluster_name

export KUBECONFIG=$(pwd)/prodxcloud-cluster-dev_kubeconfig.yaml
export KUBECONFIG=prodxcloud-cluster-dev_kubeconfig.yaml

