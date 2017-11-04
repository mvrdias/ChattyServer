const express = require('express');
const ws = require('ws');
const PORT = 3001;
const uuidv4 = require('uuid/v4');
let contador = 0;
const server = express()
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));
const wss = new ws.Server({ server });

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === ws.OPEN) {
      client.send(data);
    }
  });
}

wss.on('connection', (socket) => {
  console.log('Client connected');
  contador++;
  broadcast(JSON.stringify({type:"counter", userCounter: contador}));

  socket.on('message', (data) => {
    var newMessage = JSON.parse(data);
    newMessage.id = uuidv4();

    switch(newMessage.type) {
        case "postMessage":
           newMessage.type = "incomingMessage";
           broadcast(JSON.stringify(newMessage));
          break;
        case "postNotification":
           newMessage.type = "incomingNotification";
           broadcast(JSON.stringify(newMessage));
          break;
        default:
          throw new Error("Unknown event type " + data.type);
      }
  });

  socket.on('close', () => {
    console.log('Client disconnected');
    contador--;
    broadcast(JSON.stringify({type:"counter", userCounter: contador}));
  });
});
