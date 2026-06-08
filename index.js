const express = require('express');
const app = express();
const port = 3300;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const categoryRoute = require('./api/categories'); // import category route
const userRoute = require('./api/users'); // import user route
const todoRoute = require('./api/todos'); // import todos route
const authRoute = require('./api/auth'); // import auth route

require('dotenv/config');
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

var corsOptions = {
	origin: 'http://localhost:3000',
	optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	allowedHeaders: ['Content-Type', 'Authorization'], // Add Authorization here
  	credentials: true
  }

mongoose.connect(process.env.DB_CONNECTION)
	.then(() => console.log('Connected to DB'))
    .catch(err => console.error('DB connection error:', err));

// middlewares
app.use(bodyParser.json());
app.use('/categories', cors(corsOptions), categoryRoute);
app.use('/users', cors(corsOptions), userRoute);
app.use('/todos', cors(corsOptions), todoRoute);
app.use('/auth', cors(corsOptions), authRoute);

// routes
app.get('/', (req, res) => {
	res.send('We are on home');
});


// start server
app.listen(port, () => {
	console.log(`Server listening on port ${port}`)
});