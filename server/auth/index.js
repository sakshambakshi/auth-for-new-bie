const express  =  require('express');
const router = express.Router();
const joi = require('@hapi/joi') 
const bcrypt = require("bcryptjs")
//db part 
const db = require('../db/connection');

// users.createIndex('username' , {unique: true})
// any route in here will be prepended with auth


const schema = joi.object().keys({
    username: joi.string().regex(/([a-zA-Z0-9_]+$)/).min(3).max(30).required(),
    password: joi.string().min(6).max(32).required(),
  });

router.get('/' , (req , res  ) =>{
    res.json({
        "message":"Locked"
    })
});

// POST /auth/signup

router.post('/signup' , (req , res ,  next) =>{
    console.table(req.body);
    const result = joi.validate(req.body , schema);
    // res.json(result);
    if(result.error === null){
        db.getConnection((err , connection) =>{
            if(err){
                res.json({ "code": 100, "status": "Error in connection database" })
            }else{
                connection.query(`SELECT username FROM users WHERE username = '${req.body.username} '` , (err , rows , fields) => {
                    if(rows.length){
                        const userExistError = new Error('This User exist .Please Choose another Username');
                        next(userExistError)
                    }
                    else{
                        console.log("User doesnt Exist");
                        bcrypt.hash(req.body.password , 9 )
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
                                        res.json({change: rows.affectedRows});
                                    })
                                  }
                              )
                        
                    }
                })
            }
        })

        
    }
    else{
       next(result.error)
    }
})

module.exports = router ; 