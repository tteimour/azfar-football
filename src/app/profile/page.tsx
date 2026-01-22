'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getJoinedRooms, getMyRooms } from '@/lib/store';
import { Room } from '@/types';
import Link from 'next/link';
import { User, Mail, Phone, Calendar, Trophy, MapPin, Clock, Edit2, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editPosition, setEditPosition] = useState<'goalkeeper' | 'defender' | 'midfielder' | 'forward' | 'any'>('any');
  const [editSkill, setEditSkill] = useState<'beginner' | 'intermediate' | 'advanced' | 'professional'>('intermediate');
  const [editBio, setEditBio] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
    if (user) {
      setEditName(user.full_name);
      setEditPhone(user.phone || '');
      setEditAge(user.age?.toString() || '');
      setEditPosition(user.preferred_position);
      setEditSkill(user.skill_level);
      setEditBio(user.bio || '');
      setMyRooms(getMyRooms(user.id));
      setJoinedRooms(getJoinedRooms(user.id));
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const handleSave = () => {
    updateProfile({
      full_name: editName,
      phone: editPhone || undefined,
      age: editAge ? parseInt(editAge) : undefined,
      preferred_position: editPosition,
      skill_level: editSkill,
      bio: editBio || undefined,
    });
    setIsEditing(false);
  };

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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.full_name}</h1>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="btn-secondary flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="input"
                placeholder="+994..."
              />
            </div>
            <div>
              <label className="label">Age</label>
              <input
                type="number"
                value={editAge}
                onChange={(e) => setEditAge(e.target.value)}
                className="input"
                min={16}
                max={70}
              />
            </div>
            <div>
              <label className="label">Preferred Position</label>
              <select
                value={editPosition}
                onChange={(e) => setEditPosition(e.target.value as typeof editPosition)}
                className="input"
              >
                <option value="any">Any Position</option>
                <option value="goalkeeper">Goalkeeper</option>
                <option value="defender">Defender</option>
                <option value="midfielder">Midfielder</option>
                <option value="forward">Forward</option>
              </select>
            </div>
            <div>
              <label className="label">Skill Level</label>
              <select
                value={editSkill}
                onChange={(e) => setEditSkill(e.target.value as typeof editSkill)}
                className="input"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="professional">Professional</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Bio</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="input"
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {user.phone && (
                <div className="flex items-center space-x-3 text-gray-300">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.age && (
                <div className="flex items-center space-x-3 text-gray-300">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span>{user.age} years old</span>
                </div>
              )}
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-5 h-5 text-gray-500" />
                <span>{user.email}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span>Position: {positionLabels[user.preferred_position]}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Trophy className="w-5 h-5 text-gray-500" />
                <span>Skill: {skillLabels[user.skill_level]}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Trophy className="w-5 h-5 text-gray-500" />
                <span>Games played: {user.games_played}</span>
              </div>
            </div>
            {user.bio && (
              <div className="md:col-span-2 pt-4 border-t border-gray-700">
                <p className="text-gray-300">{user.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* My Rooms */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">My Rooms</h2>
        {myRooms.length > 0 ? (
          <div className="space-y-3">
            {myRooms.map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <div>
                  <h3 className="font-semibold">{room.title}</h3>
                  <p className="text-sm text-gray-400">
                    {room.stadium?.name} • {new Date(room.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-gray-400">
                  <span>{room.current_players}/{room.max_players}</span>
                  <span className={`badge ${room.status === 'open' ? 'badge-green' : 'badge-gray'}`}>
                    {room.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">You haven&apos;t created any rooms yet.</p>
        )}
      </div>

      {/* Joined Rooms */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Joined Matches</h2>
        {joinedRooms.length > 0 ? (
          <div className="space-y-3">
            {joinedRooms.map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <div>
                  <h3 className="font-semibold">{room.title}</h3>
                  <p className="text-sm text-gray-400">
                    {room.stadium?.name}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(room.date).toLocaleDateString()} • {room.start_time}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">You haven&apos;t joined any matches yet.</p>
        )}
      </div>
    </div>
  );
}
