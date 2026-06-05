'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Video, Mic, MicOff, VideoOff, PhoneOff, X, User } from 'lucide-react';
import SimplePeer from 'simple-peer';

interface VideoCallProps {
  roomId: string;
  userId: string;
  userName: string;
}

interface PeerData {
  peer: SimplePeer.Instance;
  userName: string;
}

export default function VideoCall({ roomId, userId, userName }: VideoCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [peerStatuses, setPeerStatuses] = useState<Map<string, boolean>>(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<Map<string, PeerData>>(new Map());
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null); // ← أضفنا هذا

  const router = useRouter();

  const getIceServers = useCallback(() => {
    const stun = process.env.NEXT_PUBLIC_STUN_SERVER || 'stun:stun.l.google.com:19302';
    const servers: RTCIceServer[] = [{ urls: stun }];
    const turn = process.env.NEXT_PUBLIC_TURN_SERVER;
    const turnUser = process.env.NEXT_PUBLIC_TURN_USERNAME || '';
    const turnCred = process.env.NEXT_PUBLIC_TURN_CREDENTIAL || '';
    if (turn) {
      servers.push({ urls: turn, username: turnUser, credential: turnCred });
    }
    return { iceServers: servers };
  }, []);

  // ================= MEDIA أولاً =================
  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });

        localStreamRef.current = stream; // ← احفظه في ref أيضاً
        setLocalStream(stream);
        setIsLoading(false);
      } catch (err) {
        console.error('Media error:', err);
        setError('تعذّر الوصول للكاميرا أو الميكروفون');
        setIsLoading(false);
      }
    };

    getMedia();

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ================= SOCKET — يبدأ فقط بعد جاهزية الـ stream =================
  useEffect(() => {
    if (!localStream) return; // ← انتظر حتى يكون الـ stream جاهز

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-room', { roomId, userId, userName });
    });

    socket.on('all-users', (existingUsers: string[]) => {
      existingUsers.forEach((remoteUserId) => {
        createPeer(remoteUserId, true); // ← الآن localStream موجود بالتأكيد
      });
    });

    socket.on('signal', (data: { userId: string; signal: SimplePeer.SignalData }) => {
      const { userId: senderUserId, signal } = data;

      let peer = peersRef.current.get(senderUserId)?.peer;

      if (!peer) {
        const newPeer = createPeer(senderUserId, false);
        if (!newPeer) return;
        peer = newPeer;
      }

      try {
        peer.signal(signal);
      } catch {
        // تجاهل الـ signal القديمة
      }
    });

    socket.on('user-left', ({ userId: leftUserId }: { userId: string }) => {
      removePeer(leftUserId);
    });

    return () => {
      peersRef.current.forEach(({ peer }) => peer.destroy());
      peersRef.current.clear();
      socket.disconnect();
    };
  }, [localStream]); // ← يشتغل مرة واحدة فقط لما localStream يصير جاهز

  // ================= LOCAL VIDEO =================
  useEffect(() => {
    const localVideo = document.getElementById('local-video') as HTMLVideoElement | null;
    if (localVideo && localStream) {
      localVideo.srcObject = localStream;
    }
  }, [localStream]);

  // ================= REMOTE VIDEOS =================
  useEffect(() => {
    remoteStreams.forEach((stream, remoteUserId) => {
      const videoEl = remoteVideoRefs.current.get(remoteUserId);
      if (videoEl && videoEl.srcObject !== stream) {
        videoEl.srcObject = stream;
      }
    });
  }, [remoteStreams]);

  // ================= PEER =================
  const createPeer = useCallback(
    (remoteUserId: string, initiator: boolean): SimplePeer.Instance | null => {
      const stream = localStreamRef.current; // ← نستخدم الـ ref مش الـ state
      if (!stream || !socketRef.current) return null;
      if (peersRef.current.has(remoteUserId)) {
        return peersRef.current.get(remoteUserId)!.peer;
      }

      const peer = new SimplePeer({
        initiator,
        trickle: true, // ✅ غيّرنا من false إلى true
        stream: stream,
        config: getIceServers(),
      });

      peer.on('signal', (data) => {
        socketRef.current?.emit('signal', {
          roomId,
          userId: remoteUserId,
          senderUserId: userId,
          signal: data,
        });
      });

      peer.on('stream', (remoteStream: MediaStream) => {
        setRemoteStreams((prev) => {
          const next = new Map(prev);
          next.set(remoteUserId, remoteStream);
          return next;
        });
        setPeerStatuses((prev) => {
          const next = new Map(prev);
          next.set(remoteUserId, true);
          return next;
        });
      });

      peer.on('close', () => {
        removePeer(remoteUserId);
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        removePeer(remoteUserId);
      });

      peersRef.current.set(remoteUserId, { peer, userName: '' });
      return peer;
    },
    [roomId, userId, getIceServers] // ← أزلنا localStream من هنا
  );

  const removePeer = useCallback((remoteUserId: string) => {
    const entry = peersRef.current.get(remoteUserId);
    if (entry) {
      try { entry.peer.destroy(); } catch { /* ignore */ }
      peersRef.current.delete(remoteUserId);
    }
    setRemoteStreams((prev) => { const next = new Map(prev); next.delete(remoteUserId); return next; });
    setPeerStatuses((prev) => { const next = new Map(prev); next.delete(remoteUserId); return next; });
  }, []);

  // ================= CONTROLS =================
  const toggleMute = () => {
    const audio = localStream?.getAudioTracks()[0];
    if (audio) { audio.enabled = !audio.enabled; setIsMuted(!audio.enabled); }
  };

  const toggleVideo = () => {
    const video = localStream?.getVideoTracks()[0];
    if (video) { video.enabled = !video.enabled; setIsVideoOff(!video.enabled); }
  };

  const endCall = useCallback(() => {
    peersRef.current.forEach(({ peer }) => peer.destroy());
    peersRef.current.clear();
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStreams(new Map());
    socketRef.current?.emit('leave-room', { roomId, userId });
    socketRef.current?.disconnect();
    router.push('/');
  }, [localStream, roomId, userId, router]);

  // ================= UI =================
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white">
        <Video className="h-10 w-10 animate-pulse mb-4" />
        <p className="text-lg font-medium">جاري الإعداد...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white">
        <div className="text-center p-6 rounded-xl bg-black/50">
          <X className="h-10 w-10 mx-auto mb-4 text-red-400" />
          <p className="text-lg mb-4">{error}</p>
          <Button variant="destructive" onClick={endCall}>إنهاء المكالمة</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black text-white relative overflow-hidden">
      {/* Remote Videos */}
      <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-4 p-4">
        {Array.from(remoteStreams.entries()).map(([remoteUserId, stream]) => (
          <div key={remoteUserId} className="relative flex-1 min-w-[300px] h-full max-h-full bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
            <video
              ref={(el) => {
                if (el) {
                  remoteVideoRefs.current.set(remoteUserId, el);
                  if (el.srcObject !== stream) el.srcObject = stream;
                } else {
                  remoteVideoRefs.current.delete(remoteUserId);
                }
              }}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{userName} ({remoteUserId.slice(0, 6)})</span>
            </div>
            {!peerStatuses.get(remoteUserId) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <p className="text-sm text-gray-400">جاري الاتصال...</p>
              </div>
            )}
          </div>
        ))}

        {remoteStreams.size === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <Video className="h-12 w-12 mb-4 animate-pulse" />
            <p className="text-lg">في انتظار الطرف الآخر...</p>
          </div>
        )}
      </div>

      {/* Local Video */}
      <div className="absolute bottom-4 right-4 w-48 h-32 bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-white/10 z-10">
        <video id="local-video" autoPlay muted playsInline className="w-full h-full object-cover" />
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 z-10 bg-black/60 p-3 rounded-full backdrop-blur">
        <Button variant="ghost" size="icon" onClick={toggleMute}
          className={`rounded-full w-12 h-12 ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}>
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleVideo}
          className={`rounded-full w-12 h-12 ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}>
          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>
        <Button variant="destructive" size="icon" onClick={endCall} className="rounded-full w-12 h-12">
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}