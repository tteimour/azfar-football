'use client';

export const runtime = 'edge';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import { getRoom, isUserInRoom, hasUserRequestedRoom, createRequest, getRequestsForRoom, updateRequest, getParticipants, updateRoom, hasUserRatedInRoom, submitRating, deleteRoom, getWaitlistForRoom, joinWaitlist, isUserOnWaitlist, leaveWaitlist } from '@/lib/data';
import { Room, JoinRequest, RoomParticipant, User as UserType, WaitlistEntry } from '@/types';
import { MapPin, Users, Calendar, Clock, ArrowLeft, Send, Check, X, User, Trophy, MessageSquare, Star, CheckCircle, DollarSign, Shield, Loader2, UserPlus, Trash2, AlertTriangle, ListPlus, XCircle } from 'lucide-react';
import RatePlayersModal from '@/components/RatePlayersModal';
import RoomChat from '@/components/RoomChat';
import ShareButton from '@/components/ShareButton';
import dynamic from 'next/dynamic';
import { formatDateDisplay } from '@/lib/dateUtils';

const LocationMap = dynamic(() => import('@/components/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="h-48 rounded-xl animate-pulse flex items-center justify-center" style={{ background: 'rgba(15,22,41,0.8)' }}>
      <MapPin className="w-8 h-8 text-slate-600" />
    </div>
  ),
});

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [hasRequested, setHasRequested] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [onWaitlist, setOnWaitlist] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);

  const loadData = useCallback(async () => {
    const roomId = params.id as string;

    try {
      const roomData = await getRoom(roomId);

      if (roomData) {
        setRoom(roomData);

        const [roomRequests, roomParticipants, roomWaitlist] = await Promise.all([
          getRequestsForRoom(roomId),
          getParticipants(roomId),
          getWaitlistForRoom(roomId),
        ]);

        setRequests(roomRequests);
        setParticipants(roomParticipants);
        setWaitlist(roomWaitlist);

        if (user) {
          const [requested, inRoom, rated, waitlisted] = await Promise.all([
            hasUserRequestedRoom(user.id, roomId),
            isUserInRoom(user.id, roomId),
            hasUserRatedInRoom(user.id, roomId),
            isUserOnWaitlist(user.id, roomId),
          ]);
          setHasRequested(requested);
          setIsInRoom(inRoom);
          setHasRated(rated);
          setIsCreator(roomData.creator_id === user.id);
          setOnWaitlist(waitlisted);
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

  const handleDeleteRoom = async () => {
    if (!room || !isCreator) return;

    setDeleting(true);
    try {
      await deleteRoom(room.id);
      router.push('/rooms');
    } catch (error) {
      console.error('Error deleting room:', error);
      setDeleting(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!user || !room) return;
    setJoiningWaitlist(true);
    try {
      await joinWaitlist(room.id, user.id);
      setOnWaitlist(true);
      await loadData();
    } catch (error) {
      console.error('Error joining waitlist:', error);
    } finally {
      setJoiningWaitlist(false);
    }
  };

  const handleLeaveWaitlist = async () => {
    if (!user || !room) return;
    setJoiningWaitlist(true);
    try {
      await leaveWaitlist(user.id, room.id);
      setOnWaitlist(false);
      await loadData();
    } catch (error) {
      console.error('Error leaving waitlist:', error);
    } finally {
      setJoiningWaitlist(false);
    }
  };

  const handleSubmitRatings = async (ratings: { userId: string; rating: { pace: number; shooting: number; passing: number; dribbling: number; defense: number; physical: number } }[]) => {
    if (!user || !room) return;

    for (const { userId, rating } of ratings) {
      await submitRating(room.id, user.id, userId, rating);
    }

    setHasRated(true);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
        <div className="skeleton h-5 w-40" />
        <div className="card">
          <div className="skeleton h-8 w-2/3 mb-4" />
          <div className="skeleton h-5 w-1/3 mb-6" />
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-lg p-4" style={{ background: 'rgba(15,22,41,0.5)' }}>
                <div className="skeleton h-4 w-1/3 mb-2" />
                <div className="skeleton h-5 w-2/3" />
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="skeleton h-6 w-40 mb-4" />
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton w-14 h-14 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-slate-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-300 mb-2">Match not found</h2>
        <p className="text-slate-500 mb-6">This match may have been removed or doesn&apos;t exist.</p>
        <Link href="/rooms" className="btn-primary inline-flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to matches</span>
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

  const getSkillBadgeClass = (skill: string) => {
    switch (skill) {
      case 'beginner': return 'badge-green';
      case 'intermediate': return 'badge-blue';
      case 'advanced': return 'badge-yellow';
      case 'professional': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open': return 'badge-green';
      case 'full': return 'badge-yellow';
      case 'completed': return 'badge-gray';
      case 'cancelled': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  const participantUsers: UserType[] = participants
    .map(p => p.user)
    .filter((u): u is UserType => !!u);

  const stadiumName = room.stadium_name || room.stadium?.name;
  const stadiumAddress = room.stadium_address || room.stadium?.address;
  const stadiumPrice = room.stadium_price_per_hour || room.stadium?.price_per_hour;
  const hasLocation = (room.stadium_latitude && room.stadium_longitude) || (room.stadium?.latitude && room.stadium?.longitude);
  const lat = room.stadium_latitude || room.stadium?.latitude || 0;
  const lng = room.stadium_longitude || room.stadium?.longitude || 0;
  const playerPercent = Math.round((room.current_players / room.max_players) * 100);
  const isFull = room.current_players >= room.max_players;

  // Determine what the mobile sticky CTA should show
  const canJoin = user && !isCreator && !isInRoom && !hasRequested && room.status === 'open' && !isFull;
  const canWaitlist = user && !isCreator && !isInRoom && !hasRequested && !onWaitlist && room.status === 'open' && isFull;
  const showMobileCTA = canJoin || canWaitlist || (hasRequested && !isInRoom) || onWaitlist;

  return (
    <div className={`max-w-4xl mx-auto space-y-6 px-4 py-6 ${showMobileCTA ? 'pb-24 md:pb-6' : ''}`}>
      {/* Back Navigation */}
      <Link
        href="/rooms"
        className="inline-flex items-center space-x-2 text-slate-400 hover:text-neon-green transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Matches</span>
      </Link>

      {/* Room Header Card */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold font-heading text-white mb-3">{room.title}</h1>
            <div className="flex flex-wrap gap-2">
              <span className={`badge ${getStatusBadgeClass(room.status)}`}>
                {room.status}
              </span>
              <span className={`badge ${getSkillBadgeClass(room.skill_level_required)}`}>
                {skillLabels[room.skill_level_required]}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <ShareButton roomId={room.id} roomTitle={room.title} />

            {/* Desktop join/waitlist buttons */}
            <div className="hidden md:contents">
              {canJoin && (
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Request to Join</span>
                </button>
              )}
              {canWaitlist && (
                <button
                  onClick={handleJoinWaitlist}
                  disabled={joiningWaitlist}
                  className="btn-secondary flex items-center space-x-2"
                >
                  {joiningWaitlist ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ListPlus className="w-4 h-4" />
                  )}
                  <span>Join Waitlist</span>
                </button>
              )}
              {onWaitlist && (
                <button
                  onClick={handleLeaveWaitlist}
                  disabled={joiningWaitlist}
                  className="btn-secondary flex items-center space-x-2 text-neon-amber border-neon-amber/30"
                >
                  {joiningWaitlist ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>Leave Waitlist</span>
                </button>
              )}
            </div>

            {hasRequested && !isInRoom && (
              <span className="badge badge-yellow">Request Pending</span>
            )}
            {isInRoom && room.status !== 'completed' && (
              <span className="badge badge-green flex items-center space-x-1">
                <Check className="w-3 h-3" />
                <span>You&apos;re In!</span>
              </span>
            )}

            {isCreator && room.status === 'open' && (
              <button
                onClick={handleMarkComplete}
                disabled={markingComplete}
                className="btn-secondary flex items-center space-x-2"
              >
                {markingComplete ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>{markingComplete ? 'Completing...' : 'Mark as Completed'}</span>
              </button>
            )}

            {isCreator && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-danger flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}

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

        {/* Creator info */}
        {room.creator && (
          <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-white/5">
            <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center overflow-hidden">
              {room.creator.avatar_url ? (
                <Image
                  src={room.creator.avatar_url}
                  alt={room.creator.full_name}
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              ) : (
                <User className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <div>
              <p className="text-sm text-slate-400">Created by</p>
              <p className="text-sm font-medium text-white">{room.creator.full_name}</p>
            </div>
          </div>
        )}

        {/* Match Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Date & Time */}
          <div className="rounded-lg p-4" style={{ background: 'rgba(15,22,41,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-neon-cyan" />
              <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Date</span>
            </div>
            <p className="text-white font-medium">{formatDateDisplay(room.date)}</p>
          </div>

          <div className="rounded-lg p-4" style={{ background: 'rgba(15,22,41,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-neon-cyan" />
              <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Time</span>
            </div>
            <p className="text-white font-medium">{room.start_time} - {room.end_time}</p>
          </div>

          {/* Stadium */}
          <div className="rounded-lg p-4" style={{ background: 'rgba(15,22,41,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-neon-green" />
              <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Stadium</span>
            </div>
            <p className="text-white font-medium truncate">{stadiumName}</p>
            {stadiumAddress && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{stadiumAddress}</p>
            )}
          </div>

          {/* Price */}
          <div className="rounded-lg p-4" style={{ background: 'rgba(15,22,41,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-4 h-4 text-neon-amber" />
              <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Price</span>
            </div>
            <p className="text-white font-medium">
              {stadiumPrice ? `${stadiumPrice} AZN/hr` : 'Free / TBD'}
            </p>
          </div>
        </div>

        {/* Player count progress */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-neon-green" />
              <span className="text-sm text-slate-300 font-medium">
                Players ({room.current_players}/{room.max_players})
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {isFull ? (
                <span className="text-neon-amber">Match is full</span>
              ) : (
                `${room.max_players - room.current_players} spots left`
              )}
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${playerPercent}%`,
                background: playerPercent >= 100
                  ? 'linear-gradient(90deg, #ffaa00, #ff8800)'
                  : 'linear-gradient(90deg, #00ff88, #00cc6a)',
              }}
            />
          </div>
          {waitlist.length > 0 && (
            <p className="text-xs text-neon-amber mt-1">
              {waitlist.length} {waitlist.length === 1 ? 'person' : 'people'} on waitlist
            </p>
          )}
        </div>

        {/* Description */}
        {room.description && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <h3 className="text-sm text-slate-500 uppercase font-semibold tracking-wider mb-2">Description</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{room.description}</p>
          </div>
        )}
      </div>

      {/* Map Section */}
      {hasLocation && (
        <div className="card">
          <h2 className="text-lg font-bold font-heading text-white mb-4 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-neon-green" />
            <span>Location</span>
          </h2>
          <div className="rounded-xl overflow-hidden">
            <LocationMap
              latitude={lat}
              longitude={lng}
              name={stadiumName}
              address={stadiumAddress}
              height="250px"
            />
          </div>
        </div>
      )}

      {/* Players Section */}
      <div className="card">
        <h2 className="text-lg font-bold font-heading text-white mb-4 flex items-center space-x-2">
          <Users className="w-5 h-5 text-neon-green" />
          <span>Players ({participants.length}/{room.max_players})</span>
        </h2>
        {participants.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {participants.map((p, index) => (
              <Link
                key={p.id}
                href={`/profile/${p.user_id}`}
                className="flex flex-col items-center p-3 rounded-lg transition-all hover:bg-white/5 group"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden mb-2 ${
                  p.user_id === room.creator_id
                    ? 'ring-2 ring-neon-amber shadow-glow-amber'
                    : 'ring-2 ring-neon-green/30'
                }`} style={{ background: 'rgba(0,255,136,0.1)' }}>
                  {p.user?.avatar_url ? (
                    <Image
                      src={p.user.avatar_url}
                      alt={p.user.full_name}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <User className="w-6 h-6 text-neon-green" />
                  )}
                </div>
                <p className="text-xs font-medium text-slate-300 text-center group-hover:text-white transition-colors truncate w-full">
                  {p.user?.full_name || `Player ${index + 1}`}
                </p>
                {p.user_id === room.creator_id && (
                  <span className="text-[10px] text-neon-amber mt-0.5">Host</span>
                )}
                {p.user?.preferred_position && (
                  <span className="text-[10px] text-slate-500 capitalize">{p.user.preferred_position}</span>
                )}
              </Link>
            ))}
            {/* Empty slots */}
            {Array.from({ length: room.max_players - participants.length }, (_, i) => (
              <div
                key={`empty-${i}`}
                className="flex flex-col items-center p-3 rounded-lg"
              >
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center mb-2">
                  <UserPlus className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs text-slate-600">Open</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400">No participants yet</p>
          </div>
        )}
      </div>

      {/* Waitlist Section (visible to creator when there are entries) */}
      {isCreator && waitlist.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold font-heading text-white mb-4 flex items-center space-x-2">
            <ListPlus className="w-5 h-5 text-neon-amber" />
            <span>Waitlist</span>
            <span className="bg-neon-amber text-dark-950 text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-bold">
              {waitlist.length}
            </span>
          </h2>
          <div className="space-y-2">
            {waitlist.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: 'rgba(15,22,41,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center overflow-hidden flex-shrink-0">
                    {entry.user?.avatar_url ? (
                      <Image
                        src={entry.user.avatar_url}
                        alt={entry.user.full_name}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <User className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{entry.user?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">
                      {entry.user?.preferred_position} | {entry.user?.skill_level}
                    </p>
                  </div>
                </div>
                <span className="badge badge-yellow text-[10px]">Waiting</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Section */}
      <RoomChat roomId={room.id} isParticipant={isInRoom || isCreator} />

      {/* Join Requests (for creator) */}
      {isCreator && (
        <div className="card">
          <h2 className="text-lg font-bold font-heading text-white mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-neon-cyan" />
            <span>Join Requests</span>
            {pendingRequests.length > 0 && (
              <span className="bg-neon-red text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {pendingRequests.length}
              </span>
            )}
          </h2>
          {requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg"
                  style={{ background: 'rgba(15,22,41,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center overflow-hidden flex-shrink-0">
                      {request.user?.avatar_url ? (
                        <Image
                          src={request.user.avatar_url}
                          alt={request.user.full_name}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <User className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{request.user?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">
                        {request.user?.preferred_position} | {request.user?.skill_level}
                      </p>
                      {request.message && (
                        <p className="text-sm text-slate-400 mt-1 flex items-center space-x-1">
                          <MessageSquare className="w-3 h-3 flex-shrink-0" />
                          <span className="italic">&quot;{request.message}&quot;</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-auto sm:ml-0">
                    {request.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleRequestAction(request.id, 'approved')}
                          className="p-2.5 rounded-lg transition-all duration-200 hover:scale-105"
                          style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.3)' }}
                          title="Approve"
                        >
                          <Check className="w-4 h-4 text-neon-green" />
                        </button>
                        <button
                          onClick={() => handleRequestAction(request.id, 'rejected')}
                          className="p-2.5 rounded-lg transition-all duration-200 hover:scale-105"
                          style={{ background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.3)' }}
                          title="Reject"
                        >
                          <X className="w-4 h-4 text-neon-red" />
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
            <div className="text-center py-8">
              <Shield className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400">No requests yet</p>
            </div>
          )}
        </div>
      )}

      {/* Mobile Sticky CTA Bar */}
      {showMobileCTA && (
        <div
          className="fixed bottom-20 left-0 right-0 z-40 md:hidden px-4 py-3"
          style={{
            background: 'linear-gradient(180deg, rgba(10,14,26,0) 0%, rgba(10,14,26,0.95) 30%)',
          }}
        >
          {canJoin && (
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-primary w-full flex items-center justify-center space-x-2 py-3.5 text-base"
            >
              <UserPlus className="w-5 h-5" />
              <span>Request to Join</span>
            </button>
          )}
          {canWaitlist && (
            <button
              onClick={handleJoinWaitlist}
              disabled={joiningWaitlist}
              className="btn-secondary w-full flex items-center justify-center space-x-2 py-3.5 text-base border-neon-amber/30"
            >
              {joiningWaitlist ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ListPlus className="w-5 h-5 text-neon-amber" />
              )}
              <span className="text-neon-amber">Join Waitlist ({waitlist.length} waiting)</span>
            </button>
          )}
          {onWaitlist && (
            <button
              onClick={handleLeaveWaitlist}
              disabled={joiningWaitlist}
              className="btn-secondary w-full flex items-center justify-center space-x-2 py-3.5 text-base"
            >
              {joiningWaitlist ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <XCircle className="w-5 h-5 text-neon-amber" />
              )}
              <span className="text-neon-amber">On Waitlist - Tap to Leave</span>
            </button>
          )}
          {hasRequested && !isInRoom && !onWaitlist && (
            <div className="w-full py-3 text-center rounded-lg" style={{ background: 'rgba(255,170,0,0.15)', border: '1px solid rgba(255,170,0,0.3)' }}>
              <span className="text-neon-amber font-medium">Request Pending</span>
            </div>
          )}
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full glow-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-heading text-gradient">Request to Join</h2>
              <button
                onClick={() => setShowJoinModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-4">
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
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Request</span>
                  </>
                )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full glow-border" style={{ borderColor: 'rgba(255,68,68,0.3)', boxShadow: '0 0 15px rgba(255,68,68,0.1), inset 0 0 15px rgba(255,68,68,0.05)' }}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,68,68,0.15)' }}>
                <AlertTriangle className="w-6 h-6 text-neon-red" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-heading text-white">Delete Match</h2>
                <p className="text-sm text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-2">
              Are you sure you want to delete <span className="text-white font-medium">&quot;{room.title}&quot;</span>?
            </p>
            <p className="text-slate-500 text-xs mb-6">
              This will permanently remove the match, all participant data, join requests, chat messages, and related notifications.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteRoom}
                disabled={deleting}
                className="btn-danger flex-1 flex items-center justify-center space-x-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Match</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
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
