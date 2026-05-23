"use client";

import React, { useEffect, useRef, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, Phone, Monitor, User } from "lucide-react";

interface CallInfo {
  id: string;
  callerId: string;
  callerName: string;
  receiverId: string;
  receiverName: string;
  status: string;
  type: string;
}

// STUN servers for WebRTC (public free servers)
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export default function CallPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const callId = resolvedParams.id;
  
  const router = useRouter();
  const [callInfo, setCallInfo] = useState<CallInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<string>("connecting");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Get current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        const data = await res.json();
        if (data._id) {
          setCurrentUserId(data._id);
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch call info
  useEffect(() => {
    let isCancelled = false;
    
    const fetchCallInfo = async () => {
      try {
        const res = await fetch(`/api/calls/${callId}`, {
          credentials: "include",
        });
        const data = await res.json();
        
        if (!isCancelled && data.call) {
          setCallInfo(data.call);
          
          // Determine if we're the caller or receiver
          const isCaller = data.call.callerId === currentUserId;
          
          // Check call status - if accepted, update status
          if (data.call.status === "accepted") {
            // Call was accepted, both parties can now connect
            setCallStatus("accepted");
          } else if (data.call.status === "pending") {
            setCallStatus(isCaller ? "calling" : "waiting");
          } else {
            setCallStatus(data.call.status || (isCaller ? "calling" : "waiting"));
          }
        } else if (!isCancelled) {
          setError("Call not found");
        }
      } catch (err) {
        if (!isCancelled) {
          setError("Failed to load call info");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    if (currentUserId) {
      fetchCallInfo();
      
      // Poll for call status updates every 2 seconds
      const interval = setInterval(() => {
        if (callStatus === "calling" || callStatus === "waiting") {
          fetchCallInfo();
        }
      }, 2000);
      
      return () => {
        isCancelled = true;
        clearInterval(interval);
      };
    }
  }, [callId, currentUserId, callStatus]);

  // Initialize local media stream
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setError("Could not access camera/microphone. Please check permissions.");
      return null;
    }
  }, []);

  // Create WebRTC peer connection
  const createPeerConnection = useCallback((stream: MediaStream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    
    // Add local tracks to the connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });
    
    // Handle incoming remote tracks
    pc.ontrack = (event) => {
      console.log("Received remote track:", event.streams[0]);
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setCallStatus("connected");
      }
    };
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE candidate:", event.candidate);
      }
    };
    
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setCallStatus("connected");
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setCallStatus("disconnected");
      }
    };
    
    peerConnectionRef.current = pc;
    return pc;
  }, []);

  // Start the call (for caller)
  const startCall = useCallback(async () => {
    const stream = await initializeMedia();
    if (!stream) return;
    
    const pc = createPeerConnection(stream);
    
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Send offer to server (in production, this would go to a signaling server)
      const res = await fetch(`/api/calls/${callId}/offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ offer: pc.localDescription }),
      });
      
      const data = await res.json();
      if (data.answer) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
      
      setCallStatus("calling");
    } catch (err) {
      console.error("Error starting call:", err);
    }
  }, [initializeMedia, createPeerConnection, callId]);

  // Answer the call (for receiver)
  const answerCall = useCallback(async () => {
    const stream = await initializeMedia();
    if (!stream) return;
    
    const pc = createPeerConnection(stream);
    
    try {
      // Get offer from server
      const offerRes = await fetch(`/api/calls/${callId}/offer`, {
        credentials: "include",
      });
      const offerData = await offerRes.json();
      
      if (offerData.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(offerData.offer));
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        // Send answer to server
        await fetch(`/api/calls/${callId}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ answer: pc.localDescription }),
        });
        
        setCallStatus("connected");
      }
    } catch (err) {
      console.error("Error answering call:", err);
    }
  }, [initializeMedia, createPeerConnection, callId]);

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // End call
  const endCall = useCallback(async () => {
    try {
      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      
      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      
      // Update call status on server
      await fetch(`/api/calls/${callId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "ended" }),
      });
      
      // Redirect to dashboard
      router.push("/client/dashboard");
    } catch (err) {
      console.error("Error ending call:", err);
      router.push("/client/dashboard");
    }
  }, [callId, router]);

  // Auto-start WebRTC when call is accepted (for both caller and receiver)
  const hasAutoConnected = useRef(false);
  const startCallRef = useRef(startCall);
  const answerCallRef = useRef(answerCall);
  
  // Keep refs updated
  startCallRef.current = startCall;
  answerCallRef.current = answerCall;
  
  useEffect(() => {
    // Auto-connect when call is accepted - works for both caller and receiver
    if (callStatus === "accepted" && callInfo && currentUserId && !hasAutoConnected.current) {
      const isCaller = callInfo.callerId === currentUserId;
      hasAutoConnected.current = true;
      
      if (isCaller) {
        // Caller: start the call (send offer)
        setTimeout(() => {
          startCallRef.current?.();
        }, 1500);
      } else {
        // Receiver (professional): answer the call
        setTimeout(() => {
          answerCallRef.current?.();
        }, 500);
      }
    }
  }, [callStatus, callInfo, currentUserId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading call...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => router.push("/client/dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCaller = callInfo?.callerId === currentUserId;
  const otherPartyName = isCaller ? callInfo?.receiverName : callInfo?.callerName;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gray-800 flex justify-between items-center">
        <div className="text-white">
          <h1 className="text-xl font-semibold">Video Call</h1>
          <p className="text-gray-400 text-sm">
            {callStatus === "connected" 
              ? `Connected with ${otherPartyName}` 
              : callStatus === "calling"
              ? `Calling ${otherPartyName}...`
              : `Waiting for ${otherPartyName} to answer...`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            callStatus === "connected" ? "bg-green-500" : 
            callStatus === "calling" ? "bg-yellow-500" : "bg-red-500"
          }`}></span>
          <span className="text-white text-sm capitalize">{callStatus}</span>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative p-4">
        {/* Remote Video (main) */}
        <div className="w-full h-full bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
          {callStatus === "connected" ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-white text-lg">{otherPartyName}</p>
              <p className="text-gray-400">
                {callStatus === "calling" ? "Ringing..." : "Waiting to connect..."}
              </p>
            </div>
          )}
        </div>

        {/* Local Video (picture-in-picture) */}
        <div className="absolute bottom-8 right-8 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600">
          {callStatus !== "connecting" ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-gray-800">
        {callStatus === "connecting" && (
          <div className="flex justify-center gap-4 mb-4">
            {isCaller ? (
              <Button
                onClick={startCall}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
              >
                <Phone className="w-5 h-5 mr-2" />
                Start Call
              </Button>
            ) : (
              <Button
                onClick={answerCall}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
              >
                <Phone className="w-5 h-5 mr-2" />
                Answer Call
              </Button>
            )}
          </div>
        )}
        
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={toggleMute}
            className={`rounded-full w-14 h-14 ${
              isMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-700"
            }`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={toggleVideo}
            className={`rounded-full w-14 h-14 ${
              isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-gray-700"
            }`}
          >
            {isVideoOff ? (
              <VideoOff className="w-6 h-6 text-white" />
            ) : (
              <Video className="w-6 h-6 text-white" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-14 h-14 bg-gray-700"
          >
            <Monitor className="w-6 h-6 text-white" />
          </Button>
          
          <Button
            variant="destructive"
            size="lg"
            onClick={endCall}
            className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
          >
            <Phone className="w-6 h-6 text-white rotate-[135deg]" />
          </Button>
        </div>
      </div>
    </div>
  );
}
