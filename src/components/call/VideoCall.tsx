'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Video, Mic, MicOff, VideoOff, PhoneOff, X } from 'lucide-react';
import SimplePeer from 'simple-peer';

interface VideoCallProps {
	roomId: string;
	userId: string;
	userName: string;
}

type SignalData = {
	signal: SimplePeer.SignalData;
	from: string;
};

export default function VideoCall({
	roomId,
	userId,
	userName,
}: VideoCallProps) {
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [isVideoOff, setIsVideoOff] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const socketRef = useRef<Socket | null>(null);
	const peerRef = useRef<SimplePeer.Instance | null>(null);

	const localVideoRef = useRef<HTMLVideoElement | null>(null);
	const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

	const router = useRouter();

	// ================= SOCKET =================
	useEffect(() => {
		const socketUrl =
			process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

		const socket = io(socketUrl, {
			transports: ['websocket'],
		});

		socketRef.current = socket;

		socket.on('connect', () => {
			socket.emit('join-room', { roomId, userId, userName });
		});

		socket.on('user-joined', async ({ userId: newUserId }: { userId: string }) => {
			await createPeer(newUserId, true);
		});

		socket.on('signal', async (data: SignalData) => {
			if (peerRef.current) {
				peerRef.current.signal(data.signal);
			}
		});

		socket.on('user-left', ({ userId: leftUserId }: { userId: string }) => {
			if ((peerRef.current as any)?.userId === leftUserId) {
				peerRef.current?.destroy();
				peerRef.current = null;
				setRemoteStream(null);
				setIsConnected(false);
			}
		});

		socket.on('disconnect', () => {
			setIsConnected(false);
		});

		return () => {
			socket.disconnect();
		};
	}, [roomId, userId, userName]);

	// ================= MEDIA =================
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
			} catch {
				setError('Camera / Microphone access denied');
				setIsLoading(false);
			}
		};

		getMedia();
	}, []);

	// ================= PEER =================
	const createPeer = useCallback(
		async (remoteUserId: string, initiator: boolean) => {
			if (!localStream || !socketRef.current) return;

			const peer = new SimplePeer({
				initiator,
				trickle: false,
				stream: localStream,
			});

			peer.on('signal', (data) => {
				socketRef.current?.emit('signal', {
					roomId,
					userId: remoteUserId,
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

			(peer as any).userId = remoteUserId;

			peerRef.current = peer;
		},
		[localStream, roomId]
	);

	// ================= CLEANUP =================
	const cleanup = useCallback(() => {
		peerRef.current?.destroy();
		peerRef.current = null;

		localStream?.getTracks().forEach((t) => t.stop());

		setLocalStream(null);
		setRemoteStream(null);
		setIsConnected(false);
	}, [localStream]);

	// ================= CONTROLS =================
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

	// ================= UI =================
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Video className="animate-pulse" />
				<p className="ml-2">Setting up call...</p>
			</div>
		);
	}

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
		<div className="h-screen bg-black text-white relative">
			{/* Remote Video */}
			<video
				ref={remoteVideoRef}
				autoPlay
				playsInline
				className="w-full h-full object-cover"
			/>

			{/* Local Video */}
			<video
				ref={localVideoRef}
				autoPlay
				muted
				playsInline
				className="absolute bottom-4 right-4 w-48 h-32 border rounded-lg"
			/>

			{/* Controls */}
			<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
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