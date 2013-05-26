/*
 * Logic for dealing with the Socket.IO stuff.
 */

"use strict";

var socketIO = require('socket.io');

function SocketServer(){

    this.sockets = [];
}

SocketServer.prototype.onNewPost = function(postWithDetails) {
    var self = this;

    // inform the sockets that we have a new post
    // TODO: batch these
    self.sockets.forEach(function(socket){
        try {
            // TODO: deal with dead sockets eating up memory
            if (socket.volatile) {
                socket.volatile.emit('new:post', postWithDetails);
            }
        } catch (err) {
            console.log('error with socket: ' + err);
        }
    });

};

SocketServer.prototype.init = function(server) {
    var self = this;

    var io = socketIO.listen(server);

    io.sockets.on('connection', function(socket){
        console.log('connection made');


        socket.emit('init', {success : true});
        console.log('socket connect, there were ' + self.sockets.length + ' sockets...');
        self.sockets.push(socket);
        console.log('now there are ' + self.sockets.length + ' sockets');


        socket.on('disconnect', function() {
            console.log('socket disconnect, there were ' + self.sockets.length + ' sockets...');
            self.sockets.splice(self.sockets.indexOf(socket), 1);
            console.log('now there are ' + self.sockets.length + ' sockets');
        });
    });
};

module.exports = SocketServer;