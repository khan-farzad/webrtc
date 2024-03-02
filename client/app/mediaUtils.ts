import { useState, useCallback } from 'react';
import useStream from './_hooks/useStream';
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const useMediaFunctions = () => {
  const [sendAudio, setSendAudio] = useState(true);
  const [show, setShow] = useState(true);
  const {stream,setStream}=useStream()

  const handleMute = useCallback(() => {
    stream?.getTracks().forEach(track => { if (track.kind === 'audio') { track.stop(), stream.removeTrack(track) } });
    setSendAudio(false);
  }, [stream]);

  const handleSendAudio = useCallback(async (videoRef: React.MutableRefObject<HTMLVideoElement | null>) => {
    let tempStream: MediaStream | null = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true } });
    let tempTrack = tempStream.getTracks()[0];
    stream?.addTrack(tempTrack);
    videoRef.current!.srcObject = stream;
    setSendAudio(true);
  }, [stream]);

  const handleHide = useCallback(( videoRef: React.MutableRefObject<HTMLVideoElement | null>) => {
    stream?.getTracks().forEach(track => { if (track.kind === 'video') { track.stop(), stream.removeTrack(track) } });
    stream?.getTracks().forEach(track => console.log(track));
    setShow(false);
    videoRef.current!.srcObject = null;
  }, [stream]);

  const handleShow = useCallback(async (videoRef: React.MutableRefObject<HTMLVideoElement | null>) => {
    let tempStream: MediaStream | null = await (await navigator.mediaDevices.getUserMedia({ video: true }));
    let tempTrack = tempStream.getTracks()[0];
    stream?.addTrack(tempTrack);
    stream?.getTracks().forEach(track => console.log(track));
    videoRef.current!.srcObject = stream;
    console.log(videoRef)
    setShow(true);
  }, [stream]);

  return { sendAudio, show, handleMute, handleSendAudio, handleHide, handleShow };
};
