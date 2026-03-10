import { ActionMenu } from './ActionMenu';

export const TaskTable = ({ tasks }) => {
  const getPriorityStyle = (priority) => {
    if (priority === 'high') return 'bg-red-50 text-red-500 border-red-100';
    if (priority === 'medium') return 'bg-orange-50 text-orange-500 border-orange-100';
    return 'bg-gray-50 text-gray-500 border-gray-100';
  };

  const getStatusStyle = (status) => {
    if (status === 'completed') return 'bg-green-50 text-green-500';
    if (status === 'revision') return 'bg-blue-50 text-blue-500';
    if (status === 'in_progress') return 'bg-indigo-50 text-indigo-500';
    return 'bg-gray-100 text-gray-500';
  };

  const getStatusLabel = (s) => ({
    completed: 'Выполнено', revision: 'На доработке', 
    in_progress: 'В обработке', created: 'Не начато'
  }[s] || s);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead className="text-[13px] font-medium text-gray-500 sticky top-0 z-20">
          <tr>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">Наименование компании</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">Тема задачи</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">Тип</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">Исполнитель</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">Инициатор</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100 text-center">Приоритет</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100 text-center">Статус</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">Дедлайн</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-[14px]">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    <img src={`https://ui-avatars.com/api/?name=${task.client}`} alt="logo" />
                  </div>
                  <span className="font-medium text-gray-700 truncate max-w-[150px]">{task.client}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">{task.title}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-md text-xs border border-purple-100 font-medium">
                  {task.tags[0]?.name || 'Общий'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <img className="w-6 h-6 rounded-full" src={`https://ui-avatars.com/api/?name=${task.assignees[0]?.first_name}`} alt="" />
                  <span className="text-gray-700">{task.assignees[0]?.first_name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-600">Кемелбай Мерей</td>
              <td className="px-6 py-4 text-center">
                <span className={`px-3 py-1 rounded-full text-xs border font-medium ${getPriorityStyle(task.priority)}`}>
                  {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusStyle(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                {new Date(task.deadline).toLocaleDateString()} {new Date(task.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </td>
              <td className="">
                <ActionMenu />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};