'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getRooms, getStadiums } from '@/lib/data';
import { Room, Stadium } from '@/types';
import {
  Users,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  Trophy,
  UserPlus,
  MessageSquare,
  Zap,
  ArrowRight,
  Search,
  Play,
  Star,
  TrendingUp,
} from 'lucide-react';

// Animated counter hook
function useCountUp(target: number, duration: number = 2000, shouldStart: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, shouldStart]);

  return count;
}

// Intersection Observer hook for reveal-on-scroll
function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(element);
      }
    }, { threshold: 0.2, ...options });

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isInView };
}

export default function HomePage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const stadiumScrollRef = useRef<HTMLDivElement>(null);

  const statsSection = useInView();
  const howItWorksSection = useInView();
  const quickJoinSection = useInView();
  const stadiumsSection = useInView();
  const ctaSection = useInView();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [roomsData, stadiumsData] = await Promise.all([
          getRooms(),
          getStadiums(),
        ]);
        setRooms(roomsData.filter(r => r.status === 'open').slice(0, 3));
        setStadiums(stadiumsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const scrollStadiums = useCallback((direction: 'left' | 'right') => {
    const container = stadiumScrollRef.current;
    if (!container) return;
    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  const playersCount = useCountUp(200, 2000, statsSection.isInView);
  const matchesCount = useCountUp(50, 2000, statsSection.isInView);
  const stadiumsCount = useCountUp(15, 2000, statsSection.isInView);
  const goalsCount = useCountUp(500, 2000, statsSection.isInView);

  const steps = [
    {
      number: '01',
      title: 'Create or Find a Match',
      description: 'Browse upcoming games or create your own match with your preferred stadium, time, and player count.',
      icon: Search,
      color: 'neon-green',
    },
    {
      number: '02',
      title: 'Join & Chat with Players',
      description: 'Send a join request and coordinate with teammates in real-time match chat.',
      icon: MessageSquare,
      color: 'neon-cyan',
    },
    {
      number: '03',
      title: 'Show Up & Play',
      description: 'Hit the pitch, play your game, and rate your teammates to build your stats.',
      icon: Trophy,
      color: 'neon-amber',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* ====== HERO SECTION ====== */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-950/95 to-dark-950" />

          {/* Floating football shapes */}
          <div className="absolute top-[15%] left-[10%] w-24 h-24 rounded-full border border-neon-green/10 animate-float opacity-30" />
          <div
            className="absolute top-[60%] right-[8%] w-16 h-16 rounded-full border border-neon-cyan/10 animate-float opacity-20"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute top-[30%] right-[20%] w-10 h-10 rounded-full border border-neon-amber/10 animate-float opacity-20"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute bottom-[25%] left-[15%] w-14 h-14 rounded-full border border-neon-purple/10 animate-float opacity-15"
            style={{ animationDelay: '1.5s' }}
          />

          {/* Pentagon shapes (football pattern) */}
          <div
            className="absolute top-[20%] right-[12%] w-20 h-20 opacity-[0.04] animate-float"
            style={{
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
              background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
              animationDelay: '0.5s',
            }}
          />
          <div
            className="absolute bottom-[30%] left-[8%] w-12 h-12 opacity-[0.03] animate-float"
            style={{
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
              background: 'linear-gradient(135deg, #ffaa00, #00ff88)',
              animationDelay: '2.5s',
            }}
          />

          {/* Primary glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-neon-green/[0.07] rounded-full blur-[150px]" />
          {/* Secondary glow */}
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[200px] bg-neon-cyan/[0.04] rounded-full blur-[120px]" />
        </div>

        <div className="relative container mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Live Badge */}
            <div className="hero-live-badge mb-8 animate-fade-in">
              <span className="live-dot" />
              <span className="text-xs font-bold text-neon-green tracking-widest uppercase">
                {rooms.length > 0 ? `${rooms.length} Live Matches` : 'Live Now'}
              </span>
              {rooms.length > 0 && (
                <span className="text-xs text-white/30 font-normal">· Baku, AZ</span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <span className="text-white">Find Players.</span>
              <br />
              <span className="text-gradient-animated">Dominate the Pitch.</span>
            </h1>

            <p
              className="text-base md:text-lg lg:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in"
              style={{ animationDelay: '200ms' }}
            >
              The ultimate platform for football players in Baku. Join pickup games at premium stadiums, build your FIFA-style stats card, and connect with the community.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
              style={{ animationDelay: '300ms' }}
            >
              <Link
                href="/rooms"
                className="btn-primary flex items-center space-x-2 text-base px-8 py-3.5 w-full sm:w-auto justify-center group"
                style={{ boxShadow: '0 0 40px rgba(0, 255, 136, 0.35), 0 4px 16px rgba(0,0,0,0.4)' }}
              >
                <Search className="w-5 h-5" />
                <span>Find a Match</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </Link>
              {user ? (
                <Link
                  href="/rooms?create=true"
                  className="btn-secondary flex items-center space-x-2 text-base px-8 py-3.5 w-full sm:w-auto justify-center group"
                >
                  <Zap className="w-5 h-5 text-neon-amber group-hover:text-neon-green transition-colors" />
                  <span>Create a Match</span>
                </Link>
              ) : (
                <Link
                  href="/auth"
                  className="btn-secondary flex items-center space-x-2 text-base px-8 py-3.5 w-full sm:w-auto justify-center group"
                >
                  <UserPlus className="w-5 h-5 group-hover:text-neon-green transition-colors" />
                  <span>Get Started Free</span>
                </Link>
              )}
            </div>

            {/* Inline live stats */}
            <div
              className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-12 animate-fade-in"
              style={{ animationDelay: '400ms' }}
            >
              {[
                { icon: Users, label: 'Active Players', value: '200+', color: 'text-neon-green' },
                { icon: Trophy, label: 'Matches Played', value: '50+', color: 'text-neon-cyan' },
                { icon: Star, label: 'Avg Rating', value: '4.8★', color: 'text-neon-amber' },
              ].map((stat, i) => (
                <div key={stat.label} className="stat-pill" style={{ animationDelay: `${500 + i * 80}ms` }}>
                  <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                  <span className={`font-bold ${stat.color}`}>{stat.value}</span>
                  <span className="text-white/40 font-normal">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2">
            <div className="w-1 h-2.5 rounded-full bg-white/40 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ====== QUICK JOIN - NEXT AVAILABLE MATCHES ====== */}
      <section
        ref={quickJoinSection.ref}
        className={`container mx-auto px-4 py-16 md:py-20 transition-all duration-700 ${
          quickJoinSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="live-dot" style={{ width: '6px', height: '6px' }} />
              <span className="text-xs font-semibold text-neon-green/60 tracking-widest uppercase">Live</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white section-heading">
              Next Available Matches
            </h2>
            <p className="text-sm text-white/40 mt-1">Jump into a game today</p>
          </div>
          <Link
            href="/rooms"
            className="flex items-center gap-1.5 text-sm font-semibold text-neon-green/60 hover:text-neon-green transition-colors group px-3 py-1.5 rounded-lg hover:bg-neon-green/5 border border-transparent hover:border-neon-green/15"
          >
            View all <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="skeleton h-5 w-3/4 mb-4" />
                <div className="space-y-3">
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="skeleton h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-5">
            {rooms.map((room, idx) => {
              const fillPercent = (room.current_players / room.max_players) * 100;
              const spotsLeft = room.max_players - room.current_players;

              return (
                <Link
                  key={room.id}
                  href={`/rooms/${room.id}`}
                  className="card card-hover group relative overflow-hidden"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Top accent line that animates on hover */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(90deg, #00ff88, #00d4ff)' }}
                  />

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-heading font-semibold text-white text-lg group-hover:text-neon-green transition-colors line-clamp-1">
                      {room.title}
                    </h3>
                    <span className={`badge flex-shrink-0 ml-2 ${room.skill_level_required === 'any' ? 'badge-green' : 'badge-blue'}`}>
                      {room.skill_level_required === 'any' ? 'All levels' : room.skill_level_required}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center space-x-2.5 text-white/50">
                      <MapPin className="w-4 h-4 text-neon-green/50 flex-shrink-0" />
                      <span className="truncate">{room.stadium_name || room.stadium?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2.5 text-white/50">
                      <Calendar className="w-4 h-4 text-neon-cyan/50 flex-shrink-0" />
                      <span>
                        {new Date(room.date).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2.5 text-white/50">
                      <Clock className="w-4 h-4 text-neon-amber/50 flex-shrink-0" />
                      <span>{room.start_time} - {room.end_time}</span>
                    </div>
                  </div>

                  {/* Player progress bar */}
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5 text-white/50">
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
                          {room.current_players}/{room.max_players} players
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        spotsLeft <= 2
                          ? 'text-neon-amber bg-neon-amber/10'
                          : 'text-neon-green/80 bg-neon-green/[0.08]'
                      }`}>
                        {spotsLeft === 0 ? 'Full' : `${spotsLeft} left`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${fillPercent}%`,
                          background: fillPercent > 80
                            ? 'linear-gradient(90deg, #ffaa00, #ff6644)'
                            : 'linear-gradient(90deg, #00ff88, #00d4ff)',
                          boxShadow: fillPercent > 80
                            ? '0 0 8px rgba(255,170,0,0.4)'
                            : '0 0 8px rgba(0,255,136,0.3)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Join hint */}
                  <div className="mt-3 flex items-center justify-center py-2 rounded-lg bg-neon-green/5 border border-neon-green/10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                    <Play className="w-3.5 h-3.5 text-neon-green mr-1.5" />
                    <span className="text-xs font-bold text-neon-green tracking-wide">Quick Join</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Trophy className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-heading font-semibold text-white/60">No upcoming matches</h3>
            <p className="text-sm text-white/30 mt-2">Be the first to create a match!</p>
            {user && (
              <Link href="/rooms?create=true" className="btn-primary inline-flex items-center space-x-2 mt-6 text-sm">
                <Zap className="w-4 h-4" />
                <span>Create Match</span>
              </Link>
            )}
          </div>
        )}
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section
        ref={howItWorksSection.ref}
        className={`container mx-auto px-4 py-16 md:py-20 transition-all duration-700 ${
          howItWorksSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="text-center mb-12">
          <div className="section-divider mb-4 max-w-xs mx-auto">
            <span className="text-xs font-bold text-neon-green/50 tracking-widest uppercase px-2">Get Started</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">
            How It Works
          </h2>
          <p className="text-white/40 max-w-md mx-auto">
            Three simple steps to get on the pitch
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-px bg-gradient-to-r from-neon-green/30 via-neon-cyan/20 to-neon-amber/30" />

          {steps.map((step, idx) => {
            const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
              'neon-green': {
                bg: 'bg-neon-green/10',
                border: 'border-neon-green/20',
                text: 'text-neon-green',
                glow: 'group-hover:shadow-glow-green-sm',
              },
              'neon-cyan': {
                bg: 'bg-neon-cyan/10',
                border: 'border-neon-cyan/20',
                text: 'text-neon-cyan',
                glow: 'group-hover:shadow-glow-cyan-sm',
              },
              'neon-amber': {
                bg: 'bg-neon-amber/10',
                border: 'border-neon-amber/20',
                text: 'text-neon-amber',
                glow: 'group-hover:shadow-glow-amber',
              },
            };
            const colors = colorMap[step.color];

            return (
              <div
                key={step.title}
                className="relative"
                style={{
                  transitionDelay: `${idx * 150}ms`,
                }}
              >
                <div className="card card-hover text-center group relative overflow-hidden">
                  {/* Step number circle */}
                  <div className={`w-14 h-14 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center mx-auto mb-5 ${colors.glow} transition-all duration-300`}>
                    <span className={`${colors.text} font-heading font-bold text-xl`}>
                      {step.number}
                    </span>
                  </div>
                  {/* Icon */}
                  <step.icon className={`w-6 h-6 ${colors.text} opacity-60 mx-auto mb-3`} />
                  {/* Title */}
                  <h3 className="font-heading font-semibold text-white text-xl mb-2">
                    {step.title}
                  </h3>
                  {/* Description */}
                  <p className="text-sm text-white/40 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ====== STATS / SOCIAL PROOF ====== */}
      <section
        ref={statsSection.ref}
        className={`container mx-auto px-4 py-12 transition-all duration-700 ${
          statsSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="card bg-green-glow-gradient relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-neon-green/5 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-neon-cyan/5 rounded-full blur-[60px]" />

          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 py-4">
            {[
              { label: 'Players', value: playersCount, suffix: '+', icon: Users },
              { label: 'Matches', value: matchesCount, suffix: '+', icon: Trophy },
              { label: 'Stadiums', value: stadiumsCount, suffix: '+', icon: MapPin },
              { label: 'Goals Scored', value: goalsCount, suffix: '+', icon: TrendingUp },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <stat.icon className="w-5 h-5 text-neon-green/40 mx-auto mb-2" />
                <div className="text-3xl md:text-4xl font-heading font-bold text-neon-green mb-1 tabular-nums">
                  {statsSection.isInView ? stat.value : 0}{stat.suffix}
                </div>
                <div className="text-xs md:text-sm text-white/40 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== POPULAR STADIUMS ====== */}
      <section
        ref={stadiumsSection.ref}
        className={`py-16 md:py-20 transition-all duration-700 ${
          stadiumsSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-white section-heading">
                Popular Stadiums
              </h2>
              <p className="text-sm text-white/40 mt-1">Premium pitches across Baku</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollStadiums('left')}
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-neon-green/30 transition-all"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollStadiums('right')}
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-neon-green/30 transition-all"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal scrollable container */}
        <div
          ref={stadiumScrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-dark px-4 md:px-[max(1rem,calc((100vw-1280px)/2+1rem))] pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'thin' }}
        >
          {(stadiums.length > 0 ? stadiums : []).map((stadium) => (
            <div
              key={stadium.id}
              className="card card-hover flex-shrink-0 w-[280px] sm:w-[300px] snap-start group relative overflow-hidden"
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(90deg, #00ff88, #00d4ff)' }}
              />

              {/* Stadium icon/placeholder */}
              <div className="w-full h-28 rounded-lg bg-gradient-to-br from-neon-green/10 to-neon-cyan/5 border border-white/5 flex items-center justify-center mb-4 overflow-hidden group-hover:from-neon-green/[0.12] group-hover:to-neon-cyan/10 transition-all duration-300">
                <div className="text-center">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-2 transition-all duration-300"
                    style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.15)' }}
                  >
                    <MapPin className="w-5 h-5 text-neon-green/70" />
                  </div>
                  <span className="text-xs text-white/25 font-medium">{stadium.district}</span>
                </div>
              </div>

              {/* Stadium info */}
              <h3 className="font-heading font-semibold text-white text-base mb-3 group-hover:text-neon-green transition-colors line-clamp-1">
                {stadium.name}
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white/30 uppercase tracking-wider font-semibold">District</span>
                  <span className="text-white/60">{stadium.district}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/30 uppercase tracking-wider font-semibold">Capacity</span>
                  <span className="text-white/60">{stadium.capacity} players</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-white/30 uppercase tracking-wider font-semibold">Price</span>
                  <span className="font-bold text-neon-green text-sm">{stadium.price_per_hour} <span className="text-neon-green/50 font-normal text-xs">AZN/hr</span></span>
                </div>
              </div>
            </div>
          ))}

          {stadiums.length === 0 && !loading && (
            <div className="flex-shrink-0 w-full text-center py-8">
              <p className="text-white/30 text-sm">No stadiums available</p>
            </div>
          )}
        </div>
      </section>

      {/* ====== CTA FOOTER SECTION ====== */}
      <section
        ref={ctaSection.ref}
        className={`container mx-auto px-4 py-16 pb-24 transition-all duration-700 ${
          ctaSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="card bg-green-glow-gradient text-center py-12 md:py-16 px-6 relative overflow-hidden" style={{ borderColor: 'rgba(0,255,136,0.12)', boxShadow: '0 0 60px rgba(0,255,136,0.06), 0 4px 40px rgba(0,0,0,0.4)' }}>
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-neon-green/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-neon-cyan/5 rounded-full blur-[80px]" />
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(0,255,136,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.5) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/20">
              <Trophy className="w-3.5 h-3.5 text-neon-amber" />
              <span className="text-xs font-bold text-neon-green tracking-wider uppercase">Join the Community</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
              Ready to <span className="text-gradient">Play?</span>
            </h2>
            <p className="text-white/40 max-w-lg mx-auto mb-8 text-base md:text-lg">
              Join the Baku football community. Create your profile, find matches, and build your player stats.
            </p>
            {user ? (
              <Link
                href="/rooms?create=true"
                className="btn-primary inline-flex items-center space-x-2 text-base px-8 py-3.5"
              >
                <Zap className="w-5 h-5" />
                <span>Create a Match</span>
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth"
                  className="btn-primary inline-flex items-center space-x-2 text-base px-8 py-3.5"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>Create Your Account</span>
                </Link>
                <Link
                  href="/rooms"
                  className="btn-secondary inline-flex items-center space-x-2 text-base px-8 py-3.5"
                >
                  <Search className="w-5 h-5" />
                  <span>Browse Matches</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
