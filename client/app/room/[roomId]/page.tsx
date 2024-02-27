'use client'
import { useEffect, useCallback, useRef, useState } from "react";
import peer from "@/app/Providers/peer";
import { useParams } from "next/navigation";
import socket from "@/app/Providers/client-server";

const Page = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const param = useParams();
  const [opp, setOpp] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const handleJoined = useCallback(
    (data: { userId: string }) => {
      setOpp(data.userId);
      console.log(`${data.userId} connected to the Room`);
    },
    []
  );

  const handleCall = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("call:initiated", { to: opp, offer });
    const streamY = await navigator.mediaDevices.getUserMedia({
      video: {
        height: 200,
        width: 200,
      },
      audio: false,
    });
    if (videoRef.current) {
      videoRef.current.srcObject = streamY;
    }
    setStream(streamY);
  }, [opp, socket]);

  const handleCallReceived = useCallback(
    async ({ caller, offer }: { caller: string; offer: RTCSessionDescriptionInit }) => {
      setOpp(caller);
      const streamY = await navigator.mediaDevices.getUserMedia({
        video: {
          height: 200,
        width: 200,
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = streamY;
      }
      setStream(streamY);
      console.log("incoming call ", offer, "from", caller);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:answered", { ans, caller });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    if (stream) {
      const senders = peer.peer.getSenders();
      const tracksToAdd = stream.getTracks().filter(track => {
        // Check if the track is already being sent
        return !senders.some(sender => sender.track === track);
      });
  
      // Add only tracks that are not already associated with a sender
      tracksToAdd.forEach(track => {
        peer.peer.addTrack(track, stream);
      });
    }
  }, [stream]);

  const handleCallStarted = useCallback(
    ({ ans, from }: { ans: RTCLocalSessionDescriptionInit; from: string }) => {
      peer.setLocalDescription(ans);
      console.log("OK");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: opp });
  }, [opp, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }: { from: string; offer: RTCSessionDescriptionInit }) => {
      console.log(offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }: { ans: RTCLocalSessionDescriptionInit }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (e) => {
      const remoteStream = e.streams;
      console.log('Got Tracks!!');
      console.log(remoteStream)
      setRemoteStream(remoteStream[0]);
      if (remoteVideoRef.current) {
        console.log('lkjhj')
        remoteVideoRef.current.srcObject = remoteStream[0];
      }
    });
  }, []);

  useEffect(() => {
    socket.on("joined", handleJoined);
    socket.on("call:started", handleCallStarted);
    socket.on("call:received", handleCallReceived);
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("joined", handleJoined);
      socket.off("call:started", handleCallStarted);
      socket.off("call:received", handleCallReceived);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [socket, handleJoined, handleCallReceived, handleCallStarted, handleNegoNeedFinal, handleNegoNeedIncoming]);

  return (
    <div className="flex flex-col justify-center items-center">
      <video autoPlay playsInline controls={false} ref={videoRef} className="h-200 w-200"></video>
      <video autoPlay playsInline controls={false} ref={remoteVideoRef}></video>
      <div>This is Room Page: {param.roomId}</div>
      {stream && <button onClick={sendStreams}>Send Stream</button>}
      <ul>{opp}</ul>
      <button onClick={handleCall}>Call</button>
    </div>
  );
};

export default Page;
