"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import socket from "../Providers/client-server";
import useStream from "../_hooks/useStream";
import { useMediaFunctions } from "../mediaUtils";

const Lobby = () => {
  const router = useRouter();
  const [room, setRoom] = useState("");
  const {stream,setStream}=useStream();
  const videoRef = useRef<HTMLVideoElement>(null);
  const {handleMute,handleHide,handleSendAudio,handleShow,sendAudio,show}=useMediaFunctions()


  const handleClick = useCallback(() => {
    console.log(socket.id,'trying to join room:',room)
    socket.emit("join", room);
    router.push(`/room/${room}`)
  }, [socket, room]);

  const getMedia=useCallback(async ()=>{
    console.log('running')
    let tempStream:MediaStream|null=await navigator.mediaDevices.getUserMedia({
      audio:true,
      video:true
    })
    setStream(tempStream)
  },[])
  
  useEffect(()=>{
    stream?.getTracks().forEach(track=>console.log(track))
    videoRef.current!.srcObject = stream;
  },[stream])

  useEffect(()=>{
    console.log('ran')
    socket.connect();
    socket.on('connected',getMedia)
    return()=>{
      socket.connect()
      socket.off('connected',getMedia)
    }
  },[socket])

  return (
    <>
    <div className="flex flex-col">
    <video poster="/loader.jpg" ref={videoRef} autoPlay className="w-96 h-72"/>
    <div className="flex">
      <button className="grow outline" onClick={sendAudio? handleMute:()=>handleSendAudio(videoRef)}>{!sendAudio?'umute':'mute'}</button>
      <button className="grow outline" onClick={show? ()=>handleHide(videoRef):()=>handleShow(videoRef)}>{show ?'Hide Video':'Show Video'}</button>
    </div>
      <input
      autoFocus
      className="p-2 mt-1"
        placeholder="Enter RoomId to Join"
        value={room}
        onChange={(e) => { 
          setRoom(e.target.value)
        }}
      />
      <button onClick={handleClick}>Go To Room</button></div>
    </>
  );
};

export default Lobby;
