const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("API transparencia running...");
});

app.listen(3031);