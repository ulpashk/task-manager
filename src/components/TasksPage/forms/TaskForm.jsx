import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Loader2, X, Check } from 'lucide-react';
import { createTaskApi, fetchProjectsListApi, fetchEpicsListApi } from '../../../services/taskService';
import { fetchUsersListApi } from '../../../services/userService';
import { fetchTagsListApi } from '../../../services/tagService';
import { fetchClientsApi } from '../../../services/clientService';

// Компонент для мульти-выбора
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
        className="min-h-[44px] bg-[#F9FAFB] border border-gray-200 rounded-lg px-3 py-2 flex flex-wrap gap-2 cursor-pointer items-center pr-10"
      >
        {selectedItems.length > 0 ? (
          selectedItems.map(item => (
            <span key={item.id} className="bg-blue-100 text-blue-700 text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
              {item.name || `${item.first_name} ${item.last_name}`}
              <X size={12} onClick={(e) => { e.stopPropagation(); onToggle(item.id); }} className="hover:text-red-500" />
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        )}
        <ChevronDown size={18} className="absolute right-3 top-[34px] text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute top-[100%] left-0 w-full bg-white border border-gray-100 shadow-xl rounded-xl z-[70] mt-1 max-h-48 overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-100">
          {options.map(opt => (
            <div 
              key={opt.id}
              onClick={() => onToggle(opt.id)}
              className="flex items-center justify-between px-3 py-2 hover:bg-blue-50 rounded-lg cursor-pointer text-sm transition-colors"
            >
              <span>{opt.name || `${opt.first_name} ${opt.last_name}`}</span>
              {selectedIds.includes(opt.id) && <Check size={16} className="text-blue-600" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const TaskForm = ({ onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [lists, setLists] = useState({
    projects: [], epics: [], users: [], tags: [], clients: []
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'low',
    deadline: '',
    status: 'created',
    project_id: '',
    epic_id: '',
    client_id: '',
    assignee_ids: [], // Массив для ID исполнителей
    tag_ids: []       // Массив для ID тегов
  });

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [projects, epics, users, tags, clients] = await Promise.all([
          fetchProjectsListApi(),
          fetchEpicsListApi(),
          fetchUsersListApi(),
          fetchTagsListApi(),
          fetchClientsApi({ page_size: 100 })
        ]);

        setLists({
          projects: projects || [],
          epics: epics || [],
          users: users || [],
          tags: tags || [],
          clients: clients?.results || []
        });
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };
    loadAllData();
  }, []);

  const toggleSelection = (field, id) => {
    setFormData(prev => {
      const current = prev[field];
      const isSelected = current.includes(id);
      return {
        ...prev,
        [field]: isSelected ? current.filter(item => item !== id) : [...current, id]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!formData.client_id || formData.assignee_ids.length === 0) {
    if (!formData.client_id) {
      // alert("Выберите компанию и хотя бы одного исполнителя");
      alert("Выберите компанию");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        project_id: formData.project_id ? Number(formData.project_id) : null,
        epic_id: formData.epic_id ? Number(formData.epic_id) : null,
        client_id: Number(formData.client_id),
        assignee_ids: formData.assignee_ids.map(id => Number(id)),
        tag_ids: formData.tag_ids.map(id => Number(id)),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      await createTaskApi(payload);
      onRefresh();
      onClose();
    } catch (err) {
      alert("Ошибка при создании задачи.");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) return <div className="p-10 text-center text-gray-400 font-sans flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18}/> Загрузка...</div>;

  return (
    <form className="flex flex-col gap-4 font-sans" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-bold text-gray-700">Тема задачи</label>
        <input name="title" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500" placeholder="Название задачи" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-bold text-gray-700">Описание</label>
        <textarea name="description" required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-3 h-20 outline-none resize-none focus:border-blue-500" placeholder="Подробное описание" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-gray-500">Проект</label>
          <select name="project_id" value={formData.project_id} onChange={(e) => setFormData({...formData, project_id: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-3 py-2.5 outline-none">
            <option value="">Выберите проект</option>
            {lists.projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-gray-500">Epic</label>
          <select name="epic_id" value={formData.epic_id} onChange={(e) => setFormData({...formData, epic_id: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-3 py-2.5 outline-none">
            <option value="">Выберите эпик</option>
            {lists.epics.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>
      </div>

      {/* МУЛЬТИ-СЕЛЕКТ ДЛЯ ИСПОЛНИТЕЛЕЙ */}
      <MultiSelect 
        label="Исполнители *" 
        options={lists.users} 
        selectedIds={formData.assignee_ids} 
        onToggle={(id) => toggleSelection('assignee_ids', id)}
        placeholder="Выберите исполнителей"
      />

      {/* КОМПАНИЯ (Одиночный выбор) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-bold text-gray-700">Компания *</label>
        <select name="client_id" required value={formData.client_id} onChange={(e) => setFormData({...formData, client_id: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500">
          <option value="">Выберите компанию</option>
          {lists.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* МУЛЬТИ-СЕЛЕКТ ДЛЯ ТЕГОВ */}
        <MultiSelect 
          label="Тэги" 
          options={lists.tags} 
          selectedIds={formData.tag_ids} 
          onToggle={(id) => toggleSelection('tag_ids', id)}
          placeholder="Выберите тэги"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-gray-700">Приоритет</label>
          <select name="priority" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-3 py-2.5 outline-none">
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-bold text-gray-700">Дедлайн</label>
        <input name="deadline" required type="datetime-local" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
        <button type="button" onClick={onClose} className="px-6 py-2 font-bold text-gray-400 hover:text-gray-600 transition-colors">Отменить</button>
        <button type="submit" disabled={loading} className="bg-[#1677FF] text-white px-10 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 flex items-center gap-2 transition-all hover:bg-blue-600">
          {loading && <Loader2 size={16} className="animate-spin" />}
          Добавить задачу
        </button>
      </div>
    </form>
  );
};