'use client';

import React, { useState } from 'react';
import { X, Star, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { User } from '@/types';
import Image from 'next/image';
import { User as UserIcon } from 'lucide-react';

interface RatingData {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
}

interface RatePlayersModalProps {
  players: User[];
  currentUserId: string;
  onSubmit: (ratings: { userId: string; rating: RatingData }[]) => Promise<void>;
  onClose: () => void;
}

const statLabels: Record<keyof RatingData, { name: string; description: string }> = {
  pace: { name: 'Pace', description: 'Speed and acceleration' },
  shooting: { name: 'Shooting', description: 'Finishing and shot accuracy' },
  passing: { name: 'Passing', description: 'Pass accuracy and vision' },
  dribbling: { name: 'Dribbling', description: 'Ball control and skill moves' },
  defense: { name: 'Defense', description: 'Tackling and positioning' },
  physical: { name: 'Physical', description: 'Strength and stamina' },
};

const getStatColor = (value: number) => {
  if (value >= 80) return '#00ff88';
  if (value >= 60) return '#ffaa00';
  if (value >= 40) return '#ff8800';
  return '#ff4444';
};

function StatSlider({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const color = getStatColor(value);
  const pct = ((value - 1) / 98) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-semibold text-sm text-white">{label}</span>
          <p className="text-[11px] text-slate-500">{description}</p>
        </div>
        <span
          className="text-xl font-heading font-bold tabular-nums min-w-[2.5rem] text-right"
          style={{ color }}
        >
          {value}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-dark-950 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-150"
          style={{ width: `${pct}%`, background: color }}
        />
        <input
          type="range"
          min="1"
          max="99"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      {/* Custom thumb indicator */}
      <div className="relative h-0">
        <div
          className="absolute -top-[13px] w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg transition-all duration-150 pointer-events-none"
          style={{
            left: `calc(${pct}% - 7px)`,
            background: color,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}

export default function RatePlayersModal({
  players,
  currentUserId,
  onSubmit,
  onClose,
}: RatePlayersModalProps) {
  const otherPlayers = players.filter((p) => p.id !== currentUserId);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [ratings, setRatings] = useState<Map<string, RatingData>>(
    new Map(
      otherPlayers.map((p) => [
        p.id,
        { pace: 50, shooting: 50, passing: 50, dribbling: 50, defense: 50, physical: 50 },
      ])
    )
  );
  const [submitting, setSubmitting] = useState(false);

  const currentPlayer = otherPlayers[currentPlayerIndex];
  const currentRating = ratings.get(currentPlayer?.id) || {
    pace: 50,
    shooting: 50,
    passing: 50,
    dribbling: 50,
    defense: 50,
    physical: 50,
  };

  const updateRating = (stat: keyof RatingData, value: number) => {
    const newRatings = new Map(ratings);
    const playerRating = newRatings.get(currentPlayer.id) || {
      pace: 50,
      shooting: 50,
      passing: 50,
      dribbling: 50,
      defense: 50,
      physical: 50,
    };
    playerRating[stat] = value;
    newRatings.set(currentPlayer.id, playerRating);
    setRatings(newRatings);
  };

  const handleNext = () => {
    if (currentPlayerIndex < otherPlayers.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentPlayerIndex > 0) {
      setCurrentPlayerIndex(currentPlayerIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const ratingsArray = Array.from(ratings.entries()).map(([userId, rating]) => ({
        userId,
        rating,
      }));
      await onSubmit(ratingsArray);
      onClose();
    } catch (error) {
      console.error('Error submitting ratings:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (otherPlayers.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="glass rounded-2xl p-6 max-w-md w-full animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold text-white">Rate Players</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-slate-400 text-sm">No other players to rate in this match.</p>
        </div>
      </div>
    );
  }

  const overallRating = Math.round(
    (currentRating.pace +
      currentRating.shooting +
      currentRating.passing +
      currentRating.dribbling +
      currentRating.defense +
      currentRating.physical) /
      6
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="glass rounded-2xl max-w-lg w-full my-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <Star className="w-5 h-5 text-neon-amber" />
            <h2 className="font-heading text-xl font-bold text-white">Rate Players</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 px-6 pb-4">
          {otherPlayers.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentPlayerIndex
                  ? 'w-6 bg-neon-green shadow-glow-green-sm'
                  : index < currentPlayerIndex
                  ? 'w-1.5 bg-neon-green/50'
                  : 'w-1.5 bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Player Info */}
        <div className="flex items-center justify-center px-6 pb-5">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-white/5 border-2 border-neon-green/30 shadow-glow-green-sm flex items-center justify-center">
              {currentPlayer.avatar_url ? (
                <Image
                  src={currentPlayer.avatar_url}
                  alt={currentPlayer.full_name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <UserIcon className="w-10 h-10 text-slate-500" />
              )}
            </div>
            <h3 className="font-heading text-lg font-bold text-white">{currentPlayer.full_name}</h3>
            <p className="text-xs text-slate-400 capitalize mt-0.5">{currentPlayer.preferred_position}</p>
            {/* Overall */}
            <div className="mt-2.5 inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3.5 py-1 rounded-full">
              <span className="text-xs text-slate-400">Overall:</span>
              <span
                className="font-heading font-bold text-lg"
                style={{ color: getStatColor(overallRating) }}
              >
                {overallRating}
              </span>
            </div>
          </div>
        </div>

        {/* Stat Sliders */}
        <div className="space-y-5 px-6 pb-6">
          {(Object.keys(statLabels) as (keyof RatingData)[]).map((stat) => (
            <StatSlider
              key={stat}
              label={statLabels[stat].name}
              description={statLabels[stat].description}
              value={currentRating[stat]}
              onChange={(value) => updateRating(stat, value)}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 pb-6">
          <button
            onClick={handlePrev}
            disabled={currentPlayerIndex === 0}
            className="btn-secondary flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-sm text-slate-500 font-medium tabular-nums">
            {currentPlayerIndex + 1}/{otherPlayers.length}
          </span>

          {currentPlayerIndex < otherPlayers.length - 1 ? (
            <button
              onClick={handleNext}
              className="btn-primary flex items-center gap-1.5"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit All'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
