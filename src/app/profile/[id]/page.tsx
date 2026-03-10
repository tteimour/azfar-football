'use client';

export const runtime = 'edge';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPublicProfile, getPlayerStats, getJoinedRooms, getMyRooms } from '@/lib/data';
import { User, PlayerStats, Room } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import {
  User as UserIcon,
  MapPin,
  Shield,
  Trophy,
  ArrowLeft,
  Zap,
  Users,
  Clock,
  ChevronRight,
} from 'lucide-react';
import PlayerCard from '@/components/PlayerCard';
import { formatDateDisplay } from '@/lib/dateUtils';

const positionLabels: Record<string, string> = {
  goalkeeper: 'Goalkeeper',
  defender: 'Defender',
  midfielder: 'Midfielder',
  forward: 'Forward',
  any: 'Any Position',
};

const skillLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  professional: 'Professional',
};

const skillColors: Record<string, string> = {
  beginner: 'badge-gray',
  intermediate: 'badge-blue',
  advanced: 'badge-yellow',
  professional: 'badge-green',
};

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [profile, setProfile] = useState<User | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [recentMatches, setRecentMatches] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const [profileData, statsData, joinedData, createdData] = await Promise.all([
        getPublicProfile(userId),
        getPlayerStats(userId),
        getJoinedRooms(userId),
        getMyRooms(userId),
      ]);

      if (!profileData) {
        setNotFound(true);
        return;
      }

      setProfile(profileData);
      setPlayerStats(statsData);

      // Combine and sort recent matches
      const allRooms = [...createdData, ...joinedData];
      const uniqueRooms = allRooms.filter(
        (room, index, self) => index === self.findIndex((r) => r.id === room.id)
      );
      uniqueRooms.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentMatches(uniqueRooms.slice(0, 5));
    } catch (error) {
      console.error('Error loading profile:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-16">
          <UserIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-white mb-2">Player Not Found</h1>
          <p className="text-slate-400 mb-6">This player profile does not exist or has been removed.</p>
          <button
            onClick={() => router.back()}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Profile Hero Card (read-only) */}
      <div className="card">
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-neon-green/20 bg-dark-700 flex items-center justify-center">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              ) : (
                <UserIcon className="w-16 h-16 text-slate-600" />
              )}
            </div>
          </div>

          {/* Name */}
          <h1 className="font-heading text-2xl font-bold text-white">{profile.full_name}</h1>

          {/* Position + Skill badges */}
          <div className="flex items-center gap-2 mt-2">
            <span className="badge badge-green">
              <MapPin className="w-3 h-3 mr-1" />
              {positionLabels[profile.preferred_position]}
            </span>
            <span className={`badge ${skillColors[profile.skill_level]}`}>
              <Shield className="w-3 h-3 mr-1" />
              {skillLabels[profile.skill_level]}
            </span>
          </div>

          {/* Games played */}
          <div className="flex items-center gap-1.5 mt-3 text-slate-400">
            <Trophy className="w-4 h-4 text-neon-amber" />
            <span className="text-sm font-medium">{profile.games_played} games played</span>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-4 pt-4 border-t border-white/5 w-full max-w-md">
              <p className="text-slate-400 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Player Stats Card */}
      <div className="card">
        <h2 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-neon-amber" />
          Player Card
        </h2>
        <div className="flex justify-center">
          <PlayerCard user={profile} stats={playerStats} size="lg" />
        </div>
      </div>

      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <div className="card">
          <h2 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-neon-cyan" />
            Recent Matches
          </h2>
          <div className="space-y-2">
            {recentMatches.map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className="flex items-center justify-between p-4 rounded-lg bg-dark-900/50 border border-white/5 hover:border-neon-green/20 transition-all duration-200 group"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white text-sm truncate group-hover:text-neon-green transition-colors">
                    {room.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-slate-500 text-xs">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{room.stadium_name || room.stadium?.name}</span>
                    <span>-</span>
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>{formatDateDisplay(room.date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                  <span className={`badge ${
                    room.status === 'open' ? 'badge-green' :
                    room.status === 'full' ? 'badge-yellow' :
                    room.status === 'completed' ? 'badge-blue' : 'badge-gray'
                  }`}>
                    {room.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-neon-green transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
