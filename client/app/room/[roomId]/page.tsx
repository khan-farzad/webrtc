"use client";
import { useEffect, useCallback, useRef, useState } from "react";
import peer from "@/app/Providers/peer";
import { useParams, useRouter } from "next/navigation";
import socket from "@/app/Providers/client-server";
import useStream from "@/app/_hooks/useStream";
import { useMediaFunctions } from "@/app/mediaUtils";
import Image from "next/image";
import ChatBox from "@/app/_components/ChatBox";
import Bottombar from "@/app/_components/bottombar";

const Page = () => {
  const {
    handleMute,
    handleSendAudio,
    show,
    sendAudio,
    handleHide,
    handleShow,
  } = useMediaFunctions();
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const param = useParams();
  const [opp, setOpp] = useState<string>("");
  const router = useRouter();
  const { stream, setStream } = useStream();
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // useEffect(() => { logic to push to lobby if not logged in
  //   if (!socket.active) {
  //     router.push("/");
  //   }
  // }, [socket]);

  useEffect(() => {
    console.log("rannnnn");
    videoRef.current!.srcObject = stream;
    console.log(videoRef);
  }, [stream]);

  const handleJoined = useCallback(async (data: { userId: string }) => {
    setOpp(data.userId);
    console.log(`${data.userId} connected to the Room`);
    handleCall();
  }, []);

  const handleCall = useCallback(async () => {
    if (opp) {
      // console.log("ransd", opp);
      const offer = await peer.getOffer();
      socket.emit("call:initiated", { to: opp, offer });
    }
  }, [opp, socket]);

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
    [socket]
  );

  const sendStreams = useCallback(() => {
    if (stream) {
      const senders = peer.peer.getSenders();
      const tracksToAdd = stream.getTracks().filter((track) => {
        return !senders.some((sender) => sender.track === track);
      });

      tracksToAdd.forEach((track) => {
        peer.peer.addTrack(track, stream);
      });
    }
  }, []);
  const handleCallStarted = useCallback(
    ({ ans, from }: { ans: RTCLocalSessionDescriptionInit; from: string }) => {
      peer.setLocalDescription(ans);
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
    async ({
      from,
      offer,
    }: {
      from: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      console.log(offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
      sendStreams();
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(
    async ({ ans }: { ans: RTCLocalSessionDescriptionInit }) => {
      await peer.setLocalDescription(ans);
    },
    []
  );

  useEffect(() => {
    peer.peer.addEventListener("track", async (e) => {
      const remoteStream = e.streams;
      remoteStream[0].getTracks().forEach((track) => console.log(track));
      setRemoteStream(remoteStream[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream[0];
      }
      remoteStream[0]
        .getTracks()
        .forEach((track) => console.log(track.enabled));
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
  }, [
    socket,
    handleJoined,
    handleCallReceived,
    handleCallStarted,
    handleNegoNeedFinal,
    handleNegoNeedIncoming,
  ]);

  return (
    <>
      <div className="flex justify-center items-center flex-col h-screen">
        <div className="absolute top-2 left-2 text-[#C0B9DD] flex justify-center items-center flex-col">
          <Image
            height={40}
            width={80}
            alt=""
            src="/logo.svg"
            className="drop-shadow-2xl"
          />
          <p>
            By: <span className="text-[#80A1D4]">Farzad</span> &{" "}
            <span className="text-[#80A1D4]">Pulkit</span>
          </p>
        </div>
        <div className="flex gap-2 px-5 flex-col md:flex-row">
          <div className="relative flex justify-center ">
            <div className="relative  rounded-2xl">
                <>
                  <p className="absolute top-0">{opp}</p>
                  <video
                    // poster="/green.png"
                    height={740}
                    width={940}
                    ref={remoteVideoRef}
                    autoPlay
                    className="rounded-2xl z-40 object-fit custom"
                  ></video>
                </>
            </div>
          </div>
        </div>
        <video
          poster="/green.png"
          height={740}
          width={340}
          ref={videoRef}
          autoPlay
          className="absolute bottom-4 right-5 rounded-2xl object-fit"
        ></video>
        <ChatBox />
        <Bottombar videoRef={videoRef} handleCall={handleCall} />
      </div>
    </>
  );
};

export default Page;
