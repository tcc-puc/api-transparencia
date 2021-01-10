const mocks = require('./mocks.json');
const express = require("express");
const server = express();

server.use(express.json());

//
const redis = require("redis");
const redisClient = redis.createClient({ host: 'redis'});

redisClient.on("error", function(error) {
  console.error(error);
});
 
redisClient.set("key", "value", redis.print);
redisClient.get("key", redis.print);


/**
 * Prometheus config
 */
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({ timeout: 5000 });

const counter = new client.Counter({
  name: 'node_request_operations_total',
  help: 'The total number of processed requests'
});

/**
 * Prometheus endpoint
 */
server.get('/metrics', (req, res) => {
  res.set('Content-Type', client.register.contentType)
  res.end(client.register.metrics())
})

/**
 * Global Middleware for logging
 */
server.use((req, res, next) => {
  counter.inc();
  return next();
});

/**
 * Conferir status da API
 */
server.get("/", (req, res) => {
  res.send("API transparencia running 2...");
});

/**
 * Recupera licitacoes
 */
server.get("/recursos/:action", (req, res) => {

  const { action } = req.params;

  if (action === "licitacoes") {
    return res.status(200).send(mocks.licitacoes)

  } else if (action === "convenios") {
    return res.status(200).send(mocks.convenios)
  } else {
    return res.status(404).json({
        "error": "search-0002",
        "message": "Dados nāo encontrados, por favor tente novamente.",
        "detail": "Parece que houve um erro com a sua busca",
        "help": ""
    })
  }
});

server.listen(3031);