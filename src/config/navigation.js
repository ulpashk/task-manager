import { Table as TableIcon, LayoutDashboard, Building2, Users, Settings, Calendar, BarChart2, Archive, Tag } from 'lucide-react';

import { TasksTablePage } from '../pages/TaskPage/TasksPage';
import { KanbanPage } from '../pages/KanbanPage';
import { OrganizationsPage } from '../pages/OrganizationsPage';
import { ClientsPage } from '../pages/ClientPage/ClientPage';
import { UsersPage } from '../pages/UsersPage';
import { SettingsPage } from '../pages/SettingsPage';
import { CalendarPage } from '../pages/CalendarPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { ArchivePage } from '../pages/ArchivePage';
import { TagsPage } from '../pages/TagsPage';

export const NAVIGATION_ITEMS = [
  {
    label: 'Организации',
    title: 'Список организаций',
    path: '/organizations',
    icon: Building2,
    component: OrganizationsPage,
    allowedRoles: ['superadmin', 'admin'],
  },
  {
    label: 'Таблица',
    title: 'Заявки',
    path: '/tasks',
    icon: TableIcon,
    component: TasksTablePage,
    allowedRoles: ['manager', 'engineer', 'client'],
  },
  {
    label: 'Kanban',
    title: 'Заявки',
    path: '/kanban',
    icon: LayoutDashboard,
    component: KanbanPage,
    allowedRoles: ['manager', 'engineer', 'client'],
  },
  {
    label: 'Календарь',
    title: 'Календарь',
    path: '/calendar',
    icon: Calendar,
    component: CalendarPage,
    allowedRoles: ['manager', 'engineer', 'client'], 
  },
  {
    label: 'Аналитика',
    title: 'Аналиттика',
    path: '/analytics',
    icon: BarChart2,
    component: AnalyticsPage,
    allowedRoles: ['manager', 'engineer', 'client'], 
  },
  {
    label: 'Пользователи',
    title: 'Список пользователей',
    path: '/users',
    icon: Users,
    component: UsersPage,
    allowedRoles: ['manager'],
  },
  {
    label: 'Компании',
    title: 'Список компаний',
    path: '/clients',
    icon: Building2,
    component: ClientsPage,
    allowedRoles: ['manager'],
  },
  {
    label: 'Архив',
    title: 'Архив задач',
    path: '/archive',
    icon: Archive,
    component: ArchivePage,
    allowedRoles: ['manager', 'engineer', 'client'],
  },
  {
    label: 'Тэги',
    title: 'Тэги',
    path: '/tags',
    icon: Tag,
    component: TagsPage,
    allowedRoles: ['manager', 'engineer', 'client'],
  },
  {
    label: 'Настройки',
    title: 'Настройки',
    path: '/settings',
    icon: Settings,
    component: SettingsPage,
    allowedRoles: ['superadmin', 'admin', 'manager', 'engineer', 'client'],
  }
];