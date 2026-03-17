import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Settings, Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NAVIGATION_ITEMS } from '../../config/navigation';

export const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getPageTitle = () => {
    const activeItem = NAVIGATION_ITEMS.find(item => item.path === location.pathname);
    if (activeItem) return activeItem.label;
    if (location.pathname.startsWith('/clients/')) {
      return 'Информация о компании';
    }
    // if (location.pathname.startsWith('/tasks/')) return 'Детали задачи';
    return 'Заявки';
  };
  const pageTitle = getPageTitle();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-[70px] w-full bg-white border-b border-gray-100 flex items-center justify-between px-8 bg-white z-20">
      <h2 className="text-2xl font-bold text-gray-800">{pageTitle}</h2>

      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Поиск" className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg w-[300px] outline-none" />
        </div>
        <Settings className="text-gray-400 cursor-pointer" size={20} />
        <div className="relative cursor-pointer">
          <Bell className="text-gray-400" size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">24</span>
        </div>

        <div className="relative border-l pl-6" ref={dropdownRef}>
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm border border-gray-300">
              {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-bold text-gray-800 truncate">{user?.name}</p>
                <p className="text-xs text-blue-500 font-medium mt-0.5">{user?.role}</p>
              </div>
              
              <div className="p-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <User size={16} /> Профиль
                </button>
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={16} /> Выйти
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};