import React, { useState, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { createEpicApi, fetchProjectsListApi } from '../../../services/taskService';
import { fetchUsersListApi } from '../../../services/userService';

export const EpicForm = ({ onClose, onRefresh, initialProjectId }) => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'low',
    deadline: '',
    status: 'created',
    project_id: initialProjectId || '',
    assignee_id: '',
  });

  const isPredefined = !!initialProjectId;

  useEffect(() => {
    const loadRequiredData = async () => {
      try {
        const [projectsList, usersList] = await Promise.all([
          fetchProjectsListApi(),
          fetchUsersListApi({ is_active: 'true' })
        ]);
        setProjects(projectsList);
        setUsers(usersList);

        if (initialProjectId) {
          setFormData(prev => ({ ...prev, project_id: initialProjectId }));
        }
      } catch (err) {
        console.error("Ошибка при загрузке списков:", err);
      } finally {
        setDataLoading(false);
      }
    };
    loadRequiredData();
  }, [initialProjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project_id || !formData.assignee_id) {
      alert("Выберите проект и ответственного");
      return;
    }

    setLoading(true);
    try {
      await createEpicApi({
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        project_id: Number(formData.project_id),
        assignee_id: Number(formData.assignee_id)
      });
      onRefresh();
      onClose();
    } catch (err) {
      alert("Ошибка при создании эпика. Проверьте обязательные поля.");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) return <div className="p-10 text-center text-gray-400">Загрузка данных формы...</div>;

  return (
    <form className="flex flex-col gap-5 font-sans" onSubmit={handleSubmit}>
      
      {/* Название эпика */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-semibold text-gray-700">Название эпика</label>
        <input 
          required
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500" 
          placeholder="Например: Разработать модуль авторизации" 
        />
      </div>

      {/* Описание */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-semibold text-gray-700">Описание</label>
        <textarea 
          required
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-4 h-24 outline-none resize-none focus:border-blue-500" 
          placeholder="Подробности эпика..." 
        />
      </div>

      {/* Выбор ПРОЕКТА */}
      {!isPredefined && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-semibold text-gray-700">Проект</label>
          <div className={`relative ${initialProjectId ? 'opacity-60 pointer-events-none' : ''}`}>
            <select 
              required
              value={formData.project_id}
              onChange={(e) => setFormData({...formData, project_id: e.target.value})}
              className="w-full bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 outline-none appearance-none cursor-pointer"
            >
              <option value="">Выберите проект</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>
      )}
      
      {/* Выбор ОТВЕТСТВЕННОГО */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-semibold text-gray-700">Ответственный</label>
        <div className="relative">
          <select 
            required
            value={formData.assignee_id}
            onChange={(e) => setFormData({...formData, assignee_id: e.target.value})}
            className="w-full bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 outline-none appearance-none cursor-pointer"
          >
            <option value="">Назначьте ответственного</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        </div>
      </div>

      {/* Поле КОМАНДА (пока без функционала) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-semibold text-gray-700">Команда (необязательно)</label>
        <div className="relative opacity-60">
          <select disabled className="w-full bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 outline-none appearance-none">
            <option>Добавьте участников</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      {/* Приоритет и Дедлайн */}
      {/* <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-semibold text-gray-700">Приоритет</label>
          <select 
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: e.target.value})}
            className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 outline-none"
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-semibold text-gray-700">Дедлайн</label>
          <input 
            required
            type="datetime-local" 
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
            className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 outline-none" 
          />
        </div>
      </div> */}

      <div className="flex justify-end gap-3 mt-6 border-t pt-6">
        <button type="button" onClick={onClose} className="px-8 py-2.5 font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
          Отменить
        </button>
        <button type="submit" disabled={loading} className="bg-[#1677FF] text-white px-10 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:bg-blue-600 transition-all disabled:bg-blue-300">
          {loading && <Loader2 size={18} className="animate-spin" />}
          Добавить эпик
        </button>
      </div>
    </form>
  );
};