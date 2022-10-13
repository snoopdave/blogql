#!/usr/bin/env bash
kubectl create namespace ingress-nginx
kubens namespace ingress-nginx
helm install stable/nginx-ingress --name nginx \
    --set controller.service.type=LoadBalancer,rbac.create=true,controller.extraArgs.enable-ssl-passthrough=""

