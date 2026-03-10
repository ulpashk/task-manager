import { useEffect, useState } from 'react';
import { fetchTasksApi } from '../services/taskService';
import { ActionMenu } from '../components/HomePage/ActionMenu';

const COLUMNS = [
  { id: 'created', title: 'Не начато', bg: 'bg-gray-100' },
  { id: 'in_progress', title: 'В обработке', bg: 'bg-orange-50' },
  { id: 'revision', title: 'На доработке', bg: 'bg-indigo-50' },
  { id: 'completed', title: 'Выполнено', bg: 'bg-green-50' }
];

export const KanbanPage = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasksApi().then(data => setTasks(data.results));
  }, []);

  return (
    <div className="grid grid-cols-4 gap-6">
      {COLUMNS.map(col => (
        <div key={col.id} className="flex flex-col gap-4">
          <div className={`${col.bg} p-3 rounded-lg text-center font-semibold text-gray-700`}>
            {col.title}
          </div>
          <div className="space-y-4">
            {tasks.filter(t => t.status === col.id).map(task => (
              <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative group">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-gray-400">{task.client.name}</span>
                  <ActionMenu />
                </div>
                <h4 className="text-sm font-semibold mb-4 leading-tight">{task.title}</h4>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-[10px] flex items-center justify-center font-bold text-blue-600">
                    {task.assignees[0]?.first_name[0]}
                  </div>
                  <span className="text-xs text-gray-500">{task.assignees[0]?.first_name}</span>
                </div>
                <div className="text-[11px] text-red-500 font-medium bg-red-50 p-1 px-2 rounded inline-block">
                  Дедлайн: {new Date(task.deadline).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};