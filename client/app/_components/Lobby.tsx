"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import socket from "../Providers/client-server";
import useStream from "../_hooks/useStream";
import { cn, useMediaFunctions } from "../mediaUtils";
import Image from "next/image";
import {Waiting_for_the_Sunrise} from 'next/font/google'
import {
  FaArrowCircleRight,
  FaMicrophoneAlt,
  FaMicrophoneAltSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";

const font = Waiting_for_the_Sunrise({
  subsets: ["latin"],
  weight: ["400"],
});

const Lobby = () => {
  const router = useRouter();
  const [room, setRoom] = useState("");
  const { stream, setStream } = useStream();
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    handleMute,
    handleHide,
    handleSendAudio,
    handleShow,
    sendAudio,
    show,
  } = useMediaFunctions();

  const handleClick = useCallback(() => {
    console.log(socket.id, "trying to join room:", room);
    socket.emit("join", room);
    router.push(`/room/${room}`);
  }, [socket, room]);

  const getMedia = useCallback(async () => {
    console.log("running");
    let tempStream: MediaStream | null =
      await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
    setStream(tempStream);
  }, []);

  useEffect(() => {
    stream?.getTracks().forEach((track) => console.log(track));
    videoRef.current!.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    console.log("ran");
    socket.connect();
    socket.on("connected", getMedia);
    return () => {
      socket.connect();
      socket.off("connected", getMedia);
    };
  }, [socket]);

  const [inputShow, setSetInputShow] = useState(false);

  return (
    <>
      <div className="flex flex-col relative items-center  justify-center h-full w-full">
        <p className={cn(
            'font-semibold text-7xl text-[#75C9C8]',
            font.className
          )}>Video chat</p>
        <div className=" p-4 glas rounded-full overflow-clip">
          <video
            poster="/loader.jpg"
            ref={videoRef}
            autoPlay
            className="w-96 h-72 opacity "
          />
        </div>
        <div className="flex p-2 gap-2">
          <button
            onClick={sendAudio ? handleMute : () => handleSendAudio(videoRef)}
            className={`h-8 w-8 text-[#80A1D4] bg- rounded-full flex items-center ${!sendAudio ? "custom" : "custom2"} justify-center transition duration-1000 delay-1000`}
          >
            {sendAudio ? <FaMicrophoneAltSlash /> : <FaMicrophoneAlt />}
          </button>
          <button
            onClick={
              show ? () => handleHide(videoRef) : () => handleShow(videoRef)
            }
            className={`h-8 w-8 text-[#75C9C8] rounded-full  flex items-center justify-center ${!show ? "custom" : "custom2"}`}
          >
            {show ? <FaVideoSlash /> : <FaVideo />}
          </button>
        </div>
        <div className="relative">
          <input
          required
            autoFocus
            className={`p-2 pt-3 mt-1 custom3 rounded-3xl custom3 outline-none bg-[#F7F4EA]`}
            value={room}
            placeholder="Enter room Id"
            onChange={(e) => {
              setRoom(e.target.value);
            }}
          />
        </div>
        <button onClick={handleClick} className="text-[#C0B9DD]"><FaArrowCircleRight size={4} className="h-8 w-8 mt-3" /></button>
      </div>
    </>
  );
};

export default Lobby;
