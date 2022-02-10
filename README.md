# elasticsearch-demo

## install elasticsearch

```bash
// pull image
docker pull bitnami/elasticsearch:7

// create network
docker network create elasticsearch_network

// create container
docker run -d --name elasticsearch \
  -p 9201:9201 --network=elasticsearch_network \
  -e ELASTICSEARCH_PORT_NUMBER=9201 \
  -v ~/elasticsearch/data:/bitnami/elasticsearch/data \
  bitnami/elasticsearch:7
```
