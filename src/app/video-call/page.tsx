'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import VideoCall from '@/components/call/VideoCall';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Video, Users } from 'lucide-react';

export default function VideoCallPage() {
	const [roomId, setRoomId] = useState('');
	const [userId, setUserId] = useState('');
	const [userName, setUserName] = useState('');
	const [isJoining, setIsJoining] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const router = useRouter();
	const searchParams = useSearchParams();

	const urlRoomId = searchParams.get('room');
	const urlUserId = searchParams.get('userId');
	const urlUserName = searchParams.get('userName');

	// Fill from URL safely
	useEffect(() => {
		if (urlRoomId) setRoomId(urlRoomId);
		if (urlUserId) setUserId(urlUserId);
		if (urlUserName) setUserName(decodeURIComponent(urlUserName));
	}, [urlRoomId, urlUserId, urlUserName]);

	const handleJoin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!roomId.trim() || !userName.trim()) {
			setError('Please fill in all fields');
			return;
		}

		setIsJoining(true);
		setError(null);

		try {
			const finalUserId =
				userId || Math.random().toString(36).substring(2, 9);

			router.push(
				`/video-call?room=${encodeURIComponent(roomId)}&userId=${encodeURIComponent(
					finalUserId
				)}&userName=${encodeURIComponent(userName)}`
			);
		} catch {
			setError('Failed to join call');
			setIsJoining(false);
		}
	};

	if (urlRoomId && urlUserId && urlUserName) {
		return (
			<div className="min-h-screen bg-gray-50">
				<VideoCall
					roomId={urlRoomId}
					userId={urlUserId}
					userName={decodeURIComponent(urlUserName)}
				/>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="w-full max-w-md space-y-8 p-4">
				<div className="text-center">
					<div className="flex items-center justify-center h-16 w-16 rounded-xl bg-primary/10 text-primary mb-6">
						<Video className="h-8 w-8" />
					</div>
					<h1 className="text-3xl font-bold">Video Call</h1>
				</div>

				<form onSubmit={handleJoin} className="space-y-6 bg-white p-6 rounded-xl">
					<Input
						placeholder="Room ID"
						value={roomId}
						onChange={(e) => setRoomId(e.target.value)}
					/>

					<Input
						placeholder="Your Name"
						value={userName}
						onChange={(e) => setUserName(e.target.value)}
					/>

					<Input
						placeholder="User ID (optional)"
						value={userId}
						onChange={(e) => setUserId(e.target.value)}
					/>

					<Button type="submit" disabled={isJoining} className="w-full">
						<Video className="h-4 w-4 mr-2" />
						{isJoining ? 'Joining...' : 'Join Call'}
					</Button>

					{error && (
						<div className="text-red-500 text-sm">{error}</div>
					)}
				</form>
			</div>
		</div>
	);
}