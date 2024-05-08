import { useEffect, useState } from "react"

export const Sender = ()=>{
    //first connect the wss

    const [socket , setSocket ] = useState<null | WebSocket>(null);

    useEffect(()=>{
        const socket = new WebSocket('ws://localhost:8080');
        socket.onopen = ()=>{
            socket.send(JSON.stringify({
                type : "sender"
            }))
        }
        setSocket(socket);
    },[])

    const initConnection = async ()=>{
        if(!socket)return;

        const pc = new RTCPeerConnection();

        pc.onnegotiationneeded = async ()=>{
            console.log('in nego')
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.send(JSON.stringify({
                type: "createOffer",
                sdp: pc.localDescription
            }))
        }
         // ice candidate
         pc.onicecandidate= async (event)=> {
            if(event.candidate){
                socket.send(JSON.stringify({
                    type: "iceCandidate",
                    candidate: event.candidate
                }))
            }
        }

        socket.onmessage = async (event)=>{
            console.log('event: ',event);
            const message= JSON.parse(event.data);
            console.log('in init', message)
            // create answer 
            if(message.type == 'createAnswer'){
                console.log('answer created')
                await pc.setRemoteDescription(message.sdp);
            }else if(message.type == 'iceCandidate'){
                console.log('ice candidate created')
                pc.addIceCandidate(message.candidate);
            }
        }    
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        pc.addTrack(stream.getVideoTracks()[0]);
       
    }

    return <div>
        <div>
            <button onClick={initConnection}>SEND VID</button>
        </div>
    </div>
}