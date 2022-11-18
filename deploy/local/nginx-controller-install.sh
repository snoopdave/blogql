#!/usr/bin/env bash
helm repo add nginx-stable https://helm.nginx.com/stable
helm repo update
kubectl create namespace ingress-nginx
kubens ingress-nginx
helm install nginx nginx-stable/nginx-ingress \
    --set controller.service.type=LoadBalancer,rbac.create=true,controller.extraArgs.enable-ssl-passthrough=""

