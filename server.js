const express = require('express');
const webSocket = require('ws');
const http = require('http')
const ip = require("ip");

const app = express();
const port = 8080;


const server = http.createServer(app);
const wss = new webSocket.Server({server: server});



wss.on('connection',connectionHandler);

function connectionHandler(ws){
  console.log("connected");
  ws.on('message',messageHandler)

}

function messageHandler(message){
  console.log('received: %s', message);
  wss.clients.forEach((client)=>{
    if(client.readyState === client.OPEN){
      try{
        client.send(message);
      }catch(err){
        // error ignored
      }
    }
  });
}


app.use(express.static(`${__dirname }/webpages`));


server.listen(port, () => {
    console.log('Server started:', `http://${ip.address()}:${port}` )
});
