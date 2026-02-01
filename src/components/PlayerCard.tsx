'use client';

import React from 'react';
import Image from 'next/image';
import { User as UserIcon } from 'lucide-react';
import { User, PlayerStats } from '@/types';

interface PlayerCardProps {
  user: User;
  stats?: PlayerStats | null;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const positionAbbreviations: Record<string, string> = {
  goalkeeper: 'GK',
  defender: 'DEF',
  midfielder: 'MID',
  forward: 'FWD',
  any: 'ANY',
};

function getCardColor(overall: number): { bg: string; accent: string; tier: string } {
  if (overall >= 80) {
    return { bg: 'from-yellow-600 to-yellow-800', accent: 'text-yellow-300', tier: 'gold' };
  } else if (overall >= 65) {
    return { bg: 'from-gray-300 to-gray-500', accent: 'text-gray-100', tier: 'silver' };
  } else {
    return { bg: 'from-amber-700 to-amber-900', accent: 'text-amber-300', tier: 'bronze' };
  }
}

function StatBar({ label, value, max = 99 }: { label: string; value: number; max?: number }) {
  const percentage = (value / max) * 100;
  const getBarColor = () => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    if (value >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-[10px] uppercase tracking-wide w-8 text-gray-200 font-medium">{label}</span>
      <div className="flex-1 h-1.5 bg-black/30 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor()} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-bold w-5 text-right">{value}</span>
    </div>
  );
}

export default function PlayerCard({ user, stats, size = 'md', showDetails = true }: PlayerCardProps) {
  const defaultStats: PlayerStats = {
    id: '',
    user_id: user.id,
    pace: 50,
    shooting: 50,
    passing: 50,
    dribbling: 50,
    defense: 50,
    physical: 50,
    overall: 50,
    total_ratings: 0,
    created_at: '',
    updated_at: '',
  };

  const playerStats = stats || defaultStats;
  const cardColor = getCardColor(playerStats.overall);

  const sizeClasses = {
    sm: 'w-32 h-44',
    md: 'w-48 h-64',
    lg: 'w-64 h-80',
  };

  const overallSizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
  };

  const avatarSizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-lg bg-gradient-to-b ${cardColor.bg} overflow-hidden shadow-xl`}
    >
      {/* Card Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-2">
        {/* Top Section - Overall + Position */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex flex-col items-center">
            <span className={`${overallSizeClasses[size]} font-black ${cardColor.accent} leading-none`}>
              {playerStats.overall}
            </span>
            <span className={`text-[10px] uppercase tracking-widest ${cardColor.accent} font-semibold`}>
              {positionAbbreviations[user.preferred_position] || 'ANY'}
            </span>
          </div>
          {stats && stats.total_ratings > 0 && (
            <div className="text-[8px] text-white/60 text-right">
              {stats.total_ratings} rating{stats.total_ratings !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Player Photo */}
        <div className="flex justify-center flex-1">
          <div className={`${avatarSizeClasses[size]} rounded-full overflow-hidden bg-black/20 flex items-center justify-center`}>
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.full_name}
                width={size === 'lg' ? 128 : size === 'md' ? 96 : 64}
                height={size === 'lg' ? 128 : size === 'md' ? 96 : 64}
                className="object-cover w-full h-full"
              />
            ) : (
              <UserIcon className={`${size === 'lg' ? 'w-16 h-16' : size === 'md' ? 'w-12 h-12' : 'w-8 h-8'} text-white/50`} />
            )}
          </div>
        </div>

        {/* Name */}
        <div className="text-center my-1">
          <h3 className={`font-bold text-white uppercase tracking-wide ${size === 'sm' ? 'text-xs' : 'text-sm'} truncate`}>
            {user.full_name}
          </h3>
        </div>

        {/* Stats */}
        {showDetails && size !== 'sm' && (
          <div className="space-y-0.5 mt-auto">
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              <StatBar label="PAC" value={playerStats.pace} />
              <StatBar label="DRI" value={playerStats.dribbling} />
              <StatBar label="SHO" value={playerStats.shooting} />
              <StatBar label="DEF" value={playerStats.defense} />
              <StatBar label="PAS" value={playerStats.passing} />
              <StatBar label="PHY" value={playerStats.physical} />
            </div>
          </div>
        )}
      </div>

      {/* Card Border Effect */}
      <div className="absolute inset-0 rounded-lg border border-white/20 pointer-events-none" />
    </div>
  );
}
