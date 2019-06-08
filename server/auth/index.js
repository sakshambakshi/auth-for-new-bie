const express  =  require('express');
const router = express.Router();

// any route in here will be prepended with auth

router.get('/' , (req , res  ) =>{
    res.json({
        "message":"Locked"
    })
});

// POST /auth/signup

router.post('/signup' , (req , res ,  next) =>{
    console.log(req.body)
    res.json({
        message: 'Tick Mark'
    })
})

module.exports = router ; 