'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getJoinedRooms, getMyRooms, getPlayerStats } from '@/lib/data';
import { uploadAvatar } from '@/lib/storage';
import { Room, PlayerStats } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Trophy,
  MapPin,
  Clock,
  Edit2,
  Save,
  X,
  Camera,
  Shield,
  Zap,
  Users,
  ChevronRight,
  PlusCircle,
  History,
  TrendingUp,
} from 'lucide-react';
import PlayerCard from '@/components/PlayerCard';
import { formatDateDisplay } from '@/lib/dateUtils';

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-green"></div>
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

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

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

  const skillColors: Record<string, string> = {
    beginner: 'badge-gray',
    intermediate: 'badge-blue',
    advanced: 'badge-yellow',
    professional: 'badge-green',
  };

  // Split rooms into upcoming and history
  const today = new Date().toISOString().split('T')[0];
  const allRooms = [...myRooms, ...joinedRooms.filter(jr => !myRooms.some(mr => mr.id === jr.id))];
  const upcomingRooms = allRooms
    .filter(r => r.date >= today && r.status !== 'completed' && r.status !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date));
  const completedRooms = allRooms
    .filter(r => r.status === 'completed' || r.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalMatchesCreated = myRooms.length;
  const totalMatchesJoined = joinedRooms.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      {/* Top Section: Profile + PlayerCard side by side on desktop */}
      <div className="grid md:grid-cols-[1fr_auto] gap-6">
        {/* Profile Hero Card */}
        <div className="card">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar with camera overlay */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-neon-green/20 bg-dark-700 flex items-center justify-center">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.full_name}
                    width={112}
                    height={112}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <User className="w-14 h-14 text-slate-600" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                  boxShadow: '0 0 12px rgba(0,255,136,0.3)',
                }}
              >
                {uploadingPhoto ? (
                  <div className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-dark-950" />
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

            {/* Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h1 className="font-heading text-2xl font-bold text-white">{user.full_name}</h1>

              {/* Position + Skill badges */}
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start flex-wrap">
                <span className="badge badge-green">
                  <MapPin className="w-3 h-3 mr-1" />
                  {positionLabels[user.preferred_position]}
                </span>
                <span className={`badge ${skillColors[user.skill_level]}`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {skillLabels[user.skill_level]}
                </span>
              </div>

              {/* Quick stats row */}
              <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start text-sm">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Trophy className="w-4 h-4 text-neon-amber" />
                  <span className="font-medium">{user.games_played} played</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <PlusCircle className="w-4 h-4 text-neon-cyan" />
                  <span className="font-medium">{totalMatchesCreated} created</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Users className="w-4 h-4 text-neon-green" />
                  <span className="font-medium">{totalMatchesJoined} joined</span>
                </div>
              </div>

              {/* Contact info (when not editing) */}
              {!isEditing && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.age && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{user.age} years old</span>
                    </div>
                  )}
                </div>
              )}

              {user.bio && !isEditing && (
                <p className="text-slate-400 text-sm leading-relaxed mt-2 line-clamp-2">{user.bio}</p>
              )}

              {/* Edit toggle */}
              <div className="mt-4">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="btn-primary flex items-center gap-2 text-sm"
                      disabled={saving}
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary flex items-center gap-2 text-sm"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Player Card (shown prominently at top) */}
        <div className="flex justify-center">
          <PlayerCard user={user} stats={playerStats} size="lg" />
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="card animate-fade-in">
          <h2 className="font-heading text-lg font-bold text-white mb-4">Edit Profile</h2>
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
                placeholder="Tell others about yourself..."
              />
            </div>
          </div>
        </div>
      )}

      {/* My Upcoming Matches */}
      <div className="card">
        <h2 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-neon-green" />
          Upcoming Matches
          {upcomingRooms.length > 0 && (
            <span className="badge badge-green text-xs ml-auto">{upcomingRooms.length}</span>
          )}
        </h2>

        {loadingRooms ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-green"></div>
          </div>
        ) : upcomingRooms.length > 0 ? (
          <div className="space-y-2">
            {upcomingRooms.map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className="flex items-center justify-between p-4 rounded-lg bg-dark-900/50 border border-white/5 hover:border-neon-green/20 transition-all duration-200 group"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white text-sm truncate group-hover:text-neon-green transition-colors">
                    {room.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-slate-500 text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{room.stadium_name || room.stadium?.name}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateDisplay(room.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {room.start_time}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <Users className="w-3 h-3" />
                    <span>{room.current_players}/{room.max_players}</span>
                  </div>
                  {room.creator_id === user.id && (
                    <span className="badge badge-blue text-[10px]">Host</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-neon-green transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No upcoming matches</p>
            <Link href="/rooms" className="text-neon-green text-sm mt-2 inline-block hover:underline">
              Browse matches
            </Link>
          </div>
        )}
      </div>

      {/* Match History */}
      <div className="card">
        <h2 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-neon-amber" />
          Match History
          {completedRooms.length > 0 && (
            <span className="text-sm text-slate-500 font-normal ml-auto">{completedRooms.length} matches</span>
          )}
        </h2>

        {loadingRooms ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-green"></div>
          </div>
        ) : completedRooms.length > 0 ? (
          <div className="space-y-2">
            {completedRooms.slice(0, 5).map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className="flex items-center justify-between p-4 rounded-lg bg-dark-900/50 border border-white/5 hover:border-white/10 transition-all duration-200 group"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-300 text-sm truncate group-hover:text-white transition-colors">
                    {room.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-slate-500 text-xs">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{room.stadium_name || room.stadium?.name}</span>
                    <span>-</span>
                    <span>{formatDateDisplay(room.date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <Users className="w-3 h-3" />
                    <span>{room.current_players}/{room.max_players}</span>
                  </div>
                  <span className="badge badge-gray">{room.status}</span>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              </Link>
            ))}
            {completedRooms.length > 5 && (
              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">
                  +{completedRooms.length - 5} more matches
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No match history yet</p>
          </div>
        )}
      </div>

      {/* Player Stats Card (full width, below matches) */}
      <div className="card md:hidden">
        <h2 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-neon-amber" />
          Player Card
        </h2>
        <div className="flex justify-center">
          <PlayerCard user={user} stats={playerStats} size="lg" />
        </div>
      </div>
    </div>
  );
}
