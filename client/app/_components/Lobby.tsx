"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import socket from "../Providers/client-server";
import peer from "../Providers/peer";

const Lobby = () => {
  const router = useRouter();
  const [room, setRoom] = useState("");


  const handleClick = useCallback(() => {
    console.log(socket.id,'trying to join room:',room)
    socket.emit("join", room);
    router.push(`/room/${room}`)
  }, [socket, room]);

  return (
    <>
      <input
      autoFocus
        placeholder="Enter RoomId to Join"
        value={room}
        onChange={(e) => { 
          setRoom(e.target.value)
        }}
      />
      <button onClick={handleClick}>Go To Room</button>
    </>
  );
};

export default Lobby;
