const express  =  require('express');
const router = express.Router();
const joi = require('@hapi/joi') 
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')
//db part 
const db = require('../db/connection');

const dotenv = require('dotenv').config()

// any route in here will be prepended with auth
const schema = joi.object().keys({
    username: joi.string().regex(/([a-zA-Z0-9_]+$)/).min(3).max(30).required(),
    password: joi.string().trim().min(6).max(32).required(),
  });

router.get('/' , (req , res  ) =>{
    res.json({
        "message":"Locked"
    })
});

function createTokenSendResponse( hashedPassword , req , res , id ,next ){
    const payload = {
        _id: id , 
        username: req.body.username , 
        password: hashedPassword , 
    }
    console.log(process.env.TOKEN_SECRET)
    //Gen. a token 
    jwt.sign(payload ,process.env.TOKEN_SECRET , {
        expiresIn: '1d'
    } , (err , token) =>{
        if(err){
            //err during gen of token 
            respondError422(res , next , '' , err)
        }
        else{
            //sending token 
            res.json({token})
        }
    })
}

// POST /auth/signup
router.post('/signup' , (req , res ,  next) =>{
    console.table(req.body);
    const result = joi.validate(req.body , schema);
    // res.json(result);
    if(result.error === null){
        db.getConnection((err , connection) =>{
            if(err){
                res.json({ "code": 100, "status": "Error in connection database" })
                connection.release()
            }else{
                const userExistQuery = `SELECT username FROM users WHERE username = '${req.body.username} '`;
                console.log(userExistQuery)
                connection.query(userExistQuery , (err , rows , fields) => {
                    if(rows.length){
                        const userExistError = new Error('This User exist .Please Choose another Username');
                        connection.release();
                        next(userExistError)
                    }
                    else{
                        console.log("User doesnt Exist");
                        bcrypt.hash(req.body.password.trim() , 9 )
                              .then(hashedPassword =>{
                                  const newUser = {
                                      username : req.body.username , 
                                      password : hashedPassword
                                  }
                                  const newUserInsertQuery = `INSERT INTO users (username, password) VALUES ('${newUser.username}','${newUser.password}')`;
                                  console.table(newUser);
                                  console.log(newUserInsertQuery)
                                  connection.query(newUserInsertQuery,(err , rows , fields ) =>{
                                        console.log('Inside insert')                       
                                        createTokenSendResponse(hashedPassword , req , res ,rows.insertId , next)
                                        connection.release();
                                    })
                                  }
                              )
                    }
                })
            }
        })
    }
    else{
    //     res.status(422)
    //    next(result.error)
    respondError422(res , next , '' ,result.error)
    }
})

//login Route
router.post('/login' , (req , res , next) =>{
    console.table(req.body);
    const result = joi.validate(req.body , schema);
    // res.json(result)
    if(!result.error){
        //IF USERNAME AND PASSWORD ARE VALID 
        const checkUser = {
            username: req.body.username,
            password: req.body.password
        }
        //SET A CONNECTION WITH DB 
        db.getConnection((err , connection) =>{
            if(err){
                //ERR DURING CONNECTION 
                res.json({ "code": 100, "status": "Error in connection database" })
                connection.release()
            }
            else{
                //CONNECTED WITH DB THEN :- 
                const userExistQuery = `SELECT * FROM users WHERE username = '${req.body.username} '`;
                console.log(userExistQuery);
                //Check wether user exist or not in db 
                connection.query(userExistQuery , (err , rows , fields) =>{
                if(rows.length){
                    //if user exist  
                    const id = rows[0].id
                    const hashedPassword = rows[0].password;
                    console.log('Comparing password...', req.body.password , 'with the hash... ',hashedPassword)
                    //Compare the pasword given by user and hashed stored in db at password col 
                    bcrypt.compare( checkUser.password,hashedPassword ).then((resp)=>{
                    if(resp){
                        //Password true
                        const payload = {
                            _id: id , 
                            username: checkUser.username , 
                            password: hashedPassword , 
                        }
                        console.log(process.env.TOKEN_SECRET)
                        //Gen. a token 
                        jwt.sign(payload ,process.env.TOKEN_SECRET , {
                            expiresIn: '1d'
                        } , (err , token) =>{
                            if(err){
                                //err during gen of token 
                                respondError422(res , next , '' , err)
                            }
                            else{
                                //sending token 
                                res.json({token})
                            }
                        })
                        //releasing the db connection so that there are enough free connection available for db or to avoid the load at db 
                        connection.release()
                    }
                    else{
                    //Wrong Password
                    connection.release();
                    respondError422(res , next , 'Wrong Password')
                    }
                    })
                }
                else{
                    console.log('Username Not Found');
                    connection.release() ;
                respondError422(res , next , 'Wrong User Name' )
                }
               })
            }
        })
    }
    else{
        //username and password validation error case 
        respondError422(res , next ,'' ,result.error)
    }
});

function respondError422(res , next , msg , err ){
    res.status(422);
    console.log("next")
    console.log(next);
    console.log(msg);
    if(err){
        next(err)
    }
    else{
        const error = new Error(msg)
       next(error) 
    }
    
}

module.exports = router ; 