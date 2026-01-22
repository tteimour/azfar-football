'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getRooms, getStadiums, createRoom, getPendingRequestsForMyRooms, updateRequest, getRequestsForUser } from '@/lib/store';
import { Room, Stadium, JoinRequest } from '@/types';
import { MapPin, Users, Calendar, Clock, Plus, Filter, X, Check, Search, Bell } from 'lucide-react';

function RoomsContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [myRequests, setMyRequests] = useState<JoinRequest[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'rooms' | 'requests' | 'my-requests'>('rooms');

  // Filters
  const [filterStadium, setFilterStadium] = useState(searchParams.get('stadium') || '');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Create form
  const [newTitle, setNewTitle] = useState('');
  const [newStadium, setNewStadium] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newMaxPlayers, setNewMaxPlayers] = useState('14');
  const [newSkillLevel, setNewSkillLevel] = useState<Room['skill_level_required']>('any');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    loadData();
    if (searchParams.get('create') === 'true') {
      setShowCreateModal(true);
    }
    if (searchParams.get('tab') === 'requests') {
      setActiveTab('requests');
    }
  }, [searchParams]);

  const loadData = () => {
    setStadiums(getStadiums());
    let allRooms = getRooms().filter(r => r.status === 'open');

    // Apply filters
    if (filterStadium) {
      allRooms = allRooms.filter(r => r.stadium_id === filterStadium);
    }
    if (filterSkill) {
      allRooms = allRooms.filter(r => r.skill_level_required === filterSkill || r.skill_level_required === 'any');
    }
    if (filterDate) {
      allRooms = allRooms.filter(r => r.date === filterDate);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      allRooms = allRooms.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.stadium?.name.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
      );
    }

    setRooms(allRooms);

    if (user) {
      setPendingRequests(getPendingRequestsForMyRooms(user.id));
      setMyRequests(getRequestsForUser(user.id));
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStadium, filterSkill, filterDate, searchQuery, user]);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    createRoom({
      title: newTitle,
      stadium_id: newStadium,
      creator_id: user.id,
      date: newDate,
      start_time: newStartTime,
      end_time: newEndTime,
      max_players: parseInt(newMaxPlayers),
      skill_level_required: newSkillLevel,
      description: newDescription,
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewStadium('');
    setNewDate('');
    setNewStartTime('');
    setNewEndTime('');
    setNewMaxPlayers('14');
    setNewSkillLevel('any');
    setNewDescription('');
    loadData();
  };

  const handleRequestAction = (requestId: string, action: 'approved' | 'rejected') => {
    updateRequest(requestId, action);
    loadData();
  };

  const clearFilters = () => {
    setFilterStadium('');
    setFilterSkill('');
    setFilterDate('');
    setSearchQuery('');
  };

  const hasFilters = filterStadium || filterSkill || filterDate || searchQuery;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Football Matches</h1>
          <p className="text-gray-400 mt-1">Find and join games or create your own</p>
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
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'rooms'
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Matches
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-3 font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'requests'
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Join Requests</span>
            {pendingRequests.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'my-requests'
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Requests
          </button>
        </div>
      )}

      {activeTab === 'rooms' && (
        <>
          {/* Filters */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Filters</span>
              {hasFilters && (
                <button onClick={clearFilters} className="text-sm text-red-400 hover:text-red-300 ml-auto">
                  Clear all
                </button>
              )}
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="label">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10"
                    placeholder="Search matches..."
                  />
                </div>
              </div>
              <div>
                <label className="label">Stadium</label>
                <select
                  value={filterStadium}
                  onChange={(e) => setFilterStadium(e.target.value)}
                  className="input"
                >
                  <option value="">All Stadiums</option>
                  {stadiums.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Skill Level</label>
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
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Room List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/rooms/${room.id}`}
                  className="card hover:border-green-500/50 transition-colors"
                >
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
                  {room.description && (
                    <p className="mt-3 text-sm text-gray-500 line-clamp-2">{room.description}</p>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${(room.current_players / room.max_players) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {room.max_players - room.current_players} spots left
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="md:col-span-3 text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400">No matches found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your filters or create a new match</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'requests' && user && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Pending Join Requests</h2>
          {pendingRequests.length > 0 ? (
            pendingRequests.map((request) => (
              <div key={request.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium">{request.user?.full_name || 'Unknown User'}</p>
                  <p className="text-sm text-gray-400">
                    Wants to join: {request.room?.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    Position: {request.user?.preferred_position} | Skill: {request.user?.skill_level}
                  </p>
                  {request.message && (
                    <p className="text-sm text-gray-400 mt-1">&quot;{request.message}&quot;</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRequestAction(request.id, 'approved')}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleRequestAction(request.id, 'rejected')}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-8">
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No pending requests</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-requests' && user && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">My Join Requests</h2>
          {myRequests.length > 0 ? (
            myRequests.map((request) => (
              <div key={request.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium">{request.room?.title || 'Unknown Room'}</p>
                  <p className="text-sm text-gray-400">
                    {request.room?.stadium?.name} | {request.room?.date}
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
            <div className="card text-center py-8">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">You haven&apos;t sent any join requests yet</p>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create New Match</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
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
              <div>
                <label className="label">Stadium *</label>
                <select
                  value={newStadium}
                  onChange={(e) => setNewStadium(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Select a stadium</option>
                  {stadiums.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} - {s.price_per_hour} AZN/hr</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date *</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="input"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
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
                <button type="submit" className="btn-primary flex-1">
                  Create Match
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    }>
      <RoomsContent />
    </Suspense>
  );
}
