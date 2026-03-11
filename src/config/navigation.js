import { Table as TableIcon, LayoutDashboard, Building2, Users, Settings } from 'lucide-react';

// Import your pages
import { HomePage } from '../pages/HomePage';
import { KanbanPage } from '../pages/KanbanPage';
import { OrganizationsPage } from '../pages/OrganizationsPage';
import { UsersPage } from '../pages/UsersPage';
import { SettingsPage } from '../pages/SettingsPage';

export const NAVIGATION_ITEMS = [
  {
    label: 'Таблица',
    path: '/',
    icon: TableIcon,
    component: HomePage,
    allowedRoles: ['superadmin', 'admin', 'manager', 'engineer', 'client'],
  },
  {
    label: 'Kanban',
    path: '/kanban',
    icon: LayoutDashboard,
    component: KanbanPage,
    allowedRoles: ['superadmin', 'admin', 'manager', 'engineer'],
  },
  {
    label: 'Organizations',
    path: '/organizations',
    icon: Building2,
    component: OrganizationsPage,
    allowedRoles: ['superadmin'], 
  },
  {
    label: 'Пользователи',
    path: '/users',
    icon: Users,
    component: UsersPage,
    allowedRoles: ['superadmin', 'admin'],
  },
  {
    label: 'Настройки',
    path: '/settings',
    icon: Settings,
    component: SettingsPage,
    allowedRoles: ['superadmin', 'admin', 'manager', 'engineer', 'client'],
  }
];