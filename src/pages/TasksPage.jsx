import { useEffect, useState } from 'react';
import { fetchTasksApi } from '../services/taskService';
import { TaskFilters } from '../components/TasksPage/TaskFilters';
import { TaskTabs } from '../components/TasksPage/TaskTabs';
import { TaskTable } from '../components/TasksPage/TaskTable';
import { AddTaskModal } from '../components/TasksPage/AddTaskModal';
import { Pagination } from '../components/general/Pagination';

export const TasksTablePage = () => {
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    assignee: '',
    initiator: '',
    type: '',
    client: '', 
  });

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await fetchTasksApi({ 
        page: currentPage, 
        page_size: pageSize,
        search: filters.search,
        status: filters.status,
        assignee: filters.assignee,
        initiator: filters.initiator,
        type: filters.type,
        client: filters.client,
      });
      setData(res);
    } catch (err) {
      console.error("Ошибка загрузки задач:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
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
        onAddClick={() => setIsModalOpen(true)}
      />
      <TaskTabs 
        activeStatus={filters.status} 
        onStatusChange={(status) => handleFilterChange('status', status)} 
      />
      
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Загрузка задач...</div>
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

      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onRefresh={loadTasks}
      />
    </div>
  );
};