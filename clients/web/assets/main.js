$(function() {
    var movementSocket = io('http://localhost:8080/movement');

    movementSocket.on('heroMoved', function(data){
        console.log('received', data);
    });

    window.movementSocket = movementSocket;
});