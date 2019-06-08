const express  =  require('express');
const router = express.Router();
const joi = require('@hapi/joi') 

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
    res.json(result)
})

module.exports = router ; 