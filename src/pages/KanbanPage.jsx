import { useEffect, useState, useCallback  } from 'react';
import { fetchTasksApi } from '../services/taskService';
import { TaskFilters } from '../components/TasksPage/TaskFilters';
import { KanbanColumn } from '../components/Kanban/KanbanColumn';
import { fetchUsersListApi } from '../services/userService';
import { fetchTagsListApi } from '../services/tagService';

const COLUMNS = [
  { id: 'created', title: 'Не начато', headerBg: 'bg-gray-200', columnBg: 'bg-gray-50/50', textColor: 'text-gray-600' },
  { id: 'in_progress', title: 'В обработке', headerBg: 'bg-[#FFF2E0]', columnBg: 'bg-[#FFF9F2]', textColor: 'text-[#C78E39]' },
  { id: 'revision', title: 'На доработке', headerBg: 'bg-[#F0F0FF]', columnBg: 'bg-[#F7F7FF]', textColor: 'text-[#6E6EAD]' },
  { id: 'completed', title: 'Выполнено', headerBg: 'bg-[#E1F9E6]', columnBg: 'bg-[#F2FBF4]', textColor: 'text-[#56AD6C]' },
  // { id: 'todo', title: 'В плане', headerBg: 'bg-[#FFF2E0]', columnBg: 'bg-[#FFF9F2]', textColor: 'text-[#C78E39]' }
];

export const KanbanPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    assignee: '',
    tags: '', // строка "1,2,3"
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
      <TaskFilters 
        users={users}
        tags={tags}
        filters={filters}
        onSearchChange={handleSearchChange}
        onApply={handleApplyFilters}
        // Эти пропсы можно оставить пустыми или дефолтными для канбана
        pageSize={100}
        onPageSizeChange={() => {}} 
        onAddClick={() => {}} 
      />

      {/* <div className="flex-1 overflow-x-auto p-6 pt-2">
        {tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            Задач пока нет
          </div>
        ) : (
          <div className="flex gap-6 h-full min-w-max lg:min-w-full">
            {COLUMNS.map(col => {
              const columnTasks = tasks.filter(t => t.status?.toLowerCase() === col.id.toLowerCase());
              
              return (
                <KanbanColumn 
                  key={col.id} 
                  column={col} 
                  tasks={columnTasks} 
                />
              );
            })}
          </div>
        )}
      </div> */}
      <div className="flex-1 overflow-x-auto p-6 flex gap-4 bg-gray-50/50">
        {loading ? (
          <div className="w-full text-center py-10 text-gray-400">Загрузка...</div>
        ) : (
          COLUMNS.map(col => (
            <KanbanColumn 
              key={col.id}
              column={col}
              tasks={tasks.filter(t => t.status?.toLowerCase() === col.id.toLowerCase())}
            />
          ))
        )}
      </div>
    </div>
  );
};