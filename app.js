const express = require('express');
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const path = require('path');

const app = express();

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(serveStatic(path.join(__dirname, 'views')));

let routes = require('./routes');
app.use(routes);

app.listen(8080, () => console.log("Listening on port 8080!"));