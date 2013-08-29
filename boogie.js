var HID = require('node-hid');
var devices = new HID.devices(8263,65511);  // device address
if (!devices.length) {
  console.log("No HID device found");
} else {
  var device = new HID.HID(devices[0].path);
  device.read(onRead);
}

/**
 * Wrapper for Worlize WebSocketNode to emulate the browser WebSocket object.
 */
var WebSocketClient = require('websocket').client;
var ws = new WebSocketClient();
var socket = '';

ws.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

ws.on('connect', function(connection) {
    console.log('WebSocket client connected');
    socket = connection;
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });

    connection.sendUTF("Hello world");
});
ws.connect('ws://localhost:8080', 'whiteboard-example');

var prex = 0;
var prey = 0;
var height = 705;
var width = 999;

function onRead(error, data) {
  
  var state = data[10]
//				lock = 32
//				erase = 4
//				wake = 2  
  var penstate = data[3]
//  detected = 32
//  contact = 1
var x = String('0x'+data[5].toString(16)+data[4].toString(16));
var y = String('0x'+data[7].toString(16)+data[6].toString(16));


cury = height - parseInt(y,16)/20
curx = width - parseInt(x,16)/20
var col = { r: 255, g: 255, b: 255 }

  //get 32 bytes
  if (data[0] != 0) {
    //console.log(data);
    //console.log("x: "+x+"\ny: "+y)
    //console.log("\n" + data.map(function (v) {return ('00' + v.toString(16)).slice(-2)}).join(','));
    if (data[3] == 33) {
      col = { r: 0, g: 0, b: 0 } // contact = black
    }
    socket.send(JSON.stringify({
      msg: 'drawLine',
      data: {
          color: col,
          points: [
              prex,
              prey,
              curx,
              cury
          ]
      }
    }));
    
  }
  if (data[3] == 33) {
    prex = curx;
    prey = cury;
  } 
    
  
  device.read(onRead);
}


/*
device.read(function(err, data) {
  if (err) { console.log(err) }
  console.log(data);
});
*/
