const db = require('../db/connection');
const notesRoute = require('express').Router();

notesRoute.get('/', (req , res , next) => {
    if(req.user){
        const query = `SELECT title , notes FROM notes WHERE userid = ${req.user._id} AND username = '${req.user.username}'`
        // const query = `SELECT notes WHERE userid = ${req.user._id} , username = '${req.user.username}' FROM notes`
        db.getConnection((err , connection) => {
            connection.query(query , (err , rows , fields) =>{
                if(err){
                    console.log(query);
                    connection.release()
                    next(err)
                }
                else{  
                    res.json({
                        res:rows,
                        query: query
                    });
                    connection.release()
                }
            })
        })
    }
  
})

notesRoute.post('/post', (req , res , next) => {
    if(req.user){
        const query = `INSERT INTO notes (  userid , username ,  notes, title) VALUES (${req.user._id},'${req.user.username}','${req.body.note} ', '${req.body.title} ')`
        // const query = `SELECT notes WHERE userid = ${req.user._id} , username = '${req.user.username}' FROM notes`
        db.getConnection((err , connection) => {
            connection.query(query , (err , rows , fields) =>{
                if(err){
                    console.log(query);
                    connection.release()
                    next(err)
                }
                else{  
                    res.json({
                        res:rows,
                        query: query
                    });
                    connection.release()
                }
            })
        })
    }
  
})



module.exports = notesRoute