'use client'
import Image from "next/image";
import Lobby from "./_components/Lobby";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Lobby/>
    </div>
  );
}
