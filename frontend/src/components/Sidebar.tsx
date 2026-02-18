import { NavLink, useNavigate } from 'react-router-dom';
import { Home, User, Bell, Settings, HelpCircle, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/dashboard/profile', icon: User, label: 'My Profile' },
  { to: '/dashboard/notifications', icon: Bell, label: 'Notifications', badge: true },
  { to: '/dashboard/settings', icon: Settings, label: 'Account Settings' },
  { to: '/dashboard/help', icon: HelpCircle, label: 'Help' },
];

interface Props {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: Props) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`flex flex-col flex-shrink-0 bg-navy-800 text-white transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-52'
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className={collapsed ? 'hidden' : ''}>
          <Logo variant="dark" size="sm" />
          <div className="mt-1">
            <span className="text-[10px] bg-teal-500 text-white px-1.5 py-0.5 rounded font-semibold">MYJTVLH4</span>
          </div>
        </div>
        {collapsed && (
          <div className="mx-auto">
            <span className="text-lg font-bold text-white">V<span className="text-teal-500">8</span></span>
          </div>
        )}
        <button onClick={onToggle} className="text-gray-400 hover:text-white">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 mt-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-navy-700 text-white border-l-3 border-teal-400'
                  : 'text-gray-300 hover:text-white hover:bg-navy-700'
              } ${collapsed ? 'justify-center px-3' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} />
            {!collapsed && item.label}
            {item.badge && !collapsed && (
              <span className="w-2 h-2 bg-red-500 rounded-full ml-auto" />
            )}
            {item.badge && collapsed && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className={`flex items-center gap-3 px-5 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-navy-700 transition-colors mb-4 ${
          collapsed ? 'justify-center px-3' : ''
        }`}
        title={collapsed ? 'Log out' : undefined}
      >
        <LogOut size={18} />
        {!collapsed && 'Log out'}
      </button>
    </aside>
  );
}
