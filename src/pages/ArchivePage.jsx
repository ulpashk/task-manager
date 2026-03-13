import { useEffect, useState } from 'react';
import { fetchTasksApi } from '../services/taskService';
import { TaskFilters } from '../components/TasksPage/TaskFilters';
import { TaskTable } from '../components/TasksPage/TaskTable';
import { Pagination } from '../components/general/Pagination';

export const ArchivePage = () => {
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const [filters, setFilters] = useState({
    search: '',
    assignee: '',
    initiator: '',
    type: '',
    client: '',
    status: 'COMPLETED'
  });

  const loadArchiveTasks = async () => {
    setLoading(true);
    try {
      const res = await fetchTasksApi({ 
        page: currentPage, 
        page_size: pageSize,
        ...filters
      });
      setData(res);
    } catch (err) {
      console.error("Ошибка загрузки архива:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArchiveTasks();
  }, [currentPage, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden font-sans">
      <TaskFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      <div className="flex-1 overflow-hidden mt-4">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Загрузка архива...</div>
        ) : (
          <TaskTable tasks={data.results} />
        )}
      </div>

      <Pagination 
        totalCount={data.count} 
        pageSize={pageSize} 
        currentPage={currentPage} 
        onPageChange={(page) => setCurrentPage(page)} 
      />
    </div>
  );
};