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
  const getSliderColor = () => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    if (value >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium text-white">{label}</span>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
        <span className={`text-xl font-bold ${value >= 80 ? 'text-green-400' : value >= 60 ? 'text-yellow-400' : value >= 40 ? 'text-orange-400' : 'text-red-400'}`}>
          {value}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="1"
          max="99"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${value >= 80 ? '#22c55e' : value >= 60 ? '#eab308' : value >= 40 ? '#f97316' : '#ef4444'} 0%, ${value >= 80 ? '#22c55e' : value >= 60 ? '#eab308' : value >= 40 ? '#f97316' : '#ef4444'} ${value}%, #374151 ${value}%, #374151 100%)`,
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
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="card max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Rate Players</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-400">No other players to rate in this match.</p>
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="card max-w-lg w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold">Rate Players</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-1 mb-6">
          {otherPlayers.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentPlayerIndex
                  ? 'bg-green-500'
                  : index < currentPlayerIndex
                  ? 'bg-green-500/50'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Player Info */}
        <div className="flex items-center justify-center mb-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
              {currentPlayer.avatar_url ? (
                <Image
                  src={currentPlayer.avatar_url}
                  alt={currentPlayer.full_name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <UserIcon className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-bold">{currentPlayer.full_name}</h3>
            <p className="text-sm text-gray-400 capitalize">{currentPlayer.preferred_position}</p>
            <div className="mt-2 inline-flex items-center space-x-1 bg-gray-700 px-3 py-1 rounded-full">
              <span className="text-sm text-gray-400">Overall:</span>
              <span className={`font-bold ${overallRating >= 80 ? 'text-green-400' : overallRating >= 60 ? 'text-yellow-400' : 'text-orange-400'}`}>
                {overallRating}
              </span>
            </div>
          </div>
        </div>

        {/* Stat Sliders */}
        <div className="space-y-4 mb-6">
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
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentPlayerIndex === 0}
            className="btn-secondary flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-sm text-gray-400">
            {currentPlayerIndex + 1} of {otherPlayers.length}
          </span>

          {currentPlayerIndex < otherPlayers.length - 1 ? (
            <button
              onClick={handleNext}
              className="btn-primary flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary flex items-center space-x-1"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit All'}</span>
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
