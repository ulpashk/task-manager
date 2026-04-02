import { useEffect, useState, useCallback } from 'react';
import { fetchTasksApi } from '../../services/taskService';
import { TaskFilters } from '../../components/TasksPage/TaskFilters';
import { TaskTabs } from '../../components/TasksPage/TaskTabs';
import { TaskTable } from '../../components/TasksPage/TaskTable';
import { CreateTaskWizard } from '../../components/TasksPage/CreateTaskWizard';
import { Pagination } from '../../components/general/Pagination';
import { fetchUsersListApi } from '../../services/userService';
import { fetchTagsListApi } from '../../services/tagService';

export const TasksTablePage = () => {
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    assignee: '',
    tags: '',
    deadline_from: '',
    deadline_to: '',
    ordering: '',
  });

  useEffect(() => {
    fetchUsersListApi().then(setUsers).catch(console.error);
    fetchTagsListApi().then(setTags).catch(console.error);
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchTasksApi({ 
        page: currentPage, 
        page_size: pageSize,
        ...filters
      });
      setData(res);
    } catch (err) {
      console.error("Ошибка загрузки задач:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleSearchChange = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (status) => {
    setFilters(prev => ({ ...prev, status }));
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden font-sans">
      <TaskFilters
        users={users}
        tags={tags}
        filters={filters}
        pageSize={pageSize}
        onSearchChange={handleSearchChange}
        onApply={handleApplyFilters}
        onPageSizeChange={handlePageSizeChange}
        onAddClick={() => setIsModalOpen(true)}
      />
      
      <TaskTabs 
        activeStatus={filters.status} 
        onStatusChange={handleStatusChange} 
      />
      
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Загрузка задач...</div>
        ) : (
          <TaskTable tasks={data.results} onSort={(field) => setFilters(p => ({...p, ordering: p.ordering === field ? `-${field}` : field}))} />
        )}
      </div>

      <Pagination 
        totalCount={data.count} 
        pageSize={pageSize} 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />

      <CreateTaskWizard  
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onRefresh={loadTasks}
      />
    </div>
  );
};