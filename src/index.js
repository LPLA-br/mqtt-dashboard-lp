const express = require('express');
const app = express();
const port = 3000;

const mqtt = require('mqtt'); // mosquitto_pub -t 'TOPICO/A' -m 'MSG' [-h HOST]
const WebSocket = require('ws');

app.use( express.static('public') );

const server = app.listen(port, () =>
{
  console.log(`http://localhost:${port}`)
});

//encapsulação do objeto server em um superobjeto.
const wss = new WebSocket.Server( { server } );

// formata dado cru em um json publicado para inteiros.
function formatarDadoCru( topico, mensagem )
{
  let ret = "{";
  ret = ret.concat('\"', topico, '\"', ':', mensagem, '}');
  console.log(ret)
  return ret;
}

wss.on( 'connection', (wss) =>
{
  console.log( "websocket conectado" );

  //BROKER MQTT
  const cliente = mqtt.connect( 'mqtt://localhost' );

  cliente.on( 'connect', ()=>
  {
    console.log("Conectado ao broker MQTT");
    cliente.subscribe('/bike/rpm');
    cliente.subscribe('/bike/rumo');
    cliente.subscribe('/bike/pressao');
  });

  cliente.on('message', (topic, message) =>
  {
    console.log(`LOG {"timestamp":${new Date().getTime()},"topico": ${topic} "msg": ${message}}`);
    wss.send(formatarDadoCru( topic, message.toString() ));
  });

  wss.on( 'close', () =>
  {
    console.log( "cliente websocket desconectado" );
    cliente.end();
  });

});

