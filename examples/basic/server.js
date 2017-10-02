const express = require("express");
const app = express();

function success(res) {
  return res.status(200).json({ some: "data" });
}

function failure(res) {
  return res.status(500).json({ error: "reasons" });
}

app.use((_req, _res, next) => setTimeout(next, 400));

app.get("/succeed-always", (_req, res) => {
  res.status(200).json({ some: "data" });
});

app.get("/succeed-sometimes", (_req, res) => {
  if (Math.random() < 0.5) {
    res.status(500).json({ error: "server" });
  } else {
    res.status(200).json({ some: "data" });
  }
});

app.get("/fail-sometimes", (_req, res) => {
  if (Math.random() < 0.5) {
    res.status(500).json({ error: "server" });
  } else {
    res.status(400).json({ error: "client" });
  }
})

app.listen(4000);
