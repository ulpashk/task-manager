import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';
import { updateTaskApi, fetchProjectsListApi, fetchEpicsListApi } from '../../services/taskService';
// import { fetchProjectsListApi } from '../../services/projectService';
// import { fetchEpicsListApi } from '../../services/epicService';
import { fetchUsersListApi } from '../../services/userService';
import { fetchTagsListApi } from '../../services/tagService';
import { fetchClientsApi } from '../../services/clientService';

const FIELD_LABELS = {
  title: 'Тема задачи',
  description: 'Описание',
  priority: 'Приоритет',
  deadline: 'Дедлайн',
  client_id: 'Компания',
  project_id: 'Проект',
  epic_id: 'Эпик',
  assignee_ids: 'Исполнители',
  tag_ids: 'Тэги'
};

export const EditTaskModal = ({ isOpen, onClose, task, onRefresh }) => {
  const [step, setStep] = useState('edit'); // edit | confirm | success
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [finalChanges, setFinalChanges] = useState([]);
  
  const [lists, setLists] = useState({ projects: [], epics: [], users: [], tags: [], clients: [] });
  const [formData, setFormData] = useState({});

  // Загрузка справочников
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [p, e, u, t, c] = await Promise.all([
            fetchProjectsListApi(), fetchEpicsListApi(), fetchUsersListApi(),
            fetchTagsListApi(), fetchClientsApi({ page_size: 100 })
          ]);
          setLists({ projects: p, epics: e, users: u, tags: t, clients: c.results });
        } finally { setDataLoading(false); }
      };
      loadData();
    }
  }, [isOpen]);

  // Инициализация данных задачи
  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'low',
        deadline: task.deadline ? task.deadline.slice(0, 16) : '',
        client_id: task.client?.id || '',
        project_id: task.project?.id || '',
        epic_id: task.epic?.id || '',
        assignee_ids: task.assignees?.map(a => a.id) || [],
        tag_ids: task.tags?.map(t => t.id) || []
      });
      setStep('edit');
    }
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  // Логика определения изменений
  const getChanges = () => {
    const changes = [];
    
    // Сравнение простых полей
    const simpleFields = ['title', 'description', 'priority', 'client_id', 'project_id', 'epic_id'];
    simpleFields.forEach(key => {
      const originalValue = key.includes('_id') ? task[key.replace('_id', '')]?.id : task[key];
      if (String(formData[key]) !== String(originalValue || '')) {
        changes.push({ key, label: FIELD_LABELS[key], oldValue: originalValue || 'не указано', newValue: formData[key] });
      }
    });

    // Сравнение массивов (Исполнители и Теги)
    const arrayFields = ['assignee_ids', 'tag_ids'];
    arrayFields.forEach(key => {
      const originalIds = (key === 'assignee_ids' ? task.assignees : task.tags)?.map(i => i.id) || [];
      if (JSON.stringify([...originalIds].sort()) !== JSON.stringify([...formData[key]].sort())) {
        changes.push({ key, label: FIELD_LABELS[key], oldValue: `Кол-во: ${originalIds.length}`, newValue: `Кол-во: ${formData[key].length}` });
      }
    });

    return changes;
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    const diff = getChanges();
    if (diff.length > 0) {
      setFinalChanges(diff);
      setStep('confirm');
    } else {
      onClose();
    }
  };

  const handleConfirmUpdate = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        project_id: formData.project_id || null,
        epic_id: formData.epic_id || null
      };
      await updateTaskApi(task.id, payload);
      setStep('success');
      onRefresh();
    } catch (err) {
      alert("Ошибка при обновлении");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans text-sans">
      <div className={`bg-white rounded-[20px] shadow-2xl transition-all duration-300 overflow-hidden ${step === 'edit' ? 'max-w-[560px]' : 'max-w-[480px]'} w-full`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
          <h2 className="text-[20px] font-bold text-gray-800">
            {step === 'edit' ? 'Редактировать задачу' : 'Подтверждение'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>

        <div className="p-8">
          {dataLoading ? (
            <div className="py-20 text-center text-gray-400"><Loader2 className="animate-spin inline mr-2"/> Загрузка данных...</div>
          ) : (
            <>
              {/* ШАГ 1: ФОРМА */}
              {step === 'edit' && (
                <form onSubmit={handleSaveClick} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Тема</label>
                    <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500" />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Описание</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-3 h-24 outline-none resize-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Компания</label>
                      <select value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-3 py-2 outline-none">
                        {lists.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Приоритет</label>
                      <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-3 py-2 outline-none">
                        <option value="low">Низкий</option>
                        <option value="medium">Средний</option>
                        <option value="high">Высокий</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Дедлайн</label>
                    <input type="datetime-local" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 font-bold text-gray-400">Отменить</button>
                    <button type="submit" className="bg-[#1677FF] text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-blue-100">Сохранить</button>
                  </div>
                </form>
              )}

              {/* ШАГ 2: ПОДТВЕРЖДЕНИЕ */}
              {step === 'confirm' && (
                <div className="flex flex-col gap-6">
                  <div className="space-y-3">
                    {finalChanges.map(f => (
                      <div key={f.key} className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-sm">
                        <span className="font-bold">{f.label}:</span> «{f.oldValue}» → <span className="text-blue-600 font-bold">«{f.newValue}»</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3 border-t pt-6">
                    <button onClick={() => setStep('edit')} className="px-6 py-2 font-bold text-gray-500">Назад</button>
                    <button onClick={handleConfirmUpdate} disabled={loading} className="bg-[#1677FF] text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2">
                      {loading && <Loader2 size={16} className="animate-spin"/>} Изменить
                    </button>
                  </div>
                </div>
              )}

              {/* ШАГ 3: УСПЕХ */}
              {step === 'success' && (
                <div className="flex flex-col items-center py-4 gap-4">
                  <CheckCircle2 size={48} className="text-[#52C41A]" />
                  <h3 className="text-lg font-bold text-gray-800">Задача успешно обновлена!</h3>
                  <button onClick={onClose} className="bg-[#1677FF] text-white px-12 py-2 rounded-lg font-bold mt-2">Ок</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};