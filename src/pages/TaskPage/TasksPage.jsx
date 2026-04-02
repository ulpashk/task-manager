import { useEffect, useState, useCallback } from 'react';
import { fetchTasksApi, deleteTaskApi } from '../../services/taskService';
import { TaskFilters } from '../../components/TasksPage/TaskFilters';
import { TaskTabs } from '../../components/TasksPage/TaskTabs';
import { TaskTable } from '../../components/TasksPage/TaskTable';
import { CreateTaskWizard } from '../../components/TasksPage/CreateTaskWizard';
import { Pagination } from '../../components/general/Pagination';
import { Modal } from '../../components/general/Modal';
import { fetchUsersListApi } from '../../services/userService';
import { fetchTagsListApi } from '../../services/tagService';

export const TasksTablePage = () => {
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  
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

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteTaskApi(taskToDelete.id);
      setIsDeleteModalOpen(false);
      loadTasks();
    } catch (err) {
      alert("Ошибка при удалении задачи");
    }
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
          <TaskTable 
            tasks={data.results} 
            // onSort={(field) => setFilters(p => ({...p, ordering: p.ordering === field ? `-${field}` : field}))}
            onDeleteRequest={handleDeleteClick}
          />
        )}
      </div>

      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Удаление задачи"
      >
        <div className="flex flex-col gap-4 font-sans">
          <p className="text-gray-600">
            Вы уверены, что хотите удалить задачу <span className="font-bold text-gray-800">"{taskToDelete?.title}"</span>? Это действие нельзя будет отменить.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-6 py-2 font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button 
              onClick={confirmDelete}
              className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100"
            >
              Удалить
            </button>
          </div>
        </div>
      </Modal>

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