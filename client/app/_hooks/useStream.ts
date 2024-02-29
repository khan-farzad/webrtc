import { create } from "zustand"

interface useStreamProps{
    stream:MediaStream|null;
    setStream:(stream:MediaStream|null)=>void;
}

const useStream=create<useStreamProps>((set)=>({
    stream:null,
    setStream:(tempStream)=>set({stream:tempStream})
}))
export default useStream;