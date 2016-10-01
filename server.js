= clientInfo[socketId];

        if(info.room === userInfo.room) {
            users.push(userInfo.name);
        }
    });

    socket.emit('message', {
        name: 'System',
        text: 'There are total of ' + users.length + ' users online in this room. \n' +
        'List of all users: ' + users.join(', '),
        timestamp: moment().valueOf()

    });

}

io.on('connection', function (socket) {

    socket.on('disconnect', function () {
        var userData = clientInfo[socket.id];
        if(typeof userData !== 'undefined') {
            socket.leave(userData.room);
            io.to(userData.room).emit('message', {
                name: 'System',
                text: userData.name + ' has left the room.',
                timestamp: moment().valueOf()
            });

            delete clientInfo[socket.id];
        }
    });

    socket.on('join-room', function (request) {

        clientInfo[socket.id] = request;
        socket.join(request.room);
        socket.broadcast.to(request.room).emit('message', {
            name: 'System',
            text: request.name + ' has joined the room!',
            timestamp: moment().valueOf()
        });
    });

    socket.on('message', function (message) {

        if(message.text === '@users') {
            sendAllUsers(socket);
        } else {
            message.timestamp = moment().valueOf();
            io.to(clientInfo[socket.id].room).emit('message', message);
        }

    });

    socket.emit('message', {
        name: 'System',
        text: 'Welcome to the chat application!',
        timestamp: moment().valueOf()
    });

});

http.listen(PORT, function () {
    console.log('Server started at port ' + PORT);
})
