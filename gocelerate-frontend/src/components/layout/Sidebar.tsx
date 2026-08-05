import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_MAIN = [
  { to: '/dashboard',  icon: 'ri-dashboard-line',           label: 'Dashboard'  },
  { to: '/projects',   icon: 'ri-folder-line',              label: 'Projects'   },
  { to: '/milestones', icon: 'ri-flag-line',                label: 'Milestones' },
  { to: '/expenses',   icon: 'ri-money-dollar-circle-line', label: 'Expenses'   },
  { to: '/reports',    icon: 'ri-bar-chart-line',           label: 'Reports'    },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isFunder = user?.role === 'FUNDER';

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'GC';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <aside
      className={`
        w-[272px] min-h-screen bg-sidebar flex flex-col
        fixed left-0 top-0 bottom-0 z-40
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group" onClick={handleNavClick}>
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <i className="ri-rocket-line text-white text-base" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight group-hover:text-white/80 transition-colors">
            Gocelerate
          </span>
        </Link>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="md:hidden text-white/50 hover:text-white p-1 transition-colors"
        >
          <i className="ri-close-line text-xl" />
        </button>
      </div>

      {/* Role badge */}
      <div className="px-4 pt-4 pb-2">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isFunder ? 'bg-accent/15' : 'bg-success/15'}`}>
          <i className={`${isFunder ? 'ri-funds-line text-accent' : 'ri-team-line text-success'} text-sm`} />
          <span className={`text-xs font-semibold ${isFunder ? 'text-accent' : 'text-success'}`}>
            {isFunder ? 'Funder Account' : 'Implementer Account'}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 mb-2 mt-2">Main</p>
        {NAV_MAIN.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-full mb-0.5 text-sm font-medium transition-colors
              ${isActive
                ? 'bg-white text-sidebar font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <i className={`${icon} text-base`} />
            {label}
          </NavLink>
        ))}

        {/* Implementer-only: new project shortcut */}
        {!isFunder && (
          <>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 mb-2 mt-4">Actions</p>
            <NavLink
              to="/projects/new"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-full mb-0.5 text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-white text-sidebar font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <i className="ri-add-circle-line text-base" />
              New Project
            </NavLink>
          </>
        )}

        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 mb-2 mt-4">Account</p>
        <NavLink
          to="/settings"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-full mb-0.5 text-sm font-medium transition-colors
            ${isActive
              ? 'bg-white text-sidebar font-semibold'
              : 'text-white/60 hover:text-white hover:bg-white/10'
            }`
          }
        >
          <i className="ri-settings-line text-base" />
          Settings
        </NavLink>
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.fullName ?? 'User'}</p>
            <p className="text-white/40 text-xs truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-white/40 hover:text-white transition-colors p-1"
          >
            <i className="ri-logout-box-r-line text-base" />
          </button>
        </div>
      </div>
    </aside>
  );
}
