'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getRooms } from '@/lib/data';
import { Room } from '@/types';
import { MapPin, Users, Calendar, Clock, ChevronRight, Trophy, UserPlus, Building } from 'lucide-react';
import PlayerSlots from '@/components/PlayerSlots';

export default function HomePage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const roomsData = await getRooms();
        setRooms(roomsData.filter(r => r.status === 'open').slice(0, 3));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Find Players for Your
          <span className="text-green-500"> Football Match</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect with football enthusiasts in Baku. Join matches at premium artificial turf stadiums.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <>
              <Link href="/rooms" className="btn-primary flex items-center space-x-2 text-lg px-8 py-3">
                <Users className="w-5 h-5" />
                <span>Browse Matches</span>
              </Link>
              <Link href="/rooms?create=true" className="btn-secondary flex items-center space-x-2 text-lg px-8 py-3">
                <UserPlus className="w-5 h-5" />
                <span>Create a Match</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth" className="btn-primary flex items-center space-x-2 text-lg px-8 py-3">
                <UserPlus className="w-5 h-5" />
                <span>Get Started</span>
              </Link>
              <Link href="/rooms" className="btn-secondary flex items-center space-x-2 text-lg px-8 py-3">
                <Users className="w-5 h-5" />
                <span>Browse Matches</span>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Find Players</h3>
          <p className="text-gray-600">
            Connect with other football enthusiasts looking for games in your area
          </p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Building className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Premium Stadiums</h3>
          <p className="text-gray-600">
            Play on high-quality artificial turf fields across Baku
          </p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">All Skill Levels</h3>
          <p className="text-gray-600">
            Whether beginner or pro, find matches that suit your skill level
          </p>
        </div>
      </section>

      {/* Upcoming Matches */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Upcoming Matches</h2>
          <Link href="/rooms" className="text-green-500 hover:text-green-400 flex items-center">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Link key={room.id} href={`/rooms/${room.id}`} className="card hover:border-green-500/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-lg">{room.title}</h3>
                  <span className={`badge ${room.skill_level_required === 'any' ? 'badge-green' : 'badge-blue'}`}>
                    {room.skill_level_required === 'any' ? 'All levels' : room.skill_level_required}
                  </span>
                </div>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{room.stadium_name || room.stadium?.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(room.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{room.start_time} - {room.end_time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{room.current_players}/{room.max_players} players</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <PlayerSlots
                    maxPlayers={room.max_players}
                    currentPlayers={room.current_players}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {room.max_players - room.current_players} spots left
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600">No upcoming matches</h3>
            <p className="text-gray-500 mt-2">Be the first to create a match!</p>
          </div>
        )}
      </section>

      {/* CTA */}
      {!user && (
        <section className="card bg-gradient-to-r from-green-100 to-green-200 text-center py-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Ready to Play?</h2>
          <p className="text-gray-700 mb-6 max-w-xl mx-auto">
            Join our community of football players in Baku. Create your profile and start finding matches today.
          </p>
          <Link href="/auth" className="btn-primary text-lg px-8 py-3 inline-block">
            Create Your Account
          </Link>
        </section>
      )}
    </div>
  );
}
