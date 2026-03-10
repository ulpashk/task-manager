import { useEffect, useState } from 'react';
import { fetchTasksApi } from '../services/taskService';
import { TaskFilters } from '../components/HomePage/TaskFilters';
import { TaskTabs } from '../components/HomePage/TaskTabs';
import { TaskTable } from '../components/HomePage/TaskTable';
import { Pagination } from '../components/HomePage/Pagination';

export const HomePage = () => {
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasksApi()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Загрузка данных...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
      <TaskFilters />
      <TaskTabs />
      <div className="flex-1 overflow-hidden">
        <TaskTable tasks={data.results} />
      </div>
      <Pagination count={data.count} />
    </div>
  );
};