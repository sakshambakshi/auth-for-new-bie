const express = require('express'); //acquiring express
const volleyball = require('volleyball') // acquiring volleyball a logger 


const app = express(); //creating app

const auth = require('./auth/index'); //acquiring a route 

app.use(volleyball); // avtivating logger
app.use(express.json()) // parses the json of body 
app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨Hello World! 🌈✨🦄'
  });
});

app.use('/auth' , auth)

function notFound(req, res, next) {
  res.status(404);
  const error = new Error('Not Found - ' + req.originalUrl);
  next(error);
}

function errorHandler(err, req, res, next) {
  res.status(res.statusCode || 500);
  res.json({
    message: err.message,
    stack: err.stack
  });
}

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log('Listening on port', port);
});