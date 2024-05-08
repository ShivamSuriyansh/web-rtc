//creating a ws server for signalling 

import {WebSocket,WebSocketServer} from "ws"

const wss = new WebSocketServer({port : 8080});

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on('connection',(socket:WebSocket)=>{
    socket.on('error',(err)=>console.error);

    socket.on('message' , (data:string , isbinary:boolean)=>{
        const message = JSON.parse(data);
        console.log(message);
        if(message.type=='sender'){
            senderSocket = socket;
            console.log('sender set')
        }else if(message.type == 'receiver'){
            receiverSocket = socket;
            console.log('receiver set')
        }else if(message.type == 'createOffer'){
            receiverSocket?.send(JSON.stringify({type: 'createOffer' , sdp : message.sdp}))
            console.log('create offer set')
        }
        else if(message.type == 'createAnswer'){
            senderSocket?.send(JSON.stringify({type: 'createAnswer' , sdp : message.sdp}))
            console.log('create answer set')
        }
        else if(message.type == 'iceCandidate'){
            if(socket == senderSocket){
                receiverSocket?.send(JSON.stringify({type: 'iceCandidate', candidate : message.candidate}));
                console.log('receiver ice candidate set')
            }else if(socket == receiverSocket){
                senderSocket?.send(JSON.stringify({type : 'iceCandidate', candidate: message.candidate}));
                console.log('receiver ice candidate set')
            }
        }
    })
})
