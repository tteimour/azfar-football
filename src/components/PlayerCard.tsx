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

function getCardTheme(overall: number) {
  if (overall >= 80) {
    return {
      border: 'from-yellow-400 via-yellow-500 to-amber-600',
      accent: 'text-yellow-400',
      accentBg: 'bg-yellow-400',
      glow: 'shadow-[0_0_30px_rgba(250,204,21,0.3)]',
      label: 'Gold',
    };
  } else if (overall >= 65) {
    return {
      border: 'from-gray-300 via-gray-400 to-gray-500',
      accent: 'text-gray-300',
      accentBg: 'bg-gray-300',
      glow: 'shadow-[0_0_30px_rgba(209,213,219,0.2)]',
      label: 'Silver',
    };
  }
  return {
    border: 'from-amber-600 via-amber-700 to-amber-800',
    accent: 'text-amber-500',
    accentBg: 'bg-amber-500',
    glow: 'shadow-[0_0_30px_rgba(217,119,6,0.2)]',
    label: 'Bronze',
  };
}

function getStatColor(value: number): string {
  if (value >= 70) return 'text-neon-green';
  if (value >= 50) return 'text-neon-amber';
  return 'text-neon-red';
}

function StatItem({ label, value, size }: { label: string; value: number; size: 'sm' | 'md' | 'lg' }) {
  const color = getStatColor(value);
  const textSize = size === 'lg' ? 'text-sm' : size === 'md' ? 'text-xs' : 'text-[10px]';
  const valueSize = size === 'lg' ? 'text-base font-black' : size === 'md' ? 'text-sm font-bold' : 'text-xs font-bold';

  return (
    <div className="flex items-center gap-1.5">
      <span className={`${valueSize} ${color} tabular-nums`}>{value}</span>
      <span className={`${textSize} text-slate-400 uppercase tracking-wider font-medium`}>{label}</span>
    </div>
  );
}

export default function PlayerCard({ user, stats, size = 'md', showDetails = true }: PlayerCardProps) {
  const hasStats = stats && stats.total_ratings > 0;

  const playerStats: PlayerStats = stats || {
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

  const theme = getCardTheme(playerStats.overall);

  const sizeConfig = {
    sm: { card: 'w-[150px] h-[210px]', avatar: 'w-14 h-14', overall: 'text-3xl', name: 'text-[10px]', pos: 'text-[8px]', pad: 'p-2' },
    md: { card: 'w-[200px] h-[280px]', avatar: 'w-20 h-20', overall: 'text-4xl', name: 'text-xs', pos: 'text-[10px]', pad: 'p-3' },
    lg: { card: 'w-[280px] h-[390px]', avatar: 'w-28 h-28', overall: 'text-6xl', name: 'text-sm', pos: 'text-xs', pad: 'p-4' },
  };

  const cfg = sizeConfig[size];

  return (
    <div className={`group relative ${cfg.card}`}>
      {/* Gradient border wrapper */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-b ${theme.border} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />

      {/* Card body */}
      <div className={`absolute inset-[2px] rounded-[10px] bg-gradient-to-b from-dark-800 to-dark-950 overflow-hidden ${theme.glow} group-hover:shadow-none transition-shadow duration-500`}>
        {/* Top accent stripe */}
        <div className={`h-1 w-full bg-gradient-to-r ${theme.border}`} />

        {/* Shimmer overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.08)_45%,rgba(255,255,255,0.12)_50%,rgba(255,255,255,0.08)_55%,transparent_60%)] bg-[length:200%_100%] group-hover:animate-shimmer" />

        {/* Content */}
        <div className={`relative z-10 h-full flex flex-col ${cfg.pad}`}>
          {/* Overall + Position row */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col items-center leading-none">
              <span className={`${cfg.overall} font-black ${theme.accent} drop-shadow-[0_0_12px_currentColor]`}>
                {playerStats.overall}
              </span>
              <span className={`${cfg.pos} uppercase tracking-[0.2em] ${theme.accent} font-bold mt-0.5`}>
                {positionAbbreviations[user.preferred_position] || 'ANY'}
              </span>
            </div>
            {hasStats && (
              <div className="flex flex-col items-end gap-0.5">
                <span className={`${cfg.pos} text-slate-500 font-medium`}>
                  {stats.total_ratings} rating{stats.total_ratings !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="flex justify-center flex-1 items-center">
            <div className={`${cfg.avatar} rounded-full overflow-hidden ring-2 ring-white/10 bg-dark-700 flex items-center justify-center`}>
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.full_name}
                  width={size === 'lg' ? 112 : size === 'md' ? 80 : 56}
                  height={size === 'lg' ? 112 : size === 'md' ? 80 : 56}
                  className="object-cover w-full h-full"
                />
              ) : (
                <UserIcon className={`${size === 'lg' ? 'w-14 h-14' : size === 'md' ? 'w-10 h-10' : 'w-7 h-7'} text-slate-600`} />
              )}
            </div>
          </div>

          {/* Name divider */}
          <div className="text-center my-1">
            <div className={`h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-1.5`} />
            <h3 className={`font-heading font-bold text-white uppercase tracking-wider ${cfg.name} truncate`}>
              {user.full_name}
            </h3>
            <div className={`h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mt-1.5`} />
          </div>

          {/* Stats grid */}
          {showDetails && size !== 'sm' ? (
            hasStats ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-auto">
                <StatItem label="PAC" value={playerStats.pace} size={size} />
                <StatItem label="DRI" value={playerStats.dribbling} size={size} />
                <StatItem label="SHO" value={playerStats.shooting} size={size} />
                <StatItem label="DEF" value={playerStats.defense} size={size} />
                <StatItem label="PAS" value={playerStats.passing} size={size} />
                <StatItem label="PHY" value={playerStats.physical} size={size} />
              </div>
            ) : (
              <div className="mt-auto text-center">
                <p className={`${cfg.pos} text-slate-500 italic`}>No ratings yet</p>
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
