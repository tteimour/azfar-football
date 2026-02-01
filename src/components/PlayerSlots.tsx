'use client';

import React from 'react';
import Link from 'next/link';
import { RoomParticipant } from '@/types';

interface PlayerSlotsProps {
  maxPlayers: number;
  currentPlayers: number;
  participants?: RoomParticipant[];
  showLinks?: boolean;
}

export default function PlayerSlots({
  maxPlayers,
  currentPlayers,
  participants = [],
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
    };
  });

  return (
    <div className="flex flex-wrap gap-1">
      {slots.map((slot, index) => {
        const emoji = (
          <span
            key={index}
            className={`text-xl cursor-default transition-transform hover:scale-110 ${
              slot.isFilled ? '' : 'opacity-40 grayscale'
            }`}
            title={slot.isFilled ? slot.userName || `Player ${index + 1}` : 'Empty spot'}
          >
            {slot.isFilled ? '\u26BD' : '\u26BD'}
          </span>
        );

        if (showLinks && slot.isFilled && slot.userId) {
          return (
            <Link
              key={index}
              href={`/profile/${slot.userId}`}
              className="hover:scale-125 transition-transform inline-block"
              title={slot.userName || `Player ${index + 1}`}
            >
              <span className="text-xl">{'\u26BD'}</span>
            </Link>
          );
        }

        return emoji;
      })}
    </div>
  );
}
