'use client';

export const runtime = 'edge';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import { getRoom, isUserInRoom, hasUserRequestedRoom, createRequest, getRequestsForRoom, updateRequest, getParticipants, updateRoom, hasUserRatedInRoom, submitRating } from '@/lib/data';
import { Room, JoinRequest, RoomParticipant, User as UserType } from '@/types';
import { MapPin, Users, Calendar, Clock, ArrowLeft, Send, Check, X, User, Trophy, MessageSquare, Star, CheckCircle } from 'lucide-react';
import PlayerSlots from '@/components/PlayerSlots';
import RatePlayersModal from '@/components/RatePlayersModal';
import RoomChat from '@/components/RoomChat';
import ShareButton from '@/components/ShareButton';
import dynamic from 'next/dynamic';
import { formatDateDisplay } from '@/lib/dateUtils';

// Dynamic import for LocationMap to avoid SSR issues
const LocationMap = dynamic(() => import('@/components/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="h-48 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
      <MapPin className="w-8 h-8 text-gray-600" />
    </div>
  ),
});

export default function RoomDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [hasRequested, setHasRequested] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  const loadData = useCallback(async () => {
    const roomId = params.id as string;

    try {
      const roomData = await getRoom(roomId);

      if (roomData) {
        setRoom(roomData);

        const [roomRequests, roomParticipants] = await Promise.all([
          getRequestsForRoom(roomId),
          getParticipants(roomId),
        ]);

        setRequests(roomRequests);
        setParticipants(roomParticipants);

        if (user) {
          const [requested, inRoom, rated] = await Promise.all([
            hasUserRequestedRoom(user.id, roomId),
            isUserInRoom(user.id, roomId),
            hasUserRatedInRoom(user.id, roomId),
          ]);
          setHasRequested(requested);
          setIsInRoom(inRoom);
          setHasRated(rated);
          setIsCreator(roomData.creator_id === user.id);
        }
      }
    } catch (error) {
      console.error('Error loading room:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleJoinRequest = async () => {
    if (!user || !room) return;

    setSubmitting(true);
    try {
      await createRequest(room.id, user.id, joinMessage);
      setShowJoinModal(false);
      setJoinMessage('');
      setHasRequested(true);
      await loadData();
    } catch (error) {
      console.error('Error creating request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      await updateRequest(requestId, action);
      await loadData();
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const handleMarkComplete = async () => {
    if (!room || !isCreator) return;

    setMarkingComplete(true);
    try {
      await updateRoom(room.id, { status: 'completed' });
      await loadData();
    } catch (error) {
      console.error('Error marking room as complete:', error);
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleSubmitRatings = async (ratings: { userId: string; rating: { pace: number; shooting: number; passing: number; dribbling: number; defense: number; physical: number } }[]) => {
    if (!user || !room) return;

    for (const { userId, rating } of ratings) {
      await submitRating(room.id, user.id, userId, rating);
    }

    setHasRated(true);
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
        <h2 className="text-2xl font-bold text-gray-600">Match not found</h2>
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

  const participantUsers: UserType[] = participants
    .map(p => p.user)
    .filter((u): u is UserType => !!u);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/rooms" className="inline-flex items-center space-x-2 text-gray-600 hover:text-white transition-colors">
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
              <span className={`badge ${room.status === 'open' ? 'badge-green' : room.status === 'completed' ? 'badge-blue' : 'badge-gray'}`}>
                {room.status}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Share Button */}
            <ShareButton roomId={room.id} roomTitle={room.title} />

            {/* Join Request Button */}
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
            {isInRoom && room.status !== 'completed' && (
              <span className="badge badge-green">You&apos;re In!</span>
            )}

            {/* Mark Complete Button (for creator) */}
            {isCreator && room.status === 'open' && (
              <button
                onClick={handleMarkComplete}
                disabled={markingComplete}
                className="btn-secondary flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{markingComplete ? 'Completing...' : 'Mark as Completed'}</span>
              </button>
            )}

            {/* Rate Players Button */}
            {room.status === 'completed' && isInRoom && !hasRated && participantUsers.length > 1 && (
              <button
                onClick={() => setShowRatingModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Star className="w-4 h-4" />
                <span>Rate Players</span>
              </button>
            )}
            {room.status === 'completed' && hasRated && (
              <span className="badge badge-green flex items-center space-x-1">
                <Check className="w-3 h-3" />
                <span>Rated</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-300">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">{room.stadium_name || room.stadium?.name}</p>
                {(room.stadium_address || room.stadium?.address) && (
                  <p className="text-sm text-gray-500">{room.stadium_address || room.stadium?.address}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span>{formatDateDisplay(room.date)} - {new Date(room.date).toLocaleDateString('en-GB', { year: 'numeric' })}</span>
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
            {(room.stadium_price_per_hour || room.stadium?.price_per_hour) && (
              <div className="flex items-center space-x-3 text-gray-600">
                <span className="w-5 h-5 text-green-600 font-bold text-lg flex items-center justify-center">₼</span>
                <span>{room.stadium_price_per_hour || room.stadium?.price_per_hour} AZN/hour</span>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        {(room.stadium_latitude && room.stadium_longitude) || (room.stadium?.latitude && room.stadium?.longitude) ? (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-300 mb-3">Location</h3>
            <LocationMap
              latitude={room.stadium_latitude || room.stadium?.latitude || 0}
              longitude={room.stadium_longitude || room.stadium?.longitude || 0}
              name={room.stadium_name || room.stadium?.name}
              address={room.stadium_address || room.stadium?.address}
              height="200px"
            />
          </div>
        ) : null}

        {room.description && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-300 mb-2">Description</h3>
            <p className="text-gray-600">{room.description}</p>
          </div>
        )}

        {/* Player Slots */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600 font-medium">Players</span>
            <span className="text-sm text-gray-500">{room.max_players - room.current_players} spots left</span>
          </div>
          <PlayerSlots
            maxPlayers={room.max_players}
            currentPlayers={room.current_players}
            participants={participants}
            showLinks={true}
          />
        </div>
      </div>

      {/* Participants */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Participants ({participants.length})</h2>
        {participants.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {participants.map((p, index) => (
              <div key={p.id} className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center overflow-hidden">
                  {p.user?.avatar_url ? (
                    <Image
                      src={p.user.avatar_url}
                      alt={p.user.full_name}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <User className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{p.user?.full_name || `Player ${index + 1}`}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {p.user?.preferred_position || 'any'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No participants yet</p>
        )}
      </div>

      {/* Room Chat */}
      <RoomChat roomId={room.id} isParticipant={isInRoom || isCreator} />

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
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                      {request.user?.avatar_url ? (
                        <Image
                          src={request.user.avatar_url}
                          alt={request.user.full_name}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <User className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{request.user?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">
                        {request.user?.preferred_position} | {request.user?.skill_level}
                      </p>
                      {request.message && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center space-x-1">
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
            <p className="text-gray-600">No requests yet</p>
          )}
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Request to Join</h2>
            <p className="text-gray-600 mb-4">
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
                disabled={submitting}
              >
                {submitting ? 'Sending...' : 'Send Request'}
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

      {/* Rating Modal */}
      {showRatingModal && user && (
        <RatePlayersModal
          players={participantUsers}
          currentUserId={user.id}
          onSubmit={handleSubmitRatings}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </div>
  );
}
