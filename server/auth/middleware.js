const jwt = require('jsonwebtoken');

function checkTokenSetUser(req , res , next ){
    const authHeader = req.get('authorization');
    if(authHeader){
        const token = authHeader.split(' ')[1]
        console.log("token is",token);
        if(token){
            jwt.verify(token , process.env.TOKEN_SECRET ,(error , user) =>{
                if(error){
                    console.log(error);
                    next()
                }
                if(user){
                    // user.password = '';
                    delete user.password
                    req.user = user ; 
                    next();
                }
            })

        }else{
            next()
        }
    }
    else{
        next()
    }
}
module.exports = checkTokenSetUser