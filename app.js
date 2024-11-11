require("dotenv").config();
require("./db/config/db");
const express = require("express");
const routes = require("./routes");

const app = express();
app.use(express.json());
app.use(process.env.API_SUBSET_ROUTE, function (req, res, next) {
  res.header(process.env.ACCESS_CONTROL_ALLOW_ORIGIN_HEADER, process.env.ACCESS_CONTROL_ALLOW_ORIGIN_WEBSITES);
  res.header("Access-Control-Allow-Methods", "GET, PATCH, DELETE, PUT, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "content-type, Authorization");
  next()
});

app.use(process.env.API_SUBSET_ROUTE, routes);

const PORT = process.env.PORT;

const server = app.listen(PORT, function () {
  const portAddress = server.address().port;
  console.log(`server is runnig on PORT ${portAddress}`);
});
