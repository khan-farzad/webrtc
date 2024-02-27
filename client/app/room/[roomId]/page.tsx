"use client";
import { useParams } from "next/navigation";
import socket from "@/app/Providers/client-server";
import { useCallback, useEffect, useRef, useState } from "react";
import peer from "@/app/Providers/peer";

const Page = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const param = useParams();
  const [users, setUsers] = useState<string[]>([]);
  const [stream, setStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();

  //Doubt
  /* Why socket not working in page.tsx?? 
  
  bcz page.tsx abhi render hi nahi hua na dumbo
  */
  //Doubt

  const handleCall = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("call:initiated", { to: users[0], offer });
      const streamY = await navigator.mediaDevices.getUserMedia({
        video: {
          height: 600,
          width: 600,
        },
        audio: false,
      });
      videoRef.current!.srcObject = streamY;
      await setStream(streamY);
      console.log(stream);
      console.log(streamY);

  }, [stream, socket]);

  useEffect(() => {
    console.log(stream)
  }, [stream])

  const handleCallReceived = useCallback(
    async ({
      caller,
      offer,
    }: {
      caller: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      console.log("incoming call ", offer, "from", caller);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:answered", { ans, caller });
    },
    []
  );

  useEffect(() => {
    peer.peer.addEventListener("track", (e) => {
      console.log(e.streams[0]);
      setRemoteStream(e.streams[0]);
    });
  }, []);

  const handleCallStarted = useCallback(
    ({ ans, from }: { ans: RTCSessionDescriptionInit; from: string }) => {
      // console.log(ans)
      peer.setLocalDescription(ans);
      console.log("OK");
      console.log(stream);
      for (const track of stream!.getTracks()) {
        peer.peer.addTrack(track, stream!);
      }
    },
    [stream]
  );

  const handleJoined = useCallback(
    (data: { userId: string }) => {
      users.push(data.userId);
      setUsers(users);
      console.log(users);
      console.log(`${data.userId} connected to the Room`);
    },
    [setUsers, users]
  );

  useEffect(() => {
    socket.on("joined", handleJoined);
    socket.on("call:started", handleCallStarted);
    socket.on("call:received", handleCallReceived);

    return () => {
      socket.off("joined", handleJoined);
      socket.off("call:started", handleCallStarted);
      socket.off("call:received", handleCallReceived);
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center">
      <video autoPlay playsInline controls={false} ref={videoRef}></video>
      <video autoPlay playsInline controls={false} ref={remoteVideoRef}></video>
      <div>This is Room Page: {param.roomId}</div>
      {/* <button onClick={sendMessage}>Send msg</button> */}
      <ul>
        {users.map((user, idx) => {
          return <li key={idx}>{user}</li>;
        })}
        <li>Helllo Test</li>
      </ul>
      <button onClick={handleCall}>Call</button>
    </div>
  );
};

export default Page;
