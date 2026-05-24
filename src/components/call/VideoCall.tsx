'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
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

	// Load peer ONLY in browser runtime (NO build-time import)
	const loadPeer = async () => {
		return (await import('simple-peer')).default;
	};

	// Socket connection
	useEffect(() => {
		const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

		socketRef.current = io(socketUrl, {
			transports: ['websocket'],
		});

		setupSocketListeners();

		return () => {
			cleanup();
			socketRef.current?.disconnect();
		};
	}, []);

	const setupSocketListeners = useCallback(() => {
		const socket = socketRef.current;

		socket.on('connect', () => {
			socket.emit('join-room', { roomId, userId, userName });
		});

		socket.on('user-joined', ({ userId: newUserId }) => {
			void createPeer(newUserId, true);
		});

		socket.on('user-left', ({ userId }) => {
			if (peerRef.current?.userId === userId) {
				peerRef.current.destroy();
				peerRef.current = null;
				setRemoteStream(null);
				setIsConnected(false);
			}
		});

		socket.on('signal', (data) => {
			peerRef.current?.signal(data.signal);
		});

		socket.on('disconnect', () => {
			setIsConnected(false);
		});
	}, [roomId, userId, userName]);

	// Get camera/mic
	useEffect(() => {
		const getMedia = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: true,
				});

				setLocalStream(stream);

				if (localVideoRef.current) {
					localVideoRef.current.srcObject = stream;
				}

				setIsLoading(false);
			} catch (err) {
				setError('Camera / Microphone access denied');
				setIsLoading(false);
			}
		};

		getMedia();
	}, []);

	// CREATE PEER (FIXED - async dynamic import)
	const createPeer = useCallback(
		async (userId: string, initiator: boolean) => {
			if (!localStream) return;

			const SimplePeer = (await import('simple-peer')).default;

			const peer = new SimplePeer({
				initiator,
				stream: localStream,
				trickle: false,
			});

			peer.on('signal', (data: any) => {
				socketRef.current.emit('signal', {
					roomId,
					userId,
					signal: data,
				});
			});

			peer.on('stream', (stream: MediaStream) => {
				setRemoteStream(stream);
				setIsConnected(true);

				if (remoteVideoRef.current) {
					remoteVideoRef.current.srcObject = stream;
				}
			});

			peer.on('close', () => {
				setIsConnected(false);
				setRemoteStream(null);
			});

			peer.on('error', () => {
				setError('Connection error');
			});

			(peer as any).userId = userId;
			peerRef.current = peer;

			return peer;
		},
		[localStream, roomId]
	);

	// Cleanup
	const cleanup = useCallback(() => {
		peerRef.current?.destroy();
		peerRef.current = null;

		localStream?.getTracks().forEach((t) => t.stop());

		setLocalStream(null);
		setRemoteStream(null);
		setIsConnected(false);
	}, [localStream]);

	// Controls
	const toggleMute = () => {
		const audio = localStream?.getAudioTracks()[0];
		if (audio) {
			audio.enabled = !audio.enabled;
			setIsMuted(!audio.enabled);
		}
	};

	const toggleVideo = () => {
		const video = localStream?.getVideoTracks()[0];
		if (video) {
			video.enabled = !video.enabled;
			setIsVideoOff(!video.enabled);
		}
	};

	const endCall = () => {
		cleanup();
		socketRef.current?.emit('leave-room', { roomId, userId });
		router.push('/');
	};

	// Loading UI
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Video className="animate-pulse" />
				<p>Setting up call...</p>
			</div>
		);
	}

	// Error UI
	if (error) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center">
					<X />
					<p>{error}</p>
					<Button onClick={endCall}>End Call</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="h-screen bg-black text-white">
			{/* Local Video */}
			<video ref={localVideoRef} autoPlay muted playsInline className="w-1/3" />

			{/* Remote Video */}
			<video ref={remoteVideoRef} autoPlay playsInline className="w-full" />

			{/* Controls */}
			<div className="flex gap-2 p-4">
				<Button onClick={toggleMute}>
					{isMuted ? <MicOff /> : <Mic />}
				</Button>

				<Button onClick={toggleVideo}>
					{isVideoOff ? <VideoOff /> : <Video />}
				</Button>

				<Button onClick={endCall}>
					<PhoneOff />
				</Button>
			</div>
		</div>
	);
}