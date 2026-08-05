import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  title: string;
  onMenuClick?: () => void;
}

export default function Topbar({ title, onMenuClick }: TopbarProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'GC';

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center px-4 sm:px-6 lg:px-10 gap-4 sticky top-0 z-20">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-ground text-muted hover:text-ink transition-colors"
        aria-label="Open navigation"
      >
        <i className="ri-menu-line text-xl" />
      </button>

      {/* Title */}
      <h1 className="text-base sm:text-lg font-semibold text-ink whitespace-nowrap">{title}</h1>

      {/* Search — hidden on smallest screens */}
      <div className="flex-1 max-w-sm relative hidden sm:block">
        <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm" />
        <input
          type="search"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-ground rounded-lg border-0 pl-9 pr-4 py-2 text-sm text-ink placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-sidebar/20"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notification */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-ground text-muted hover:text-ink transition-colors">
          <i className="ri-notification-3-line text-base" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-sidebar flex items-center justify-center text-white text-xs font-bold cursor-pointer select-none">
          {initials}
        </div>
      </div>
    </header>
  );
}
