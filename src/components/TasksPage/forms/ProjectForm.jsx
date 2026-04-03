import React, { useState, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { createProjectApi } from '../../../services/taskService';
import { fetchUsersListApi } from '../../../services/userService';

export const ProjectForm = ({ onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '', 
    description: '', 
    assignee_id: '',
    start_date: '', 
    deadline: '', 
    status: 'created',
    priority: 'medium'
  });

  useEffect(() => {
    const loadRequiredData = async () => {
      try {
        const userList = await fetchUsersListApi({ is_active: 'true' });
        // const userList = await fetchUsersListApi();
        setUsers(userList || []);
      } catch (err) {
        console.error("Ошибка при загрузке списков руководителей:", err);
      } finally {
        setDataLoading(false);
      }
    };
    loadRequiredData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.assignee_id) {
      alert("Пожалуйста, выберите руководителя проекта");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        assignee_id: Number(formData.assignee_id),
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      await createProjectApi(payload);
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Ошибка при создании проекта. Проверьте правильность заполнения полей.");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-400 font-sans">
        <Loader2 className="animate-spin mr-2" size={20} />
        Загрузка списка пользователей...
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5 font-sans" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-bold text-gray-700">Название проекта</label>
        <input 
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-all" 
          placeholder="Например: Разработка системы управления" 
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-bold text-gray-700">Описание проекта</label>
        <textarea 
          required
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-4 h-32 outline-none resize-none focus:border-blue-500 transition-all" 
          placeholder="Подробное описание проекта..." 
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-bold text-gray-700">Руководитель</label>
        <div className="relative">
          <select 
            required
            value={formData.assignee_id}
            onChange={(e) => setFormData({...formData, assignee_id: e.target.value})}
            className="w-full bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 outline-none appearance-none cursor-pointer focus:border-blue-500"
          >
            <option value="">Выберите руководителя</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.first_name} {u.last_name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-bold text-gray-700">Команда</label>
        <div className="relative opacity-60">
          <select disabled className="w-full bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 outline-none appearance-none cursor-not-allowed">
            <option>Добавьте участников</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-bold text-gray-700">Дата начала</label>
          <input 
            required
            type="datetime-local" 
            value={formData.start_date}
            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
            className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500" 
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-bold text-gray-700">Дата окончания</label>
          <input 
            required
            type="datetime-local" 
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
            className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500" 
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 border-t pt-6">
        <button 
          type="button" 
          onClick={onClose} 
          className="px-8 py-2.5 font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors border border-transparent"
        >
          Отменить
        </button>
        <button 
          type="submit" 
          disabled={loading} 
          className="bg-[#1677FF] text-white px-10 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 disabled:bg-blue-300"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          Создать проект
        </button>
      </div>
    </form>
  );
};