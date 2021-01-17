const mocks = require('./mocks.json');
const express = require("express");
const server = express();
const { Kafka } = require('kafkajs')

server.use(express.json());

/**
 * Kafka config
 */
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka1:19092']
})

const producer = kafka.producer()
const consumer = kafka.consumer({ groupId: 'test-group' })

const run = async () => {

  /**
   * Consumer
   */
  await consumer.connect()
  await consumer.subscribe({ topic: 'topic_transparencia', fromBeginning: true })

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value.toString(),
      })
    },
  })
}

run().catch(console.error);

/**
 * Redis config
 */
const redis = require("redis");
const redisClient = redis.createClient({ host: 'redis'});

redisClient.on("error", function(error) {
  console.error(error);
});

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
 * Conferir status da API
 * Endpoint criado para simular o envio de uma mensagem atraves do sistema terceiro do governo.
 */
server.get("/controladoria", (req, res) => {

  const run = async () => {

    /**
     * Producer - cria topico
     */
    await producer.connect()
    await producer.send({
      topic: 'topic_transparencia',
      messages: [
        { value: 'updated' },
      ],
    })
  }

  run()

  res.send("Mensagem enviada");
});

/**
 * Recupera licitacoes
 */
server.get("/recursos/:action", (req, res) => {

  const { action } = req.params;

  redisClient.get(action, async (err, response) => {
    if (response) {
      return res.status(200).send(response)
    }

    if (action === "licitacoes") {
      redisClient.setex(action, 1440, JSON.stringify(mocks.licitacoes));
      return res.status(200).send(mocks.licitacoes)

    } else if (action === "convenios") {
      redisClient.setex(action, 1440, JSON.stringify(mocks.convenios));
      return res.status(200).send(mocks.convenios)

    } else {
      return res.status(404).json({
          "error": "search-0002",
          "message": "Dados nāo encontrados, por favor tente novamente.",
          "detail": "Parece que houve um erro com a sua busca",
          "help": ""
      })
    }
  })
});

server.listen(3031);