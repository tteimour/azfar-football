'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getRooms, getStadiums } from '@/lib/store';
import { Room, Stadium } from '@/types';
import { MapPin, Users, Calendar, Clock, ChevronRight, Trophy, UserPlus, Building } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);

  useEffect(() => {
    setRooms(getRooms().filter(r => r.status === 'open').slice(0, 3));
    setStadiums(getStadiums().slice(0, 3));
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Find Players for Your
          <span className="text-green-500"> Football Match</span>
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Connect with football enthusiasts in Baku. Join matches at Azfar Holding&apos;s premium artificial turf stadiums.
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
          <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Find Players</h3>
          <p className="text-gray-400">
            Connect with other football enthusiasts looking for games in your area
          </p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Building className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Premium Stadiums</h3>
          <p className="text-gray-400">
            Play on Azfar Holding&apos;s high-quality artificial turf fields across Baku
          </p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">All Skill Levels</h3>
          <p className="text-gray-400">
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
        <div className="grid md:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Link key={room.id} href={`/rooms/${room.id}`} className="card hover:border-green-500/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-lg">{room.title}</h3>
                <span className={`badge ${room.skill_level_required === 'any' ? 'badge-green' : 'badge-blue'}`}>
                  {room.skill_level_required === 'any' ? 'All levels' : room.skill_level_required}
                </span>
              </div>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{room.stadium?.name}</span>
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
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(room.current_players / room.max_players) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {room.max_players - room.current_players} spots left
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stadiums */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Our Stadiums</h2>
          <Link href="/stadiums" className="text-green-500 hover:text-green-400 flex items-center">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {stadiums.map((stadium) => (
            <div key={stadium.id} className="card">
              <div className="w-full h-40 bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-lg mb-4 flex items-center justify-center">
                <Building className="w-16 h-16 text-green-500/50" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{stadium.name}</h3>
              <div className="space-y-1 text-gray-400 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{stadium.district}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Capacity: {stadium.capacity} players</span>
                </div>
                <p className="text-green-500 font-semibold mt-2">{stadium.price_per_hour} AZN/hour</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="card bg-gradient-to-r from-green-600/20 to-green-800/20 text-center py-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
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
