import { useEffect, useState, useCallback  } from 'react';
import { fetchTasksApi, deleteTaskApi } from '../services/taskService';
import { TaskFilters } from '../components/TasksPage/TaskFilters';
import { KanbanColumn } from '../components/Kanban/KanbanColumn';
import { EditTaskModal } from '../components/TasksPage/EditTaskModal';
import { Modal } from '../components/general/Modal';
import { fetchUsersListApi } from '../services/userService';
import { fetchTagsListApi } from '../services/tagService';

const COLUMNS = [
  { id: 'created', title: 'Создано', headerBg: 'bg-gray-200', columnBg: 'bg-gray-50/50', textColor: 'text-gray-600' },
  { id: 'in_progress', title: 'В обработке', headerBg: 'bg-[#FFF2E0]', columnBg: 'bg-[#FFF9F2]', textColor: 'text-[#C78E39]' },
  { id: 'waiting', title: 'На проверке', headerBg: 'bg-[#E6F4FF]', columnBg: 'bg-[#F0F7FF]', textColor: 'text-[#6E6EAD]' },
  { id: 'revision', title: 'На доработке', headerBg: 'bg-[#F0F0FF]', columnBg: 'bg-[#F7F7FF]', textColor: 'text-[#6E6EAD]' },
  { id: 'done', title: 'Выполнено', headerBg: 'bg-[#E1F9E6]', columnBg: 'bg-[#F2FBF4]', textColor: 'text-[#56AD6C]' },
];

export const KanbanPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    assignee: '',
    tags: '',
    deadline_from: '',
    deadline_to: '',
  });

  useEffect(() => {
    fetchUsersListApi().then(setUsers).catch(console.error);
    fetchTagsListApi().then(setTags).catch(console.error);
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTasksApi({ 
        page_size: 100, 
        ...filters
      });
      setTasks(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleSearchChange = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleEditRequest = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleDeleteRequest = (task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTaskApi(selectedTask.id);
      setIsDeleteModalOpen(false);
      loadTasks();
    } catch (err) { alert("Ошибка при удалении"); }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
      <TaskFilters 
        users={users}
        tags={tags}
        filters={filters}
        onSearchChange={handleSearchChange}
        onApply={handleApplyFilters}
        pageSize={100}
        onPageSizeChange={() => {}} 
        onAddClick={() => {}} 
      />

      <div className="flex-1 overflow-x-auto p-6 flex gap-4 bg-gray-50/50">
        {loading ? (
          <div className="w-full text-center py-10 text-gray-400">Загрузка...</div>
        ) : (
          COLUMNS.map(col => (
            <KanbanColumn 
              key={col.id}
              column={col}
              tasks={tasks.filter(t => t.status?.toLowerCase() === col.id.toLowerCase())}
              onEditRequest={handleEditRequest}
              onDeleteRequest={handleDeleteRequest}
            />
          ))
        )}
      </div>
      
      <EditTaskModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={selectedTask}
        onRefresh={loadTasks}
      />

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Удаление задачи">
        <div className="flex flex-col gap-4">
          <p className="text-gray-600">Вы уверены, что хотите удалить задачу <span className="font-bold">"{selectedTask?.title}"</span>?</p>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 font-bold text-gray-400">Отмена</button>
            <button onClick={handleConfirmDelete} className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold">Удалить</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};