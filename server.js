//Initializing required modules
const path = require('path')
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')
const formatMessage = require('./UTILS/messages')
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./UTILS/users')

//Creating the server
const app = express()
const server = http.createServer(app)
const io = socketIO(server)

//Frontend of the app
app.use(express.static(path.join(__dirname, 'CLIENT')))

const Bot = 'TextGram Bot'

//Runs when a client connects
io.on('connection', socket =>{

    socket.on('joinRoom',({username,room})=>{

        const user = userJoin(socket.id,username, room); 

        socket.join(user.room)
        
        //Broadcast when a client joins
        socket.emit('message', formatMessage(Bot,'Hiiii, Welcome to TextGram!'))
    
        //Broadcast to all other connected users when a new client connects
        socket.broadcast.to(user.room).emit('message', formatMessage(Bot,`${user.username} has joined the party`))

        //Send users room information
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users:getRoomUsers(user.room)        
        })

    })
    
    //Listen to chatMessage
    socket.on('chatMessage',msg =>{
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    //Broadcast When a user disconnects
    socket.on('disconnect',()=>{

        const user = userLeave(socket.id)

        if (user) {
            
            io.to(user.room).emit('message',formatMessage(Bot,`${user.username} has left the party`)) 
        }

        //Send users room information
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users:getRoomUsers(user.room)        
        })

    })
})





const PORT = process.env.PORT || 3000 

server.listen(PORT,()=>console.log(`Server running on port http://localhost:${PORT}`))


















//socket.emit()
//broadcast to a particular user
//
//socket.broadcast.emit()
//broadcast to every user except current user
//
//io.emit()
//broadcast to every user
//