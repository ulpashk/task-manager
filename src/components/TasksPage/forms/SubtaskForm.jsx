import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Loader2, X, Check, Plus } from 'lucide-react';
import { createTaskApi, fetchTasksListApi } from '../../../services/taskService';
import { fetchUsersListApi } from '../../../services/userService';

const MultiSelect = ({ label, options, selectedIds, onToggle, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedItems = options.filter(opt => selectedIds.includes(opt.id));

  return (
    <div className="flex flex-col gap-1.5 relative" ref={containerRef}>
      <label className="text-[13px] font-bold text-gray-700">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[44px] bg-[#F9FAFB] border border-gray-200 rounded-lg px-3 py-2 flex flex-wrap gap-2 cursor-pointer items-center pr-10 transition-all focus-within:border-blue-500"
      >
        {selectedItems.length > 0 ? (
          selectedItems.map(item => (
            <span key={item.id} className="bg-blue-100 text-blue-700 text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
              {item.first_name} {item.last_name}
              <X size={12} onClick={(e) => { e.stopPropagation(); onToggle(item.id); }} className="hover:text-red-500" />
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        )}
        <ChevronDown size={18} className="absolute right-3 top-[36px] text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute top-[100%] left-0 w-full bg-white border border-gray-100 shadow-xl rounded-xl z-[70] mt-1 max-h-48 overflow-y-auto p-1">
          {options.map(opt => (
            <div 
              key={opt.id}
              onClick={() => onToggle(opt.id)}
              className="flex items-center justify-between px-3 py-2 hover:bg-blue-50 rounded-lg cursor-pointer text-sm"
            >
              <span>{opt.first_name} {opt.last_name}</span>
              {selectedIds.includes(opt.id) && <Check size={16} className="text-blue-600" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const SubtaskForm = ({ onClose, onRefresh, initialParentId }) => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [parentTasks, setParentTasks] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    parent_task_id: initialParentId || '',
    assignee_ids: [],
    deadline: '',
    status: 'created'
  });

  const isPredefined = !!initialParentId;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersList, tasksList] = await Promise.all([
          fetchUsersListApi(),
          fetchTasksListApi()
        ]);
        setUsers(usersList || []);
        setParentTasks(tasksList || []);
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleAssignee = (id) => {
    setFormData(prev => ({
      ...prev,
      assignee_ids: prev.assignee_ids.includes(id) 
        ? prev.assignee_ids.filter(aId => aId !== id) 
        : [...prev.assignee_ids, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.parent_task_id) {
      alert("Необходимо выбрать основную задачу");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        parent_task_id: Number(formData.parent_task_id),
        assignee_ids: formData.assignee_ids.map(id => Number(id)),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      await createTaskApi(payload);
      onRefresh();
      onClose();
    } catch (err) {
      alert("Ошибка при создании подзадачи.");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) return <div className="p-10 text-center text-gray-400 font-sans flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18}/> Загрузка...</div>;

  return (
    <form className="flex flex-col gap-5 font-sans" onSubmit={handleSubmit}>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-bold text-gray-700">Тема подзадачи</label>
        <input 
          required 
          value={formData.title} 
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500" 
          placeholder="Например: Разработать эпика для дипломки" 
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-bold text-gray-700">Описание</label>
        <textarea 
          required 
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-4 h-24 outline-none resize-none focus:border-blue-500" 
          placeholder="Опишите подробно подзадачу" 
        />
      </div>

      {/* Выбор РОДИТЕЛЬСКОЙ ЗАДАЧИ */}
      {!isPredefined && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-bold text-gray-700">Задача</label>
          <div className="relative">
            <select 
              required
              value={formData.parent_task_id}
              onChange={(e) => setFormData({...formData, parent_task_id: e.target.value})}
              className="w-full bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 outline-none appearance-none cursor-pointer focus:border-blue-500"
            >
              <option value="">Выберите основную задачу</option>
              {parentTasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>
      )}

      {/* МУЛЬТИ-СЕЛЕКТ ИСПОЛНИТЕЛЕЙ */}
      <MultiSelect 
        label="Исполнители"
        options={users}
        selectedIds={formData.assignee_ids}
        onToggle={toggleAssignee}
        placeholder="Назначьте исполнителей"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-bold text-gray-700">Дедлайн</label>
        <input 
          required 
          type="datetime-local" 
          value={formData.deadline} 
          onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500" 
        />
      </div>

      <div className="flex justify-end gap-3 mt-6 border-t pt-6">
        <button type="button" onClick={onClose} className="px-8 py-2.5 font-bold text-gray-400 hover:text-gray-600 transition-colors">Отменить</button>
        <button 
          type="submit" 
          disabled={loading} 
          className="bg-[#1677FF] text-white px-10 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 flex items-center gap-2 hover:bg-blue-600 transition-all disabled:bg-blue-300"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          Добавить подзадачу
        </button>
      </div>
    </form>
  );
};