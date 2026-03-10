'use client';

import React, { useEffect, useState, Suspense, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getRooms, createRoom, getPendingRequestsForMyRooms, updateRequest, getRequestsForUser } from '@/lib/data';
import { Room, JoinRequest } from '@/types';
import { MapPin, Users, Calendar, Clock, Plus, X, Check, Search, Bell, Map, DollarSign, Trophy, Loader2, ArrowUpDown, Zap, Timer } from 'lucide-react';
import { formatDateDisplay, parseDateDDMM, isValidDDMM, getTodayISO, getRelativeDay } from '@/lib/dateUtils';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-dark-900 rounded-lg animate-pulse flex items-center justify-center">
      <Map className="w-8 h-8 text-surface-light" />
    </div>
  ),
});

type StatusFilter = 'all' | 'open' | 'full' | 'completed';
type SortOption = 'date-asc' | 'date-desc' | 'players-needed' | 'newest';

function RoomsContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [myRequests, setMyRequests] = useState<JoinRequest[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'rooms' | 'requests' | 'my-requests'>('rooms');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Filters
  const [filterSkill, setFilterSkill] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('open');
  const [sortBy, setSortBy] = useState<SortOption>('date-asc');

  // Create form
  const [newTitle, setNewTitle] = useState('');
  const [newStadiumName, setNewStadiumName] = useState('');
  const [newStadiumAddress, setNewStadiumAddress] = useState('');
  const [newStadiumPrice, setNewStadiumPrice] = useState('');
  const [newDateInput, setNewDateInput] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newMaxPlayers, setNewMaxPlayers] = useState('14');
  const [newSkillLevel, setNewSkillLevel] = useState<Room['skill_level_required']>('any');
  const [newDescription, setNewDescription] = useState('');
  const [dateError, setDateError] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [newStadiumLat, setNewStadiumLat] = useState<number | undefined>();
  const [newStadiumLng, setNewStadiumLng] = useState<number | undefined>();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const allRooms = await getRooms();
      setRooms(allRooms);

      if (user) {
        const [pending, myReqs] = await Promise.all([
          getPendingRequestsForMyRooms(user.id),
          getRequestsForUser(user.id),
        ]);
        setPendingRequests(pending);
        setMyRequests(myReqs);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
    if (searchParams.get('create') === 'true') {
      setShowCreateModal(true);
    }
    if (searchParams.get('tab') === 'requests') {
      setActiveTab('requests');
    }
  }, [searchParams, loadData]);

  // Filtered and sorted rooms computed from the full list
  const filteredRooms = useMemo(() => {
    let result = [...rooms];

    // Status filter
    if (filterStatus === 'open') {
      result = result.filter(r => r.status === 'open' && r.current_players < r.max_players);
    } else if (filterStatus === 'full') {
      result = result.filter(r => r.current_players >= r.max_players || r.status === 'full');
    } else if (filterStatus === 'completed') {
      result = result.filter(r => r.status === 'completed');
    }
    // 'all' shows everything

    // Skill filter
    if (filterSkill) {
      result = result.filter(r => r.skill_level_required === filterSkill || r.skill_level_required === 'any');
    }

    // Date filter
    if (filterDate) {
      result = result.filter(r => r.date === filterDate);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.stadium_name?.toLowerCase().includes(query) ||
        r.stadium?.name?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'date-asc':
        result.sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return (a.start_time || '').localeCompare(b.start_time || '');
        });
        break;
      case 'date-desc':
        result.sort((a, b) => {
          const dateCompare = b.date.localeCompare(a.date);
          if (dateCompare !== 0) return dateCompare;
          return (b.start_time || '').localeCompare(a.start_time || '');
        });
        break;
      case 'players-needed':
        result.sort((a, b) => {
          const spotsA = a.max_players - a.current_players;
          const spotsB = b.max_players - b.current_players;
          return spotsB - spotsA;
        });
        break;
      case 'newest':
        result.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
        break;
    }

    return result;
  }, [rooms, filterStatus, filterSkill, filterDate, searchQuery, sortBy]);

  const handleDateInputChange = (value: string) => {
    setNewDateInput(value);
    setDateError('');
    if (value.length === 2 && !value.includes('/')) {
      setNewDateInput(value + '/');
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!isValidDDMM(newDateInput)) {
      setDateError('Please enter a valid date in dd/mm format');
      return;
    }

    setCreating(true);
    try {
      const isoDate = parseDateDDMM(newDateInput);

      await createRoom({
        title: newTitle,
        stadium_name: newStadiumName,
        stadium_address: newStadiumAddress || undefined,
        stadium_price_per_hour: newStadiumPrice ? parseInt(newStadiumPrice) : undefined,
        stadium_latitude: newStadiumLat,
        stadium_longitude: newStadiumLng,
        creator_id: user.id,
        date: isoDate,
        start_time: newStartTime,
        end_time: newEndTime,
        max_players: parseInt(newMaxPlayers),
        skill_level_required: newSkillLevel,
        description: newDescription,
      });

      setShowCreateModal(false);
      setNewTitle('');
      setNewStadiumName('');
      setNewStadiumAddress('');
      setNewStadiumPrice('');
      setNewDateInput('');
      setNewStartTime('');
      setNewEndTime('');
      setNewMaxPlayers('14');
      setNewSkillLevel('any');
      setNewDescription('');
      setDateError('');
      setShowLocationPicker(false);
      setNewStadiumLat(undefined);
      setNewStadiumLng(undefined);
      await loadData();
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      await updateRequest(requestId, action);
      await loadData();
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const clearFilters = () => {
    setFilterSkill('');
    setFilterDate('');
    setSearchQuery('');
    setFilterStatus('open');
    setSortBy('date-asc');
  };

  const hasFilters = filterSkill || filterDate || searchQuery || filterStatus !== 'open' || sortBy !== 'date-asc';

  const getStadiumDisplayName = (room: Room): string => {
    return room.stadium_name || room.stadium?.name || 'Unknown Location';
  };

  const getStatusBadge = (room: Room) => {
    if (room.status === 'completed') {
      return <span className="badge badge-gray">Completed</span>;
    }
    if (room.current_players >= room.max_players) {
      return <span className="badge badge-yellow">Full</span>;
    }
    if (room.status === 'cancelled') {
      return <span className="badge badge-red">Cancelled</span>;
    }
    return <span className="badge badge-green">Open</span>;
  };

  const getSkillBadgeClass = (skill: string) => {
    switch (skill) {
      case 'beginner': return 'badge-green';
      case 'intermediate': return 'badge-blue';
      case 'advanced': return 'badge-yellow';
      case 'professional': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  const getTimeUntilMatch = (room: Room): { text: string; urgent: boolean } | null => {
    if (room.status === 'completed' || room.status === 'cancelled') return null;

    const now = new Date();
    const matchDateTime = new Date(`${room.date}T${room.start_time}:00`);
    const diffMs = matchDateTime.getTime() - now.getTime();

    if (diffMs < 0) return { text: 'Started', urgent: false };

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours < 1) return { text: `${diffMins}m`, urgent: true };
    if (diffHours < 24) return { text: `${diffHours}h ${diffMins}m`, urgent: diffHours < 3 };
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return { text: 'Tomorrow', urgent: false };
    if (diffDays <= 7) return { text: `${diffDays} days`, urgent: false };
    return null;
  };

  // Count rooms by status for the filter pills
  const statusCounts = useMemo(() => {
    return {
      all: rooms.length,
      open: rooms.filter(r => r.status === 'open' && r.current_players < r.max_players).length,
      full: rooms.filter(r => r.current_players >= r.max_players || r.status === 'full').length,
      completed: rooms.filter(r => r.status === 'completed').length,
    };
  }, [rooms]);

  // Loading skeleton
  if (loading && rooms.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="skeleton h-9 w-48 mb-2" />
            <div className="skeleton h-5 w-72" />
          </div>
          <div className="skeleton h-11 w-40 rounded-lg" />
        </div>
        {/* Filter skeleton */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="skeleton h-10 flex-1 rounded-lg" />
            <div className="skeleton h-10 w-40 rounded-lg" />
            <div className="skeleton h-10 w-40 rounded-lg" />
          </div>
        </div>
        {/* Card skeletons */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card">
              <div className="skeleton h-6 w-3/4 mb-4" />
              <div className="space-y-3">
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-4 w-1/3" />
              </div>
              <div className="skeleton h-3 w-full mt-4 rounded-full" />
              <div className="skeleton h-4 w-1/4 mt-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gradient">Matches</h1>
          <p className="text-slate-400 mt-1">Find and join football matches near you</p>
        </div>
        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Match</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      {user && (
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'rooms'
                ? 'text-neon-green'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Matches
            {activeTab === 'rooms' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-green shadow-glow-green-sm" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-3 font-medium text-sm transition-colors flex items-center space-x-2 relative ${
              activeTab === 'requests'
                ? 'text-neon-green'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Join Requests</span>
            {pendingRequests.length > 0 && (
              <span className="bg-neon-red text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {pendingRequests.length}
              </span>
            )}
            {activeTab === 'requests' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-green shadow-glow-green-sm" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`px-4 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'my-requests'
                ? 'text-neon-green'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Requests
            {activeTab === 'my-requests' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-green shadow-glow-green-sm" />
            )}
          </button>
        </div>
      )}

      {activeTab === 'rooms' && (
        <>
          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {([
              { key: 'open' as StatusFilter, label: 'Open', count: statusCounts.open },
              { key: 'full' as StatusFilter, label: 'Full', count: statusCounts.full },
              { key: 'completed' as StatusFilter, label: 'Completed', count: statusCounts.completed },
              { key: 'all' as StatusFilter, label: 'All', count: statusCounts.all },
            ]).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  filterStatus === key
                    ? 'text-dark-950 shadow-glow-green-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                style={filterStatus === key
                  ? { background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)' }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {label}
                <span className={`ml-1.5 text-xs ${filterStatus === key ? 'opacity-70' : 'text-slate-500'}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Search, Filters & Sort Bar */}
          <div className="card">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10"
                    placeholder="Search matches or stadiums..."
                  />
                </div>
              </div>
              <div className="w-full md:w-40">
                <select
                  value={filterSkill}
                  onChange={(e) => setFilterSkill(e.target.value)}
                  className="input"
                >
                  <option value="">Any Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
              <div className="w-full md:w-40">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="input"
                  min={getTodayISO()}
                />
              </div>
              <div className="w-full md:w-48">
                <div className="relative">
                  <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="input pl-10"
                  >
                    <option value="date-asc">Upcoming first</option>
                    <option value="date-desc">Latest first</option>
                    <option value="players-needed">Most spots open</option>
                    <option value="newest">Recently created</option>
                  </select>
                </div>
              </div>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-secondary flex items-center justify-center space-x-1 text-sm whitespace-nowrap"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Results count */}
          {!loading && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {filteredRooms.length} match{filteredRooms.length !== 1 ? 'es' : ''} found
              </p>
            </div>
          )}

          {/* Match Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => {
                const playerPercent = Math.round((room.current_players / room.max_players) * 100);
                const spotsLeft = room.max_players - room.current_players;
                const price = room.stadium_price_per_hour || room.stadium?.price_per_hour;
                const timeUntil = getTimeUntilMatch(room);
                const relativeDay = getRelativeDay(room.date);

                return (
                  <Link
                    key={room.id}
                    href={`/rooms/${room.id}`}
                    className="card card-hover group relative overflow-hidden"
                  >
                    {/* Top accent line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: room.status === 'completed' ? 'linear-gradient(90deg, #94a3b8, #475569)' : 'linear-gradient(90deg, #00ff88, #00d4ff)' }}
                    />

                    {/* Top row: title + status + time badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-semibold text-lg text-white group-hover:text-neon-green transition-colors line-clamp-1">
                        {room.title}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {timeUntil && (
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              timeUntil.urgent
                                ? 'text-neon-amber'
                                : 'text-neon-cyan'
                            }`}
                            style={{
                              background: timeUntil.urgent
                                ? 'rgba(255,170,0,0.15)'
                                : 'rgba(0,212,255,0.1)',
                              border: timeUntil.urgent
                                ? '1px solid rgba(255,170,0,0.2)'
                                : '1px solid rgba(0,212,255,0.15)',
                            }}
                          >
                            <Timer className="w-3 h-3" />
                            <span>{timeUntil.text}</span>
                          </span>
                        )}
                        {getStatusBadge(room)}
                      </div>
                    </div>

                    {/* Info rows */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-white/60">
                        <MapPin className="w-4 h-4 text-neon-green/50 flex-shrink-0" />
                        <span className="truncate">{getStadiumDisplayName(room)}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-white/60">
                          <Calendar className="w-4 h-4 text-neon-cyan/50 flex-shrink-0" />
                          <span>{formatDateDisplay(room.date)}</span>
                        </div>
                        {relativeDay && (relativeDay === 'Today' || relativeDay === 'Tomorrow') && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            relativeDay === 'Today'
                              ? 'text-neon-amber bg-neon-amber/10 border border-neon-amber/20'
                              : 'text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20'
                          }`}>
                            {relativeDay}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-white/60">
                        <Clock className="w-4 h-4 text-neon-amber/50 flex-shrink-0" />
                        <span>{room.start_time} - {room.end_time}</span>
                      </div>

                      {/* Player count with progress bar */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2 text-white/60">
                            <Users className="w-4 h-4 text-neon-green/40 flex-shrink-0" />
                            <span className="font-medium">{room.current_players}/{room.max_players}</span>
                            <span className="text-white/30">players</span>
                          </div>
                          {spotsLeft > 0 && room.status === 'open' && (
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                              spotsLeft <= 2
                                ? 'text-neon-amber bg-neon-amber/10'
                                : 'text-neon-green/80 bg-neon-green/[0.08]'
                            }`}>
                              {spotsLeft} left
                            </span>
                          )}
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${playerPercent}%`,
                              background: playerPercent >= 100
                                ? 'linear-gradient(90deg, #ffaa00, #ff8800)'
                                : playerPercent >= 75
                                  ? 'linear-gradient(90deg, #00cc6a, #ffaa00)'
                                  : 'linear-gradient(90deg, #00ff88, #00d4ff)',
                              boxShadow: playerPercent >= 100
                                ? '0 0 6px rgba(255,170,0,0.4)'
                                : '0 0 6px rgba(0,255,136,0.25)',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom row: skill badge + price */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <span className={`badge ${getSkillBadgeClass(room.skill_level_required)}`}>
                        {room.skill_level_required === 'any' ? 'All levels' : room.skill_level_required}
                      </span>
                      {price ? (
                        <span className="flex items-center space-x-1 text-neon-green font-bold text-sm">
                          <span>{price}</span>
                          <span className="text-neon-green/50 font-normal text-xs">AZN/hr</span>
                        </span>
                      ) : (
                        <span className="text-xs text-white/25 italic">Free / TBD</span>
                      )}
                    </div>

                    {/* Creator info */}
                    {room.creator && (
                      <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-white/5">
                        <div className="w-6 h-6 rounded-full bg-surface flex items-center justify-center overflow-hidden">
                          {room.creator.avatar_url ? (
                            <img
                              src={room.creator.avatar_url}
                              alt={room.creator.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-3 h-3 text-slate-500" />
                          )}
                        </div>
                        <span className="text-xs text-slate-500 truncate">
                          by {room.creator.full_name}
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })
            ) : (
              /* Enhanced empty state */
              <div className="md:col-span-2 lg:col-span-3 text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)' }}>
                  {searchQuery ? (
                    <Search className="w-10 h-10 text-slate-600" />
                  ) : filterStatus === 'completed' ? (
                    <Trophy className="w-10 h-10 text-slate-600" />
                  ) : (
                    <Zap className="w-10 h-10 text-slate-600" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">
                  {searchQuery
                    ? 'No matches found'
                    : filterStatus === 'completed'
                      ? 'No completed matches'
                      : filterStatus === 'full'
                        ? 'No full matches'
                        : 'No open matches right now'
                  }
                </h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                  {searchQuery
                    ? `No results for "${searchQuery}". Try adjusting your search or filters.`
                    : filterStatus === 'open'
                      ? 'Be the first to create a match and get players together!'
                      : 'Try changing your filters to find what you\'re looking for.'
                  }
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {user && filterStatus === 'open' && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn-primary inline-flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Match</span>
                    </button>
                  )}
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="btn-secondary inline-flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear Filters</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Pending Requests Tab */}
      {activeTab === 'requests' && user && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-heading text-white">Pending Join Requests</h2>
          {pendingRequests.length > 0 ? (
            pendingRequests.map((request) => (
              <div key={request.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center overflow-hidden flex-shrink-0">
                    {request.user?.avatar_url ? (
                      <img
                        src={request.user.avatar_url}
                        alt={request.user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{request.user?.full_name || 'Unknown User'}</p>
                    <p className="text-sm text-slate-400">
                      Wants to join: <span className="text-neon-cyan">{request.room?.title}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {request.user?.preferred_position} | {request.user?.skill_level}
                    </p>
                    {request.message && (
                      <p className="text-sm text-slate-400 mt-1 italic">&quot;{request.message}&quot;</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-auto sm:ml-0">
                  <button
                    onClick={() => handleRequestAction(request.id, 'approved')}
                    className="p-2.5 rounded-lg transition-all duration-200 hover:scale-105"
                    style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.3)' }}
                    title="Approve"
                  >
                    <Check className="w-5 h-5 text-neon-green" />
                  </button>
                  <button
                    onClick={() => handleRequestAction(request.id, 'rejected')}
                    className="p-2.5 rounded-lg transition-all duration-200 hover:scale-105"
                    style={{ background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.3)' }}
                    title="Reject"
                  >
                    <X className="w-5 h-5 text-neon-red" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Bell className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400">No pending requests</p>
            </div>
          )}
        </div>
      )}

      {/* My Requests Tab */}
      {activeTab === 'my-requests' && user && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-heading text-white">My Join Requests</h2>
          {myRequests.length > 0 ? (
            myRequests.map((request) => (
              <div key={request.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{request.room?.title || 'Unknown Room'}</p>
                  <p className="text-sm text-slate-400">
                    {request.room?.stadium_name || request.room?.stadium?.name} | {request.room?.date && formatDateDisplay(request.room.date)}
                  </p>
                </div>
                <span className={`badge ${
                  request.status === 'pending' ? 'badge-yellow' :
                  request.status === 'approved' ? 'badge-green' : 'badge-red'
                }`}>
                  {request.status}
                </span>
              </div>
            ))
          ) : (
            <div className="card text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Users className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400">You haven&apos;t sent any join requests yet</p>
            </div>
          )}
        </div>
      )}

      {/* Create Match Modal */}
      {showCreateModal && user && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto glow-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-heading text-gradient">Create New Match</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="label">Match Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input"
                  placeholder="e.g., Saturday Evening Game"
                  required
                />
              </div>

              {/* Stadium / Location section */}
              <div className="p-4 rounded-lg space-y-4" style={{ background: 'rgba(15,22,41,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="font-medium text-slate-300 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-neon-green" />
                  <span>Stadium / Location</span>
                </h3>
                <div>
                  <label className="label">Stadium Name *</label>
                  <input
                    type="text"
                    value={newStadiumName}
                    onChange={(e) => setNewStadiumName(e.target.value)}
                    className="input"
                    placeholder="e.g., Central Stadium"
                    required
                  />
                </div>
                <div>
                  <label className="label">Address / Location</label>
                  <input
                    type="text"
                    value={newStadiumAddress}
                    onChange={(e) => setNewStadiumAddress(e.target.value)}
                    className="input"
                    placeholder="e.g., Narimanov district, Tabriz str. 45"
                  />
                </div>
                <div>
                  <label className="label">Price per Hour (AZN)</label>
                  <input
                    type="number"
                    value={newStadiumPrice}
                    onChange={(e) => setNewStadiumPrice(e.target.value)}
                    className="input"
                    placeholder="e.g., 80"
                    min="0"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(!showLocationPicker)}
                    className="flex items-center space-x-2 text-sm text-neon-green hover:text-neon-cyan transition-colors"
                  >
                    <Map className="w-4 h-4" />
                    <span>{showLocationPicker ? 'Hide map' : 'Set location on map'}</span>
                    {newStadiumLat && newStadiumLng && (
                      <span className="text-slate-500 text-xs">(selected)</span>
                    )}
                  </button>
                </div>

                {showLocationPicker && (
                  <LocationPicker
                    latitude={newStadiumLat}
                    longitude={newStadiumLng}
                    onLocationChange={(lat, lng) => {
                      setNewStadiumLat(lat);
                      setNewStadiumLng(lng);
                    }}
                    height="250px"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date (dd/mm) *</label>
                  <input
                    type="text"
                    value={newDateInput}
                    onChange={(e) => handleDateInputChange(e.target.value)}
                    className={`input ${dateError ? 'border-neon-red' : ''}`}
                    placeholder="25/01"
                    maxLength={5}
                    required
                  />
                  {dateError && <p className="text-neon-red text-xs mt-1">{dateError}</p>}
                </div>
                <div>
                  <label className="label">Max Players</label>
                  <select
                    value={newMaxPlayers}
                    onChange={(e) => setNewMaxPlayers(e.target.value)}
                    className="input"
                  >
                    <option value="10">10 (5v5)</option>
                    <option value="12">12 (6v6)</option>
                    <option value="14">14 (7v7)</option>
                    <option value="16">16 (8v8)</option>
                    <option value="22">22 (11v11)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Time *</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">End Time *</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Skill Level Required</label>
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value as Room['skill_level_required'])}
                  className="input"
                >
                  <option value="any">Any Level Welcome</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="Tell others about the match..."
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center space-x-2" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Match</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-neon-green animate-spin" />
      </div>
    }>
      <RoomsContent />
    </Suspense>
  );
}
