import React, { useState, useEffect } from 'react';
import { Search, Filter, LogOut } from 'lucide-react';
import { Badge } from '../../components/ui';
import { NotificationBell } from '../teams/NotificationBell';
import { getTeamRepository } from '../teams/teamRepository';
import { TeamInvitation } from '../teams/types';
import { formatTopBarDate } from '../../utils/dateUtils';

export interface WorkspaceTopBarProps {
  title: string;
  subtitle?: string;
  isPreview?: boolean;
  user?: {
    id?: string;
    name: string;
    email?: string;
  };
  authMode?: 'firebase' | 'emulator' | 'unconfigured';
  onSearchFocus?: () => void;
  onSignOut?: () => void;
  invitations?: TeamInvitation[];
  onRespondInvitation?: (invitationId: string, accept: boolean) => Promise<void>;
  currentDate?: string;
}

export const WorkspaceTopBar: React.FC<WorkspaceTopBarProps> = ({
  title,
  subtitle,
  isPreview = true,
  user,
  authMode,
  onSearchFocus,
  onSignOut,
  invitations: propInvitations,
  onRespondInvitation,
  currentDate: propCurrentDate,
}) => {
  const userName = isPreview ? 'Demo User' : user?.name || 'Alex Morgan';
  const userInitials = isPreview
    ? 'DU'
    : userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
  const userSubtitle = isPreview
    ? 'Personal Workspace'
    : user?.email || 'alex.morgan@gmail.com';
  const userEmail = isPreview ? 'demo@vido.app' : user?.email || 'alex.morgan@gmail.com';
  const userId = isPreview ? 'demo-user-uid' : user?.id || 'alex-morgan-uid';

  const [displayDate, setDisplayDate] = useState<string>(() => propCurrentDate ?? formatTopBarDate());

  useEffect(() => {
    if (propCurrentDate) {
      setDisplayDate(propCurrentDate);
      return;
    }
    const interval = setInterval(() => {
      setDisplayDate(formatTopBarDate());
    }, 60000);
    return () => clearInterval(interval);
  }, [propCurrentDate]);

  const [internalInvitations, setInternalInvitations] = useState<TeamInvitation[]>([]);

  useEffect(() => {
    if (propInvitations !== undefined) return;
    const repo = getTeamRepository();
    const unsubscribe = repo.subscribeToInvitations(userEmail, (invites) => {
      setInternalInvitations(invites);
    });
    return unsubscribe;
  }, [userEmail, propInvitations]);

  const activeInvitations = propInvitations ?? internalInvitations;

  const handleRespond = async (invitationId: string, accept: boolean) => {
    if (onRespondInvitation) {
      await onRespondInvitation(invitationId, accept);
      return;
    }
    const repo = getTeamRepository();
    await repo.respondToInvitation(invitationId, accept, {
      id: userId,
      email: userEmail,
      name: userName,
    });
  };

  return (
    <header className="sticky top-0 z-20 bg-[var(--surface)]/95 backdrop-blur-xs border-b border-[var(--line)] px-6 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-[var(--ink)]">{title}</h1>
          {isPreview ? (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--amber-soft)] text-[var(--amber)] border border-[var(--amber)]/35 flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)] animate-pulse" />
              Interactive Preview
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--green-soft)] text-[var(--green)] border border-[var(--green)]/30 flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" />
                Active
              </span>
              {authMode && authMode !== 'unconfigured' && (
                <span
                  className={`hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all ${
                    authMode === 'emulator'
                      ? 'bg-[var(--amber-soft)] text-[var(--amber)] border-[var(--amber)]/30'
                      : 'bg-[var(--green-soft)] text-[var(--green)] border-[var(--green)]/30'
                  }`}
                  title={
                    authMode === 'emulator'
                      ? 'Connected to Firebase CLI Auth Emulator (localhost:9099)'
                      : 'Connected to Live Firebase'
                  }
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      authMode === 'emulator'
                        ? 'bg-[var(--amber)]'
                        : 'bg-[var(--green)]'
                    }`}
                  />
                  <span>
                    {authMode === 'emulator'
                      ? 'Emulator :9099'
                      : 'Live Firebase'}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
        {subtitle && <p className="text-xs text-[var(--muted)]">{subtitle}</p>}
      </div>

      {/* Right Controls: Search, Filter, and User Profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block w-56 lg:w-64">
          <Search className="w-4 h-4 text-[var(--faint)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            placeholder="Search tasks..."
            onFocus={onSearchFocus}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--canvas)] border border-[var(--line)] rounded-lg text-[var(--ink)] placeholder-[var(--faint)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] transition-all"
            aria-label="Search tasks"
          />
        </div>

        {/* Filter */}
        <button
          type="button"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-medium text-[var(--muted)] hover:bg-[var(--canvas)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] transition-colors cursor-pointer"
          aria-label="Filter tasks"
        >
          <Filter className="w-3.5 h-3.5 text-[var(--faint)]" />
          <span>All Priorities</span>
        </button>

        {/* Date Badge */}
        <div className="hidden lg:block">
          <Badge variant="neutral" size="sm" data-testid="topbar-date">
            {displayDate}
          </Badge>
        </div>

        {/* Notification Bell */}
        <NotificationBell
          invitations={activeInvitations}
          onRespond={handleRespond}
        />

        {/* User Profile Badge */}
        <div
          className="flex items-center gap-2 pl-3 border-l border-[var(--line)]"
          title={`${userName} ${isPreview ? '(Preview Mode)' : ''}`}
        >
          <div
            className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border shadow-xs ${
              isPreview
                ? 'bg-[var(--amber-soft)] text-[var(--amber)] border-[var(--amber)]/35'
                : 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/30'
            }`}
          >
            {userInitials}
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[var(--ink)] block leading-tight">
                {userName}
              </span>
              {isPreview && (
                <span className="text-[9px] font-mono font-bold uppercase px-1 py-0.2 rounded bg-[var(--amber-soft)] text-[var(--amber)] border border-[var(--amber)]/30">
                  Demo
                </span>
              )}
            </div>
            <span className="text-[10px] text-[var(--muted)] block leading-tight truncate max-w-[130px]">
              {userSubtitle}
            </span>
          </div>
        </div>

        {/* Sign Out Button (for authenticated workspace) */}
        {!isPreview && onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out"
            className="p-1.5 rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-[var(--red)] hover:bg-[var(--red-soft)] hover:border-[var(--red)]/30 transition-colors cursor-pointer shrink-0"
            title="Sign out of ViDo"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
