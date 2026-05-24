'use client';

import { useState, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import VideoCall from '@/components/call/VideoCall';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Phone, Video, Link, Users } from 'lucide-react';

export default function VideoCallPage() {
  const [roomId, setRoomId] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [searchParams] = useSearchParams();

  // Check if we're joining from a URL with room ID
  const urlRoomId = searchParams.get('room');
  const urlUserId = searchParams.get('userId');
  const urlUserName = searchParams.get('userName');

  // Auto-fill from URL params if available
  if (urlRoomId && !roomId) setRoomId(urlRoomId);
  if (urlUserId && !userId) setUserId(urlUserId);
  if (urlUserName && !userName) setUserName(decodeURIComponent(urlUserName));

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomId.trim() || !userId.trim() || !userName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      // Generate a simple user ID if not provided
      const finalUserId = userId || Math.random().toString(36).substring(2, 9);
      
      // Navigate to the call page with parameters
      router.push(`/video-call?room=${encodeURIComponent(roomId)}&userId=${encodeURIComponent(finalUserId)}&userName=${encodeURIComponent(userName)}`);
    } catch (err) {
      setError('Failed to join call');
      setIsJoining(false);
    }
  };

  // If we have all required params from URL, show the call directly
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
          <h1 className="text-3xl font-bold text-gray-900">
            Video Call
          </h1>
          <p className="text-lg text-gray-600">
            Connect face-to-face with secure, high-quality video
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6 bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room ID
              </label>
              <div className="relative">
                <Input
                  placeholder="Enter room ID or create new"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => {
                    // Generate a random room ID
                    const randomId = Math.random().toString(36).substring(2, 9).toUpperCase();
                    setRoomId(randomId);
                  }}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                >
                  <Users className="h-4 w-4" />
                </button>
              </div>
              {roomId && (
                <p className="mt-1 text-sm text-gray-500">
                  Share this ID with others to join the call: <code className="bg-gray-100 px-2 py-1 rounded">{roomId}</code>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <Input
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID (Optional)
              </label>
              <Input
                placeholder="Leave blank to generate automatically"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <p className="mt-1 text-sm text-gray-500">
                Used for reconnecting if disconnected
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-3 px-6"
            disabled={isJoining}
          >
            {isJoining ? (
              <>
                <Video className="h-4 w-4 mr-2" />
                Joining...
              </>
            ) : (
              <>
                <Video className="h-4 w-4 mr-2" />
                Join Call
              </>
            )}
          </Button>

          <div className="text-center text-sm text-gray-500">
            <p>
              Need help? <a href="#" className="text-primary hover:underline">Contact support</a>
            </p>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 rounded-lg px-4 py-3">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}