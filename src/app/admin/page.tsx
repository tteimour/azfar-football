'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getAdminStats, getAllUsers, getRooms, getStadiums, deleteRoom } from '@/lib/data';
import { isDemoMode } from '@/lib/supabase';
import { isAdmin } from '@/lib/database';
import { AdminStats, User, Room, Stadium } from '@/types';
import Link from 'next/link';
import { formatDateDisplay } from '@/lib/dateUtils';
import {
  LayoutDashboard,
  Users,
  Trophy,
  MapPin,
  Calendar,
  Search,
  Trash2,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';

type AdminTab = 'dashboard' | 'users' | 'matches' | 'stadiums';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Check admin access
  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;
      if (!user) {
        setAuthorized(false);
        return;
      }
      if (isDemoMode) {
        setAuthorized(true);
        return;
      }
      const admin = await isAdmin(user.id);
      setAuthorized(admin);
    };
    checkAccess();
  }, [user, authLoading]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, usersData, roomsData, stadiumsData] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getRooms(),
        getStadiums(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setRooms(roomsData);
      setStadiums(stadiumsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authorized) {
      loadData();
    }
  }, [authorized, loadData]);

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteRoom(roomId);
      setDeleteConfirm(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  // Filter helpers
  const filteredUsers = users.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.preferred_position?.toLowerCase().includes(q)
    );
  });

  const filteredRooms = rooms.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title?.toLowerCase().includes(q) ||
      r.stadium_name?.toLowerCase().includes(q) ||
      r.stadium?.name?.toLowerCase().includes(q)
    );
  });

  const filteredStadiums = stadiums.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.address?.toLowerCase().includes(q)
    );
  });

  // Loading / auth states
  if (authLoading || authorized === null) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 rounded-full border-2 border-neon-green/30 border-t-neon-green animate-spin" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-neon-red/10 border border-neon-red/20 flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-neon-red" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-white">Access Denied</h1>
        <p className="text-slate-400 max-w-md">
          You do not have admin privileges to access this page.
        </p>
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'matches', label: 'Matches', icon: <Trophy className="w-4 h-4" /> },
    { id: 'stadiums', label: 'Stadiums', icon: <MapPin className="w-4 h-4" /> },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return 'badge-green';
      case 'full':
        return 'badge-yellow';
      case 'completed':
        return 'badge-blue';
      case 'cancelled':
        return 'badge-red';
      default:
        return 'badge-gray';
    }
  };

  return (
    <div className="min-h-[80vh]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-gradient">
          Admin Dashboard
        </h1>
        <p className="text-slate-400 mt-1">
          Manage your platform
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block w-56 shrink-0">
          <nav className="card p-2 space-y-1 sticky top-24">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-dark">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                  : 'text-slate-400 bg-white/5 border border-white/5 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 rounded-full border-2 border-neon-green/30 border-t-neon-green animate-spin" />
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Total Users"
                    value={stats.total_users}
                    icon={<Users className="w-6 h-6" />}
                    color="green"
                  />
                  <StatCard
                    label="Active Matches"
                    value={stats.active_matches}
                    icon={<Trophy className="w-6 h-6" />}
                    color="cyan"
                  />
                  <StatCard
                    label="Total Stadiums"
                    value={stats.total_stadiums}
                    icon={<MapPin className="w-6 h-6" />}
                    color="amber"
                  />
                  <StatCard
                    label="This Week"
                    value={stats.matches_this_week}
                    icon={<Calendar className="w-6 h-6" />}
                    color="purple"
                  />
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input pl-11"
                      placeholder="Search users..."
                    />
                  </div>

                  <div className="card p-0 overflow-hidden">
                    {/* Table header */}
                    <div className="hidden md:grid grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <div className="w-10">Avatar</div>
                      <div>Name</div>
                      <div>Email</div>
                      <div>Position</div>
                      <div>Skill</div>
                      <div>Games</div>
                    </div>

                    {/* Table rows */}
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(u => (
                        <Link
                          key={u.id}
                          href={`/profile/${u.id}`}
                          className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-2 md:gap-4 px-5 py-3 border-b border-white/5 hover:bg-white/[0.03] transition-colors items-center"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-green/20 to-neon-cyan/10 flex items-center justify-center text-sm font-bold text-neon-green shrink-0">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              u.full_name?.charAt(0)?.toUpperCase() || '?'
                            )}
                          </div>
                          <div className="font-medium text-white text-sm">{u.full_name}</div>
                          <div className="text-sm text-slate-400 truncate">{u.email}</div>
                          <div className="text-sm text-slate-400 capitalize">{u.preferred_position}</div>
                          <div>
                            <span className="badge badge-blue text-[10px]">{u.skill_level}</span>
                          </div>
                          <div className="text-sm text-slate-400 text-center">{u.games_played}</div>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-10 text-slate-500">No users found</div>
                    )}
                  </div>
                </div>
              )}

              {/* Matches Tab */}
              {activeTab === 'matches' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input pl-11"
                      placeholder="Search matches..."
                    />
                  </div>

                  <div className="card p-0 overflow-hidden">
                    <div className="hidden md:grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <div>Title</div>
                      <div>Stadium</div>
                      <div>Date</div>
                      <div>Status</div>
                      <div>Players</div>
                      <div>Actions</div>
                    </div>

                    {filteredRooms.length > 0 ? (
                      filteredRooms.map(room => (
                        <div
                          key={room.id}
                          className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-2 md:gap-4 px-5 py-3 border-b border-white/5 hover:bg-white/[0.03] transition-colors items-center"
                        >
                          <div className="font-medium text-white text-sm">{room.title}</div>
                          <div className="text-sm text-slate-400 truncate">
                            {room.stadium_name || room.stadium?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-slate-400">{formatDateDisplay(room.date)}</div>
                          <div>
                            <span className={`badge ${getStatusBadge(room.status)} text-[10px]`}>
                              {room.status}
                            </span>
                          </div>
                          <div className="text-sm text-slate-400 text-center">
                            {room.current_players}/{room.max_players}
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/rooms/${room.id}`}
                              className="p-1.5 rounded-md hover:bg-white/5 text-slate-400 hover:text-neon-cyan transition-colors"
                              title="View room"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            {deleteConfirm === room.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDeleteRoom(room.id)}
                                  className="text-[10px] px-2 py-1 rounded bg-neon-red/20 text-neon-red hover:bg-neon-red/30 font-medium transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="text-[10px] px-2 py-1 rounded bg-white/5 text-slate-400 hover:bg-white/10 font-medium transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(room.id)}
                                className="p-1.5 rounded-md hover:bg-neon-red/10 text-slate-400 hover:text-neon-red transition-colors"
                                title="Delete room"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-slate-500">No matches found</div>
                    )}
                  </div>
                </div>
              )}

              {/* Stadiums Tab */}
              {activeTab === 'stadiums' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input pl-11"
                      placeholder="Search stadiums..."
                    />
                  </div>

                  <div className="card p-0 overflow-hidden">
                    <div className="hidden md:grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <div>Name</div>
                      <div>Address</div>
                      <div>Price</div>
                      <div>Amenities</div>
                      <div>Matches</div>
                    </div>

                    {filteredStadiums.length > 0 ? (
                      filteredStadiums.map(stadium => {
                        const matchCount = rooms.filter(r => r.stadium_id === stadium.id && r.status === 'open').length;
                        return (
                          <div
                            key={stadium.id}
                            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto_auto] gap-2 md:gap-4 px-5 py-3 border-b border-white/5 hover:bg-white/[0.03] transition-colors items-center"
                          >
                            <div className="font-medium text-white text-sm">{stadium.name}</div>
                            <div className="text-sm text-slate-400 truncate">{stadium.address}</div>
                            <div className="text-sm text-neon-green font-medium">&#8380;{stadium.price_per_hour}</div>
                            <div className="flex flex-wrap gap-1">
                              {stadium.amenities.slice(0, 3).map(a => (
                                <span key={a} className="badge badge-gray text-[10px]">{a}</span>
                              ))}
                              {stadium.amenities.length > 3 && (
                                <span className="badge badge-gray text-[10px]">+{stadium.amenities.length - 3}</span>
                              )}
                            </div>
                            <div className="text-sm text-slate-400 text-center">{matchCount}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-10 text-slate-500">No stadiums found</div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'green' | 'cyan' | 'amber' | 'purple';
}) {
  const colorMap = {
    green: {
      border: 'border-l-neon-green',
      text: 'text-neon-green',
      bg: 'bg-neon-green/5',
      glow: 'shadow-glow-green-sm',
    },
    cyan: {
      border: 'border-l-neon-cyan',
      text: 'text-neon-cyan',
      bg: 'bg-neon-cyan/5',
      glow: 'shadow-glow-cyan-sm',
    },
    amber: {
      border: 'border-l-neon-amber',
      text: 'text-neon-amber',
      bg: 'bg-neon-amber/5',
      glow: 'shadow-glow-amber',
    },
    purple: {
      border: 'border-l-neon-purple',
      text: 'text-neon-purple',
      bg: 'bg-neon-purple/5',
      glow: 'shadow-glow-purple',
    },
  };

  const c = colorMap[color];

  return (
    <div className={`card border-l-4 ${c.border} ${c.bg}`}>
      <div className={`${c.text} mb-3`}>
        {icon}
      </div>
      <div className={`text-3xl font-heading font-bold ${c.text}`}>
        {value}
      </div>
      <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  );
}
