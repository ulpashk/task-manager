import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Settings, Bell, ChevronDown, LogOut, User, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NAVIGATION_ITEMS } from '../../config/navigation';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationPanel } from './NotificationPanel';
import { usePage } from '../../context/PageContext';
import { useTranslation } from 'react-i18next';

export const Header = () => {
  const { t, i18n } = useTranslation();
  const { customTitle } = usePage();
  const { unreadCount, notifications, refreshNotifications } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef(null);

  const [shouldShowFallback, setShouldShowFallback] = useState(false);

  useEffect(() => {
    setShouldShowFallback(false);

    const timer = setTimeout(() => {
      setShouldShowFallback(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const getPageTitle = () => {
    if (customTitle) return customTitle;

    const isDetailPage =
      location.pathname.startsWith('/projects/') ||
      location.pathname.startsWith('/tasks/') ||
      location.pathname.startsWith('/clients/');

    if (isDetailPage && !shouldShowFallback) {
      return "";
    }

    const activeItem = NAVIGATION_ITEMS.find(item => item.path === location.pathname);
    if (activeItem) return t(activeItem.titleKey);

    if (location.pathname.startsWith('/clients/')) return t('clients.info');
    if (location.pathname.startsWith('/projects/')) return t('projects.loading_project');
    if (location.pathname.startsWith('/tasks/')) return t('tasks.task_detail');

    return t('nav.tasks_title');
  };

  const pageTitle = getPageTitle();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'kk', label: t('lang.kk') },
    { code: 'ru', label: t('lang.ru') },
    { code: 'en', label: t('lang.en') },
  ];

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    setIsLangOpen(false);
  };

  return (
    <header className="h-[70px] w-full bg-white border-b border-gray-100 flex items-center justify-between px-8 bg-white z-[50]">
      <h2 className={`text-2xl font-bold text-gray-800 transition-opacity duration-300 ${pageTitle ? 'opacity-100' : 'opacity-0'}`}>{pageTitle}</h2>

      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder={t('common.search')} className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg w-[300px] outline-none" />
        </div>
        <button onClick={() => navigate('/settings')} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <Settings className="text-gray-400 cursor-pointer" size={20} />
        </button>
        <div className="relative" ref={notifRef}>
          <div
            className="relative cursor-pointer p-1 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
          >
            <Bell className="text-gray-400" size={20} />
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
          {isNotifOpen && (
            <NotificationPanel
              items={notifications}
              onClose={() => setIsNotifOpen(false)}
              onRefresh={refreshNotifications}
            />
          )}
        </div>

        {/* Language Switcher */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Globe className="text-gray-400" size={20} />
          </button>
          {isLangOpen && (
            <div className="absolute right-0 mt-3 w-36 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-1 animate-in fade-in slide-in-from-top-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    i18n.language === lang.code
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
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
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => navigate('/settings')}>
                  <User size={16} /> {t('common.profile')}
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={16} /> {t('common.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
