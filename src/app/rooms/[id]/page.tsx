'use client';

export const runtime = 'edge';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getRoom, isUserInRoom, hasUserRequestedRoom, createRequest, getRequestsForRoom, updateRequest, getParticipants } from '@/lib/store';
import { Room, JoinRequest, RoomParticipant } from '@/types';
import { MapPin, Users, Calendar, Clock, ArrowLeft, Send, Check, X, User, Trophy, MessageSquare } from 'lucide-react';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [hasRequested, setHasRequested] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const roomId = params.id as string;
    const roomData = getRoom(roomId);

    if (roomData) {
      setRoom(roomData);
      setRequests(getRequestsForRoom(roomId));
      setParticipants(getParticipants(roomId));

      if (user) {
        setHasRequested(hasUserRequestedRoom(user.id, roomId));
        setIsInRoom(isUserInRoom(user.id, roomId));
        setIsCreator(roomData.creator_id === user.id);
      }
    }

    setLoading(false);
  }, [params.id, user]);

  const handleJoinRequest = () => {
    if (!user || !room) return;
    createRequest(room.id, user.id, joinMessage);
    setShowJoinModal(false);
    setJoinMessage('');
    setHasRequested(true);
    setRequests(getRequestsForRoom(room.id));
  };

  const handleRequestAction = (requestId: string, action: 'approved' | 'rejected') => {
    updateRequest(requestId, action);
    if (room) {
      setRequests(getRequestsForRoom(room.id));
      setParticipants(getParticipants(room.id));
      // Reload room to get updated player count
      const updatedRoom = getRoom(room.id);
      if (updatedRoom) setRoom(updatedRoom);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-400">Match not found</h2>
        <Link href="/rooms" className="text-green-500 hover:text-green-400 mt-4 inline-block">
          Back to matches
        </Link>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const skillLabels: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    professional: 'Professional',
    any: 'All Levels Welcome',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/rooms" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to matches</span>
      </Link>

      {/* Main Info */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{room.title}</h1>
            <div className="flex flex-wrap gap-2">
              <span className={`badge ${room.skill_level_required === 'any' ? 'badge-green' : 'badge-blue'}`}>
                {skillLabels[room.skill_level_required]}
              </span>
              <span className={`badge ${room.status === 'open' ? 'badge-green' : 'badge-gray'}`}>
                {room.status}
              </span>
            </div>
          </div>
          {user && !isCreator && !isInRoom && !hasRequested && room.status === 'open' && room.current_players < room.max_players && (
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Request to Join</span>
            </button>
          )}
          {hasRequested && !isInRoom && (
            <span className="badge badge-yellow">Request Pending</span>
          )}
          {isInRoom && (
            <span className="badge badge-green">You&apos;re In!</span>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-300">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">{room.stadium?.name}</p>
                <p className="text-sm text-gray-500">{room.stadium?.address}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span>{new Date(room.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <Clock className="w-5 h-5 text-gray-500" />
              <span>{room.start_time} - {room.end_time}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-300">
              <Users className="w-5 h-5 text-gray-500" />
              <span>{room.current_players}/{room.max_players} players</span>
            </div>
            {room.stadium && (
              <div className="flex items-center space-x-3 text-gray-300">
                <Trophy className="w-5 h-5 text-gray-500" />
                <span>{room.stadium.price_per_hour} AZN/hour</span>
              </div>
            )}
          </div>
        </div>

        {room.description && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="font-medium text-gray-300 mb-2">Description</h3>
            <p className="text-gray-400">{room.description}</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Players</span>
            <span className="text-sm text-gray-400">{room.max_players - room.current_players} spots left</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${(room.current_players / room.max_players) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Participants ({participants.length})</h2>
        {participants.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {participants.map((p, index) => (
              <div key={p.id} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Player {index + 1}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(p.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No participants yet</p>
        )}
      </div>

      {/* Join Requests (for creator) */}
      {isCreator && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">
            Join Requests
            {pendingRequests.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </h2>
          {requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">{request.user?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">
                        {request.user?.preferred_position} | {request.user?.skill_level}
                      </p>
                      {request.message && (
                        <p className="text-sm text-gray-400 mt-1 flex items-center space-x-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>&quot;{request.message}&quot;</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {request.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleRequestAction(request.id, 'approved')}
                          className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRequestAction(request.id, 'rejected')}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className={`badge ${request.status === 'approved' ? 'badge-green' : 'badge-red'}`}>
                        {request.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No requests yet</p>
          )}
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Request to Join</h2>
            <p className="text-gray-400 mb-4">
              Send a request to the room admin. They&apos;ll review your profile and decide.
            </p>
            <div className="mb-4">
              <label className="label">Message (optional)</label>
              <textarea
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                className="input"
                rows={3}
                placeholder="Introduce yourself or mention your experience..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleJoinRequest}
                className="btn-primary flex-1"
              >
                Send Request
              </button>
              <button
                onClick={() => setShowJoinModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
