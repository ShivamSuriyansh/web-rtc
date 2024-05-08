"use strict";
//creating a ws server for signalling 
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let senderSocket = null;
let receiverSocket = null;
wss.on('connection', (socket) => {
    socket.on('error', (err) => console.error);
    socket.on('message', (data, isbinary) => {
        const message = JSON.parse(data);
        console.log(message);
        if (message.type == 'sender') {
            senderSocket = socket;
            console.log('sender set');
        }
        else if (message.type == 'receiver') {
            receiverSocket = socket;
            console.log('receiver set');
        }
        else if (message.type == 'createOffer') {
            receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: 'createOffer', sdp: message.sdp }));
            console.log('create offer set');
        }
        else if (message.type == 'createAnswer') {
            senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: 'createAnswer', sdp: message.sdp }));
            console.log('create answer set');
        }
        else if (message.type == 'iceCandidate') {
            if (socket == senderSocket) {
                receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
                console.log('receiver ice candidate set');
            }
            else if (socket == receiverSocket) {
                senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
                console.log('receiver ice candidate set');
            }
        }
    });
});
