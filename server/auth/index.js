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
        const checkUser = {
            username: req.body.username,
            password: req.body.password
        }
        db.getConnection((err , connection) =>{
            if(err){
                res.json({ "code": 100, "status": "Error in connection database" })
                connection.release()
            }
            else{
                const userExistQuery = `SELECT username , password FROM users WHERE username = '${req.body.username} '`;
                console.log(userExistQuery);
               connection.query(userExistQuery , (err , rows , fields) =>{
                   if(rows.length){
                        const hashedPassword = rows[0].password;
                        console.log('Comparing password...', req.body.password , 'with the hash... ',hashedPassword)
                        bcrypt.compare( checkUser.password,hashedPassword ).then((resp)=>{
                           if(resp){
                               //Password true
                               res.json({resp})
                               connection.release()
                           }
                           else{
                            //Wrong Password
                            connection.release();
                            // res.status(422);
                            // const error = new Error('Wrong Password')
                            // next(error)
                            respondError422(res , next , 'Wrong Password')
                           }
                        })
                   }
                   else{
                       console.log('Username Not Found');
                       connection.release() ;
                    //    res.status(422);
                    //    const error = new Error('Wrong User Name ');
                    //    next(error);
                    respondError422(res , next , 'Wrong User Name' )
                   }
               })
            }
        })
    }
    else{
        // res.status(422)
        // next(result.error);
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