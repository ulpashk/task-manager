import { Table as TableIcon, LayoutDashboard, Building2, Users, Settings, Calendar } from 'lucide-react';

import { HomePage } from '../pages/HomePage';
import { KanbanPage } from '../pages/KanbanPage';
import { OrganizationsPage } from '../pages/OrganizationsPage';
import { UsersPage } from '../pages/UsersPage';
import { SettingsPage } from '../pages/SettingsPage';
import { CalendarPage } from '../pages/CalendarPage';

export const NAVIGATION_ITEMS = [
  {
    label: 'Таблица',
    path: '/tasks',
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
    label: 'Календарь',
    path: '/calendar',
    icon: Calendar,
    component: CalendarPage,
    allowedRoles: ['manager', 'engineer', 'client'], 
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