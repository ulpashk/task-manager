import { useEffect, useState } from 'react';
import { fetchTasksApi } from '../services/taskService';
import { ActionMenu } from '../components/HomePage/ActionMenu';

export const HomePage = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasksApi().then(data => setTasks(data.results));
  }, []);

  const getStatusStyle = (status) => {
    const styles = {
      completed: 'bg-green-50 text-green-600',
      created: 'bg-gray-50 text-gray-600',
      revision: 'bg-blue-50 text-blue-600',
    };
    return styles[status] || styles.created;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
          <tr>
            <th className="px-6 py-4">Компания</th>
            <th className="px-6 py-4">Тема задачи</th>
            <th className="px-6 py-4">Исполнитель</th>
            <th className="px-6 py-4">Статус</th>
            <th className="px-6 py-4">Дедлайн</th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium">{task.title}</td>
              <td className="px-6 py-4 text-gray-600">{task.title}</td>
              <td className="px-6 py-4">
                {task.assignees[0]?.first_name} {task.assignees[0]?.last_name}
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(task.status)}`}>
                  {task.status}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500">
                {new Date(task.deadline).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <ActionMenu />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};