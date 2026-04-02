import { ActionMenu } from './ActionMenu';
import { useNavigate } from 'react-router-dom';

export const TaskTable = ({ tasks }) => {
  const navigate = useNavigate();
  const getPriorityStyle = (priority) => {
    if (priority === 'high' || priority === 'HIGH') return 'bg-red-50 text-red-500 border-red-100';
    if (priority === 'medium' || priority === 'MEDIUM') return 'bg-orange-50 text-orange-500 border-orange-100';
    return 'bg-gray-50 text-gray-500 border-gray-100';
  };

  const getStatusStyle = (status) => {
    if (status === 'completed' || status === 'done') return 'bg-green-50 text-green-500';
    if (status === 'TODO' || status === 'created') return 'bg-gray-100 text-gray-500';
    if (status === 'IN_PROGRESS' || status === 'in_progress') return 'bg-yellow-50 text-yellow-500';
    if (status === 'revision' || status === 'waiting') return 'bg-blue-50 text-blue-500';
    return 'bg-gray-50 text-gray-500';
  };

  const getStatusLabel = (s) => {
    if (s === 'done') return 'Выполнено';
    if (s === 'completed' || s === 'Completed' || s === 'COMPLETED') return 'Выполнено';
    if (s === 'todo' || s === 'Todo' || s === 'TODO') return 'Создано';
    if (s === 'created') return 'Создано';
    if (s === 'in_progress' || s === 'In_progress' || s === 'IN_PROGRESS') return 'В обработке';
    if (s === 'revision' || s === 'Revision' || s === 'REVISION') return 'На доработке';
    if (s === 'waiting') return 'На доработке';
    return s;
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead className="text-[13px] font-medium text-gray-500 sticky top-0 z-20">
          <tr>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">Компания</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">Тема задачи</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">Тэг</th>
            {/* <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">Исполнитель</th> */}
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">Инициатор</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100 text-center">Приоритет</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100 text-center">Статус</th>
            {/* <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">Дедлайн</th> */}
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-[14px]">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    <img src={`https://ui-avatars.com/api/?name=${task.client?.name}`} alt="logo" />
                  </div>
                  <span className="font-medium text-gray-700 truncate max-w-[150px]">{task.client?.name || 'Unknown Client'}</span>
                </div>
              </td>
              <td 
                className="px-6 py-4 text-gray-600 max-w-[200px] truncate"
                // onClick={() => navigate(`/tasks/${task.id}`)}
              >
                {task.title}
              </td>
              {/* <td className="px-6 py-4">
                <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-md text-xs border border-purple-100 font-medium">
                  {task.tags[0]?.name || '-'}
                </span>
              </td> */}
              <td className="px-4 py-5">
                <div className="flex flex-wrap gap-1.5">
                  {task.tags && task.tags.length > 0 ? (
                    task.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 rounded-md text-xs font-medium border transition-all"
                        style={{
                          color: tag.color,
                          borderColor: `${tag.color}40`,
                          // backgroundColor: `${tag.color}15`,
                        }}
                      >
                        {tag.name}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-1 bg-gray-50 text-gray-400 rounded-md border border-gray-100 text-xs font-medium">
                      Нет тэгов
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <img className="w-6 h-6 rounded-full" src={`https://ui-avatars.com/api/?name=${task.created_by?.first_name}`} alt="" />
                  <span className="text-gray-700">{task.created_by?.first_name || 'Unknown User'}</span>
                </div>
              </td>
              {/* <td className="px-6 py-4 text-gray-600">Кемелбай Мерей</td> */}
              <td className="px-6 py-4 text-center">
                <span className={`px-3 py-1 rounded-full text-xs border font-medium ${getPriorityStyle(task.priority)}`}>
                  {(task.priority === 'high' || task.priority === 'HIGH') ? 'Высокий' : (task.priority === 'medium' || task.priority === 'MEDIUM') ? 'Средний' : 'Низкий'}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <div className='flex flex-col items-center gap-1'>
                  <span className="px-3 py-1 text-gray-500 whitespace-nowrap">
                    {new Date(task.deadline).toLocaleDateString()} {new Date(task.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <span className={`px-3 py-1 w-2/3 rounded-full text-xs font-medium ${getStatusStyle(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                </div>
              </td>
              {/* <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                {new Date(task.deadline).toLocaleDateString()} {new Date(task.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </td> */}
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