'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getRooms, createRoom, getPendingRequestsForMyRooms, updateRequest, getRequestsForUser } from '@/lib/data';
import { Room, JoinRequest } from '@/types';
import { MapPin, Users, Calendar, Clock, Plus, Filter, X, Check, Search, Bell, Map } from 'lucide-react';
import PlayerSlots from '@/components/PlayerSlots';
import { formatDateDisplay, parseDateDDMM, isValidDDMM, getTodayISO } from '@/lib/dateUtils';
import dynamic from 'next/dynamic';

// Dynamic import for LocationPicker to avoid SSR issues
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
      <Map className="w-8 h-8 text-gray-600" />
    </div>
  ),
});

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

  // Create form - custom stadium fields
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

      // Filter rooms
      let filteredRooms = allRooms.filter(r => r.status === 'open');

      if (filterSkill) {
        filteredRooms = filteredRooms.filter(r => r.skill_level_required === filterSkill || r.skill_level_required === 'any');
      }
      if (filterDate) {
        filteredRooms = filteredRooms.filter(r => r.date === filterDate);
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredRooms = filteredRooms.filter(r =>
          r.title.toLowerCase().includes(query) ||
          r.stadium_name?.toLowerCase().includes(query) ||
          r.stadium?.name?.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query)
        );
      }

      setRooms(filteredRooms);

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
  }, [filterSkill, filterDate, searchQuery, user]);

  useEffect(() => {
    loadData();
    if (searchParams.get('create') === 'true') {
      setShowCreateModal(true);
    }
    if (searchParams.get('tab') === 'requests') {
      setActiveTab('requests');
    }
  }, [searchParams, loadData]);

  const handleDateInputChange = (value: string) => {
    setNewDateInput(value);
    setDateError('');

    // Auto-format: add slash after day
    if (value.length === 2 && !value.includes('/')) {
      setNewDateInput(value + '/');
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate date format
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
  };

  const hasFilters = filterSkill || filterDate || searchQuery;

  // Get display name for stadium (prefer inline fields, fallback to stadium object)
  const getStadiumDisplayName = (room: Room): string => {
    return room.stadium_name || room.stadium?.name || 'Unknown Location';
  };

  if (loading && rooms.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Football Matches</h1>
          <p className="text-gray-600 mt-1">Find and join games or create your own</p>
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
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'rooms'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Matches
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-3 font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'requests'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
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
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
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
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Filters</span>
              {hasFilters && (
                <button onClick={clearFilters} className="text-sm text-red-400 hover:text-red-300 ml-auto">
                  Clear all
                </button>
              )}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="label">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
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
                  min={getTodayISO()}
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
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{getStadiumDisplayName(room)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDateDisplay(room.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{room.start_time} - {room.end_time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{room.current_players}/{room.max_players} players</span>
                    </div>
                    {(room.stadium_price_per_hour || room.stadium?.price_per_hour) && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <span className="font-medium">₼</span>
                        <span>{room.stadium_price_per_hour || room.stadium?.price_per_hour} AZN/hr</span>
                      </div>
                    )}
                  </div>
                  {room.description && (
                    <p className="mt-3 text-sm text-gray-500 line-clamp-2">{room.description}</p>
                  )}
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
              ))
            ) : (
              <div className="md:col-span-3 text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600">No matches found</h3>
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
                  <p className="text-sm text-gray-600">
                    Wants to join: {request.room?.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    Position: {request.user?.preferred_position} | Skill: {request.user?.skill_level}
                  </p>
                  {request.message && (
                    <p className="text-sm text-gray-600 mt-1">&quot;{request.message}&quot;</p>
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
              <p className="text-gray-600">No pending requests</p>
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
                  <p className="text-sm text-gray-600">
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
            <div className="card text-center py-8">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600">You haven&apos;t sent any join requests yet</p>
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

              {/* Custom Stadium Fields */}
              <div className="p-4 bg-gray-800/50 rounded-lg space-y-4">
                <h3 className="font-medium text-gray-300">Stadium / Location</h3>
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

                {/* Location Picker Toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(!showLocationPicker)}
                    className="flex items-center space-x-2 text-sm text-green-400 hover:text-green-300"
                  >
                    <Map className="w-4 h-4" />
                    <span>{showLocationPicker ? 'Hide map' : 'Set location on map'}</span>
                    {newStadiumLat && newStadiumLng && (
                      <span className="text-gray-500">(selected)</span>
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
                    className={`input ${dateError ? 'border-red-500' : ''}`}
                    placeholder="25/01"
                    maxLength={5}
                    required
                  />
                  {dateError && <p className="text-red-400 text-sm mt-1">{dateError}</p>}
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
                <button type="submit" className="btn-primary flex-1" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Match'}
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
