import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Table as TableIcon, Calendar, 
  BarChart2, Users, Building2, Archive, Tag, Settings 
} from 'lucide-react';

const menuItems = [
  { name: 'Таблица', icon: <TableIcon size={20}/>, path: '/' },
  { name: 'Kanban', icon: <LayoutDashboard size={20}/>, path: '/kanban' },
  { name: 'Календарь', icon: <Calendar size={20}/>, path: '/calendar' },
  { name: 'Аналитика', icon: <BarChart2 size={20}/>, path: '/analytics' },
  { name: 'Пользователи', icon: <Users size={20}/>, path: '/users' },
  { name: 'Компании', icon: <Building2 size={20}/>, path: '/companies' },
  { name: 'Архив', icon: <Archive size={20}/>, path: '/archive' },
  { name: 'Тэги', icon: <Tag size={20}/>, path: '/tags' },
  { name: 'Настройки', icon: <Settings size={20}/>, path: '/settings' },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-[250px] h-full bg-white border-r border-gray-100 flex flex-col p-6 flex-shrink-0 z-10">
      <div className="mb-10 px-4">
        <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight">Web admin</h1>
      </div>
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === item.path 
              ? 'bg-gray-100 text-blue-600' 
              : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {item.icon}
            {item.name}
          </button>
        ))}
      </nav>
    </aside>
  );
};