const express = require('express'); //acquiring express
const volleyball = require('volleyball') // acquiring volleyball a logger 


const app = express(); //creating app

const middleware = require('./auth/middleware') 
const auth = require('./auth/index'); //acquiring a route 
const notes = require('./api/notes')


app.use(volleyball); // avtivating logger
app.use(express.json()) // parses the json of body 

app.use((req , res , next) =>{
  middleware.checkTokenSetUser(req , res , next)
})

app.get('/', (req, res , next) => {
  console.log('here')
  res.json({
    message: '🦄🌈✨Hello World! 🌈✨🦄',
    user: req.user 
  });
  
});

app.use('/api/v1/notes' ,middleware.isLoggedIn , notes)

app.use('/checking', middleware.isLoggedIn  , (req , res , next) => { 
  res.send(`Your username is ${req.user.username} and your id ${req.user._id}`);
  next()
})
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