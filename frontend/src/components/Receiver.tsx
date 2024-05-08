import { useEffect ,useRef} from "react"

export const Receiver = ()=>{

    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(()=>{
        const socket = new WebSocket("ws://localhost:8080");
        socket.onopen = ()=>{
            socket.send(JSON.stringify({
                type: "receiver"
            }))
        }

        let pc : RTCPeerConnection | null;
        socket.onmessage = async (event)=>{
            const message = JSON.parse(event.data);
            if(message.type == 'createOffer'){
                pc = new RTCPeerConnection();
                // console.log('offer created')
                pc.setRemoteDescription(message.sdp);

                pc.onicecandidate =  (event)=>{
                    // console.log(event);
                    if(event.candidate){
                        socket?.send(JSON.stringify({
                            type : 'iceCandidate',
                            candidate : event.candidate
                        }))
                    }
                }

                pc.ontrack = (event) => {
                    console.log('in track', event.track)
                    if(videoRef.current){
                        videoRef.current.srcObject = new MediaStream([event.track]);
                        videoRef.current.play();
                    }
                };
                
                
                const answer =await  pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.send(JSON.stringify({
                    type: "createAnswer",
                    sdp : pc.localDescription
                }))
            }else if(message.type == 'iceCandidate'){
                // console.log('receive ice candidate created')
                pc?.addIceCandidate(message.candidate);
            }
        }

    },[])


    return <div>
        <video muted={true} ref={videoRef}></video>
        Receiver
    </div>
}