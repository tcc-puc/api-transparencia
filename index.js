const mocks = require('./mocks.json');
const express = require("express");

const server = express();

server.use(express.json());

server.get("/", (req, res) => {
  res.send("API transparencia running...");
});

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