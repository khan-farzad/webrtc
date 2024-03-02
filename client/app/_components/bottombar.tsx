import React, { RefObject } from "react";
import {
  FaMicrophoneAlt,
  FaMicrophoneAltSlash,
  FaVideoSlash,
} from "react-icons/fa";
import { FaVideo } from "react-icons/fa6";
import { MdScreenShare, MdStopScreenShare } from "react-icons/md";
import { PiPhoneDisconnectFill } from "react-icons/pi";
import { useMediaFunctions } from "../mediaUtils";
import { IoMdCall } from "react-icons/io";

const Bottombar = ({ videoRef,handleCall }: { videoRef: RefObject<HTMLVideoElement>;handleCall:()=>void }) => {
  const {
    handleMute,
    handleSendAudio,
    show,
    sendAudio,
    handleHide,
    handleShow,
  } = useMediaFunctions();
  return (
    <div
      className="
        bg-[#DED9E2]
        drop-shadow-xl
        hover:drop-shadow-2xl
        shadow-2xl
        absolute 
        bottom-3 
        right-[50%] 
        translate-x-[50%]
        h-14
        rounded-3xl
        p-2
        flex
        justify-center
        items-center
        gap-3
        px-6
        z-10
        "
    >
      <button
        onClick={handleCall}
        className={`h-8 w-8 bg- rounded-full flex items-center custom justify-center transition duration-1000 delay-1000`}
      >
        <IoMdCall />
      </button>
      <button
        onClick={sendAudio ? handleMute : () => handleSendAudio(videoRef)}
        className={`h-8 w-8 bg- rounded-full flex items-center ${!sendAudio ? "custom" : "custom2"} justify-center`}
      >
        {sendAudio ? <FaMicrophoneAltSlash /> : <FaMicrophoneAlt />}
      </button>
      <button
        onClick={show ? () => handleHide(videoRef) : () => handleShow(videoRef)}
        className={`h-8 w-8 bg- rounded-full  flex items-center justify-center ${!show ? "custom" : "custom2"}`}
      >
        {show ? <FaVideoSlash /> : <FaVideo />}
      </button>
      <button className="h-8 w-8 bg- rounded-full custom2 flex items-center justify-center custom">
        {" "}
        <MdStopScreenShare  />
      </button>
      <button className="h-8 w-8 custom hover:custom2 bg-red-500 rounded-full shadow-inner  flex items-center justify-center red">
        {" "}
        <PiPhoneDisconnectFill />
      </button>
    </div>
  );
};

export default Bottombar;
