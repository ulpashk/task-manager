import { Table as TableIcon, LayoutDashboard, Building2, Users, Settings, Calendar, BarChart2, Archive, Tag, LayoutGrid, Ticket } from 'lucide-react';

import { TasksTablePage } from '../pages/TaskPage/TasksPage';
import { KanbanPage } from '../pages/KanbanPage';
import { OrganizationsPage } from '../pages/OrganizationsPage';
import { ClientsPage } from '../pages/ClientPage/ClientPage';
import { UsersPage } from '../pages/UserPage/UsersPage';
import { SettingsPage } from '../pages/SettingsPage';
import { CalendarPage } from '../pages/CalendarPage';
import { AnalyticsPage } from '../pages/AnalyticsPage/AnalyticsPage';
import { ArchivePage } from '../pages/ArchivePage';
import { TagsPage } from '../pages/TagsPage';
import { ProjectsPage } from '../pages/ProjectPage/ProjectsPage';
import { PortalTicketsPage } from '../pages/PortalPage/PortalTicketsPage';

export const NAVIGATION_ITEMS = [
  {
    labelKey: 'nav.organizations',
    titleKey: 'nav.organizations_title',
    path: '/organizations',
    icon: Building2,
    component: OrganizationsPage,
    allowedRoles: ['superadmin', 'admin'],
  },
  {
    labelKey: 'nav.portal',
    titleKey: 'nav.portal_title',
    path: '/portal',
    icon: Ticket,
    component: PortalTicketsPage,
    allowedRoles: ['client'],
  },
  {
    labelKey: 'nav.tasks',
    titleKey: 'nav.tasks_title',
    path: '/tasks',
    icon: TableIcon,
    component: TasksTablePage,
    allowedRoles: ['manager', 'engineer'],
  },
  {
    labelKey: 'nav.kanban',
    titleKey: 'nav.kanban_title',
    path: '/kanban',
    icon: LayoutDashboard,
    component: KanbanPage,
    allowedRoles: ['manager', 'engineer'],
  },
  {
    labelKey: 'nav.projects',
    titleKey: 'nav.projects_title',
    path: '/projects',
    icon: LayoutGrid,
    component: ProjectsPage,
    allowedRoles: ['superadmin', 'admin', 'manager', 'engineer'],
  },
  {
    labelKey: 'nav.calendar',
    titleKey: 'nav.calendar_title',
    path: '/calendar',
    icon: Calendar,
    component: CalendarPage,
    allowedRoles: ['manager'],
  },
  {
    labelKey: 'nav.analytics',
    titleKey: 'nav.analytics_title',
    path: '/analytics',
    icon: BarChart2,
    component: AnalyticsPage,
    allowedRoles: ['manager', 'engineer'],
  },
  {
    labelKey: 'nav.users',
    titleKey: 'nav.users_title',
    path: '/users',
    icon: Users,
    component: UsersPage,
    allowedRoles: ['manager'],
  },
  {
    labelKey: 'nav.clients',
    titleKey: 'nav.clients_title',
    path: '/clients',
    icon: Building2,
    component: ClientsPage,
    allowedRoles: ['manager'],
  },
  {
    labelKey: 'nav.archive',
    titleKey: 'nav.archive_title',
    path: '/archive',
    icon: Archive,
    component: ArchivePage,
    allowedRoles: ['manager', 'engineer'],
  },
  {
    labelKey: 'nav.tags',
    titleKey: 'nav.tags_title',
    path: '/tags',
    icon: Tag,
    component: TagsPage,
    allowedRoles: ['manager'],
  },
  {
    labelKey: 'nav.settings',
    titleKey: 'nav.settings_title',
    path: '/settings',
    icon: Settings,
    component: SettingsPage,
    allowedRoles: ['superadmin', 'admin', 'manager', 'engineer', 'client'],
  }
];
