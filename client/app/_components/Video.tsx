'use client'
import React, { useEffect, useRef } from 'react'

const Video = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const getMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });
                console.log('sdf')
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing media devices:', error);
            }
        };
        // getMedia();
    }, []);

    useEffect(() => {
        const fn = () => {
            axios.get('http://localhost:3001/join')
                .then(res => {
                    
                })
            console.log('sdgasd')
        }
        fn()
    }, [])

    useEffect(() => {
        async function getConnectedDevices(type: any) {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === type)
        }
        const videoCameras = getConnectedDevices('videoinput');
        console.log(videoCameras);
    }, [])


    return (
        <div>
            <video ref={videoRef} autoPlay playsInline controls={false} />
        </div>
    );
}

export default Video;
