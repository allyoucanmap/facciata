/* eslint-disable no-console */

const express = require("express");
const path = require('path');
const port = 3003;
const app = express();

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-type, Accept');
  next();
});

app.use(express.static('./'));

app.use('http://localhost:3003/', function(req, res) {
  res.sendFile(path.resolve('./index.html'));
});

app.listen(port, function(error) {
  if (error) throw error;
  console.warn("Express server listening on port", port);
});


