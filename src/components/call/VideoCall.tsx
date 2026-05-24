'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Video, Mic, MicOff, VideoOff, PhoneOff, X } from 'lucide-react';

interface VideoCallProps {
  roomId: string;
  userId: string;
  userName: string;
}

export default function VideoCall({ roomId, userId, userName }: VideoCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const socketRef = useRef<any>(null);
  const peerRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const [searchParams] = useSearchParams();

  // Initialize socket connection
  useEffect(() => {
    // Get socket URL from environment or use default
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket'],
    });

    setupSocketListeners();

    return () => {
      cleanup();
      socketRef.current.disconnect();
    };
  }, []);

  // Setup socket event listeners
  const setupSocketListeners = useCallback(() => {
    const socket = socketRef.current;
    
    socket.on('connect', () => {
      console.log('Connected to socket server');
      // Join the room
      socket.emit('join-room', { roomId, userId, userName });
    });

    socket.on('user-joined', ({ userId: newUserId, userName: newUserName }) => {
      console.log(`User joined: ${newUserName}`);
      // Create peer connection for the new user
      createPeer(newUserId, true); // true = initiator
    });

    socket.on('user-left', ({ userId }) => {
      console.log(`User left: ${userId}`);
      if (peerRef.current && peerRef.current.userId === userId) {
        peerRef.current.destroy();
        peerRef.current = null;
        setRemoteStream(null);
        setIsConnected(false);
      }
    });

    socket.on('signal', (data) => {
      if (peerRef.current) {
        peerRef.current.signal(data.signal);
      }
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
      setError(err.message || 'Socket error occurred');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });
  }, [roomId, userId, userName]);

  // Get user media (camera and microphone)
  useEffect(() => {
    const getLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        
        // Set local video element srcObject
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setError('Failed to access camera and microphone');
        setIsLoading(false);
      }
    };

    getLocalStream();
  }, []);

  // Create WebRTC peer connection
  const createPeer = useCallback((userId: string, initiator: boolean) => {
    if (!localStream) {
      console.error('Local stream not available');
      return null;
    }

    const peer = new SimplePeer({
      initiator,
      stream: localStream,
      trickle: false,
    });

    peer.on('signal', (data: any) => {
      // Send signal to the other user via socket
      socketRef.current.emit('signal', {
        roomId,
        userId: userId,
        signal: data,
      });
    });

    peer.on('stream', (stream: MediaStream) => {
      setRemoteStream(stream);
      setIsConnected(true);
      
      // Set remote video element srcObject
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    peer.on('close', () => {
      setIsConnected(false);
      setRemoteStream(null);
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      setError('Connection error');
    });

    // Store userId for cleanup
    (peer as any).userId = userId;
    return peer;
  }, [localStream, roomId, socketRef]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setIsConnected(false);
  }, []);

  // Toggle mute/unmute
  const toggleMute = useCallback(() => {
    if (!localStream) return;
    
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  }, [localStream]);

  // Toggle video on/off
  const toggleVideo = useCallback(() => {
    if (!localStream) return;
    
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  }, [localStream]);

  // End call
  const endCall = useCallback(() => {
    cleanup();
    // Notify others that we're leaving
    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId, userId });
    }
    // Navigate back or redirect
    router.push('/');
  }, [cleanup, router, roomId, userId, socketRef]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary mb-4">
            <Video className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-medium text-gray-900">Setting up call...</h2>
          <p className="mt-2 text-sm text-gray-500">
            Accessing camera and microphone
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-50/20 text-red-500 mb-4">
            <X className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-medium text-gray-900">Call Error</h2>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <Button variant="outline" onClick={endCall}>
            End Call
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Call Header */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/20 text-primary flex-shrink-0">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Call in Room {roomId.substring(0, 8)}...
              </h3>
              <p className="text-sm text-gray-500">
                {userName} • {isConnected ? 'Connected' : 'Connecting...'}
              </p>
            </div>
          </div>
          <Button 
            variant="destructive" 
            size="icon" 
            onClick={endCall}
            className="p-2"
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Call Content */}
      <div className="flex flex-col items-center pt-6 pb-10">
        {/* Local Video Preview */}
        <div className="w-full max-w-2xl mb-6">
          <div className="relative overflow-hidden rounded-xl bg-gray-200">
            <video 
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-64 object-cover"
            />
            {!localStream && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
                <div className="text-center text-white">
                  <Video className="h-6 w-6 mb-2" />
                  <p className="text-sm">No video</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between px-4">
            <span className="text-sm text-gray-600">Your Video</span>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleMute}
                className="p-2"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleVideo}
                className="p-2"
                aria-label={isVideoOff ? 'Show Video' : 'Hide Video'}
              >
                {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Remote Video */}
        <div className="w-full max-w-2xl">
          <div className="relative overflow-hidden rounded-xl bg-gray-200">
            <video 
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-96 object-cover"
            />
            {!remoteStream && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
                <div className="text-center text-white">
                  <Video className="h-6 w-6 mb-2" />
                  <p className="text-sm">Waiting for remote video...</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-2 text-center text-sm text-gray-600">
            {isConnected ? 'Remote Video' : 'Connecting...'}
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && remoteStream && (
          <div className="mt-4 px-6 py-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Video className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Connected</p>
                <p className="text-xs text-green-600">Call is active</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}