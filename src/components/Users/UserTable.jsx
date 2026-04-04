import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { ActionMenu } from '../TasksPage/ActionMenu';

export const UserTable = ({ users, onSort, currentOrdering, onEdit, onDelete }) => {
  const getSortIcon = (field) => {
    if (currentOrdering === field) return <ChevronUp size={14} className="text-blue-600" />;
    if (currentOrdering === `-${field}`) return <ChevronDown size={14} className="text-blue-600" />;
    return <ChevronsUpDown size={14} className="text-gray-300" />;
  };

  return (
    <table className="w-full text-left border-separate border-spacing-0">
      <thead className="bg-[#F9FAFB] text-[12px] font-bold text-gray-400 uppercase sticky top-0 z-10">
        <tr>
          <th className="px-6 py-4 border-b cursor-pointer" onClick={() => onSort('last_name')}>
            <div className="flex items-center gap-1">ФИО {getSortIcon('last_name')}</div>
          </th>
          <th className="px-6 py-4 border-b cursor-pointer" onClick={() => onSort('email')}>
            <div className="flex items-center gap-1">Email {getSortIcon('email')}</div>
          </th>
          <th className="px-6 py-4 border-b">Роль</th>
          <th className="px-6 py-4 border-b">Телефон</th>
          <th className="px-6 py-4 border-b"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50 text-[14px]">
        {users.map(user => (
          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-5 text-gray-500">{user.last_name} {user.first_name}</td>
            <td className="px-6 py-5 text-gray-500">{user.email}</td>
            <td className="px-6 py-5 uppercase text-[11px] font-bold text-gray-400">{user.role}</td>
            <td className="px-6 py-5 text-gray-500">{user.phone || '—'}</td>
            <td className="px-6 py-5">
              <ActionMenu onEdit={() => onEdit(user)} onDelete={() => onDelete(user)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};