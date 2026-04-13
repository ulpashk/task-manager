import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../../config/navigation';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  const visibleItems = NAVIGATION_ITEMS.filter(item =>
    item.allowedRoles.includes(user?.role)
  );

  return (
    <aside
      className={`h-full bg-white border-r border-gray-100 flex flex-col transition-all duration-500 ease-in-out flex-shrink-0 z-10 ${
        isCollapsed ? 'w-[80px]' : 'w-[250px]'
      }`}
    >
      <div className="h-[70px] flex items-center justify-between px-6 border-b border-transparent">
        {!isCollapsed && (
          <span className="font-bold text-lg whitespace-nowrap overflow-hidden">
            Web Admin
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-transform ${
            isCollapsed ? 'rotate-180 mx-auto' : ''
          }`}
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? t(item.labelKey) : ""}
              className={`flex items-center rounded-lg text-sm font-medium transition-all group ${
                isCollapsed ? 'justify-center py-3' : 'px-4 py-3 gap-3'
              } ${
                isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!isCollapsed && (
                <span className="whitespace-nowrap transition-opacity duration-200">
                  {t(item.labelKey)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
