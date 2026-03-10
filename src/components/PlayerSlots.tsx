'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, User, Crown } from 'lucide-react';
import { RoomParticipant } from '@/types';

interface PlayerSlotsProps {
  maxPlayers: number;
  currentPlayers: number;
  participants?: RoomParticipant[];
  creatorId?: string;
  showLinks?: boolean;
}

export default function PlayerSlots({
  maxPlayers,
  currentPlayers,
  participants = [],
  creatorId,
  showLinks = false,
}: PlayerSlotsProps) {
  const slots = Array.from({ length: maxPlayers }, (_, i) => {
    const participant = participants[i];
    const isFilled = i < currentPlayers;

    return {
      isFilled,
      participant,
      userId: participant?.user?.id,
      userName: participant?.user?.full_name,
      avatarUrl: participant?.user?.avatar_url,
      isCreator: participant?.user?.id === creatorId,
    };
  });

  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((slot, index) => {
        const slotContent = (
          <div
            key={index}
            className={`relative flex flex-col items-center gap-1 transition-transform duration-200 ${
              slot.isFilled ? 'hover:scale-105' : ''
            }`}
            title={slot.isFilled ? slot.userName || `Player ${index + 1}` : 'Empty spot'}
          >
            {/* Avatar circle */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden transition-all duration-200 ${
                slot.isFilled
                  ? slot.isCreator
                    ? 'ring-2 ring-neon-amber shadow-glow-amber bg-white/10'
                    : 'ring-2 ring-neon-green/50 bg-white/10'
                  : 'border border-dashed border-white/15 opacity-40'
              }`}
            >
              {slot.isFilled ? (
                slot.avatarUrl ? (
                  <Image
                    src={slot.avatarUrl}
                    alt={slot.userName || 'Player'}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <User className="w-4 h-4 text-slate-400" />
                )
              ) : (
                <Plus className="w-3.5 h-3.5 text-slate-600" />
              )}
            </div>

            {/* Creator crown */}
            {slot.isCreator && (
              <Crown className="absolute -top-1.5 -right-1 w-3.5 h-3.5 text-neon-amber drop-shadow-lg" />
            )}

            {/* Name */}
            {slot.isFilled && slot.userName && (
              <span className="text-[10px] text-slate-400 truncate max-w-[48px] text-center leading-tight">
                {slot.userName.split(' ')[0]}
              </span>
            )}
          </div>
        );

        if (showLinks && slot.isFilled && slot.userId) {
          return (
            <Link
              key={index}
              href={`/profile/${slot.userId}`}
              className="no-underline"
            >
              {slotContent}
            </Link>
          );
        }

        return <React.Fragment key={index}>{slotContent}</React.Fragment>;
      })}
    </div>
  );
}
