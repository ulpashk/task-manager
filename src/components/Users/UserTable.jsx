import { ActionMenu } from '../TasksPage/ActionMenu';
import { formatPhoneNumber } from '../../utils/formatters';

export const UserTable = ({ users }) => {
  const roleLabels = {
    superadmin: 'Суперадмин',
    admin: 'Админ',
    manager: 'Менеджер',
    engineer: 'Инженер',
    client: 'Клиент',
    intern: 'Стажер'
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead className="bg-[#F9FAFB] text-[13px] font-medium text-gray-500 uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4 border-b border-gray-100">ФИО</th>
            <th className="px-6 py-4 border-b border-gray-100">E-mail</th>
            <th className="px-6 py-4 border-b border-gray-100">Роль</th>
            <th className="px-6 py-4 border-b border-gray-100">Номер телефона</th>
            <th className="px-6 py-4 border-b border-gray-100"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-[14px]">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-5 font-medium text-gray-800">
                {user.last_name} {user.first_name} {user.middle_name || ''}
              </td>
              <td className="px-6 py-5 text-gray-500">{user.email}</td>
              <td className="px-6 py-5 text-gray-700">
                {roleLabels[user.role] || user.role}
              </td>
              <td className="px-6 py-5 text-gray-500">
                {formatPhoneNumber(user.phone_number) || '+7 (700) 000-00-00'}
              </td>
              <td className="px-6 py-5 text-right">
                <ActionMenu />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};