'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getJoinedRooms, getMyRooms, getPlayerStats } from '@/lib/data';
import { uploadAvatar } from '@/lib/storage';
import { Room, PlayerStats } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { User, Mail, Phone, Calendar, Trophy, MapPin, Clock, Edit2, Save, X, Camera } from 'lucide-react';
import PlayerCard from '@/components/PlayerCard';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editPosition, setEditPosition] = useState<'goalkeeper' | 'defender' | 'midfielder' | 'forward' | 'any'>('any');
  const [editSkill, setEditSkill] = useState<'beginner' | 'intermediate' | 'advanced' | 'professional'>('intermediate');
  const [editBio, setEditBio] = useState('');

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoadingRooms(true);
    try {
      const [myRoomsData, joinedRoomsData, statsData] = await Promise.all([
        getMyRooms(user.id),
        getJoinedRooms(user.id),
        getPlayerStats(user.id),
      ]);
      setMyRooms(myRoomsData);
      setJoinedRooms(joinedRoomsData);
      setPlayerStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingRooms(false);
    }
  }, [user]);

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
      loadData();
    }
  }, [user, loading, router, loadData]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: editName,
        phone: editPhone || undefined,
        age: editAge ? parseInt(editAge) : undefined,
        preferred_position: editPosition,
        skill_level: editSkill,
        bio: editBio || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const avatarUrl = await uploadAvatar(user.id, file);
      if (avatarUrl) {
        await updateProfile({ avatar_url: avatarUrl });
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
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
      {/* Profile Header with Player Card */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Player Card */}
          <div className="flex-shrink-0 flex justify-center">
            <PlayerCard user={user} stats={playerStats} size="md" />
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.full_name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <User className="w-8 h-8 text-green-500" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                  >
                    {uploadingPhoto ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-3 h-3 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{user.full_name}</h1>
                  <p className="text-gray-600">{user.email}</p>
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
                    disabled={saving}
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
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
              <div className="grid md:grid-cols-2 gap-4">
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
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {user.phone && (
                    <div className="flex items-center space-x-3 text-gray-700">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.age && (
                    <div className="flex items-center space-x-3 text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{user.age} years old</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm truncate">{user.email}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{positionLabels[user.preferred_position]}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Trophy className="w-4 h-4 text-gray-500" />
                    <span>{skillLabels[user.skill_level]}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Trophy className="w-4 h-4 text-gray-500" />
                    <span>{user.games_played} games played</span>
                  </div>
                </div>
                {user.bio && (
                  <div className="md:col-span-2 pt-3 border-t border-gray-200">
                    <p className="text-gray-700 text-sm">{user.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* My Rooms */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">My Rooms</h2>
        {loadingRooms ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : myRooms.length > 0 ? (
          <div className="space-y-3">
            {myRooms.map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className="flex items-center justify-between p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <div>
                  <h3 className="font-semibold">{room.title}</h3>
                  <p className="text-sm text-gray-600">
                    {room.stadium?.name} • {new Date(room.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-gray-600">
                  <span>{room.current_players}/{room.max_players}</span>
                  <span className={`badge ${room.status === 'open' ? 'badge-green' : room.status === 'completed' ? 'badge-blue' : 'badge-gray'}`}>
                    {room.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">You haven&apos;t created any rooms yet.</p>
        )}
      </div>

      {/* Joined Rooms */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Joined Matches</h2>
        {loadingRooms ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : joinedRooms.length > 0 ? (
          <div className="space-y-3">
            {joinedRooms.map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className="flex items-center justify-between p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <div>
                  <h3 className="font-semibold">{room.title}</h3>
                  <p className="text-sm text-gray-600">
                    {room.stadium?.name}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(room.date).toLocaleDateString()} • {room.start_time}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">You haven&apos;t joined any matches yet.</p>
        )}
      </div>
    </div>
  );
}
