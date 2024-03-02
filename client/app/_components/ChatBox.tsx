import React, { useState } from 'react'

const ChatBox = () => {
    const [showChat,setShowChat]=useState(false)
  return (
    <div 
        className='
            bg-[#C0B9DD]
            w-60
            rounded-t-xl
            p-2
            bottom-0
            left-20
            absolute
    '>
        <header onClick={()=>setShowChat(prev=>!prev)} className='flex justify-between  text-white hover:cursor-pointer'>
            <p>Chat</p>
            <p>X</p>
        </header>
        
        {showChat && <div className='h-72 w-full bg-white'>
            To be made
        </div>}
    </div>
  )
}

export default ChatBox