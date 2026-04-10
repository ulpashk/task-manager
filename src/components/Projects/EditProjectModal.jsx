import React, { useState, useEffect } from 'react';
import { X, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';
import { updateProjectApi } from '../../services/projectService';
import { fetchUsersListApi } from '../../services/userService';
import { formatDateTime, toInputDateTime } from '../../utils/formatters';

const FIELD_LABELS = {
  title: 'Название проекта',
  description: 'Описание проекта',
  priority: 'Приоритет',
  start_date: 'Дата начала',
  deadline: 'Дата окончания',
  assignee_id: 'Руководитель'
};

const PRIORITY_LABELS = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий'
};

export const EditProjectModal = ({ isOpen, onClose, project, onRefresh }) => {
  const [step, setStep] = useState('edit');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [finalChanges, setFinalChanges] = useState([]);
  
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'medium',
    start_date: '', deadline: '', assignee_id: ''
  });

  // Загрузка списка пользователей (руководителей)
  useEffect(() => {
    if (isOpen) {
      setDataLoading(true);
      fetchUsersListApi({ is_active: 'true' })
        .then(data => setUsers(data || []))
        .finally(() => setDataLoading(false));
    }
  }, [isOpen]);

  // Инициализация данных при открытии
  useEffect(() => {
    if (isOpen && project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        priority: project.priority || 'medium',
        start_date: toInputDateTime(project.start_date),
        deadline: toInputDateTime(project.deadline),
        assignee_id: project.assignee?.id || ''
      });
      setStep('edit');
      setFinalChanges([]);
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const getDisplayValue = (key, value) => {
    if (!value || value === '') return 'не указано';
    if (key === 'start_date' || key === 'deadline') return formatDateTime(value);
    if (key === 'priority') return PRIORITY_LABELS[value] || value;
    if (key === 'assignee_id') {
      const user = users.find(u => String(u.id) === String(value));
      return user ? `${user.first_name} ${user.last_name}` : value;
    }
    return value;
  };

  const getChanges = () => {
    const changes = [];
    const fields = ['title', 'description', 'priority', 'assignee_id', 'start_date', 'deadline'];

    fields.forEach(key => {
      let originalValue = key === 'assignee_id' ? project.assignee?.id : project[key];
      let currentValue = formData[key];

      // Сравнение дат до минут
      if (key === 'start_date' || key === 'deadline') {
        const origFmt = formatDateTime(originalValue);
        const currFmt = formatDateTime(currentValue);
        if (origFmt !== currFmt) {
          changes.push({ key, label: FIELD_LABELS[key], oldValue: origFmt, newValue: currFmt });
        }
        return;
      }

      // Сравнение остальных полей
      if (String(currentValue || '') !== String(originalValue || '')) {
        changes.push({
          key,
          label: FIELD_LABELS[key],
          oldValue: getDisplayValue(key, originalValue),
          newValue: getDisplayValue(key, currentValue)
        });
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
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        assignee_id: Number(formData.assignee_id)
      };
      await updateProjectApi(project.id, payload);
      setStep('success');
      onRefresh();
    } catch (err) {
      alert("Ошибка при обновлении проекта");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans">
      <div className={`bg-white rounded-[20px] shadow-2xl transition-all duration-300 overflow-hidden ${step === 'edit' ? 'max-w-[560px]' : 'max-w-[480px]'} w-full`}>
        
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
          <h2 className="text-[20px] font-bold text-gray-800">
            {step === 'edit' ? 'Изменить данные проекта' : 'Подтверждение'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>

        <div className="p-8">
          {dataLoading ? (
            <div className="py-20 text-center text-gray-400"><Loader2 className="animate-spin inline mr-2"/> Загрузка...</div>
          ) : (
            <>
              {step === 'edit' && (
                <form onSubmit={handleSaveClick} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Название проекта</label>
                    <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all" />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Описание</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-xl p-4 h-32 outline-none resize-none focus:border-blue-500" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Руководитель</label>
                    <div className="relative">
                      <select required value={formData.assignee_id} onChange={e => setFormData({...formData, assignee_id: e.target.value})} className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3 outline-none appearance-none cursor-pointer">
                        <option value="">Выберите руководителя</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Дата начала</label>
                      <input type="datetime-local" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Дата окончания</label>
                      <input type="datetime-local" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4 border-t pt-6">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 font-bold text-gray-400">Отменить</button>
                    <button type="submit" disabled={getChanges().length === 0} className="bg-[#1677FF] text-white px-10 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-100 disabled:bg-gray-200">Сохранить</button>
                  </div>
                </form>
              )}

              {step === 'confirm' && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                  <div className="space-y-3">
                    {finalChanges.map(f => (
                      <div key={f.key} className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-sm">
                        <span className="font-bold text-gray-700">{f.label}:</span> 
                        <span className="mx-2 text-gray-400 italic">«{f.oldValue}»</span> 
                        <span className="text-blue-600 font-bold">→ «{f.newValue}»</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3 border-t pt-6">
                    <button onClick={() => setStep('edit')} className="px-6 py-2 font-bold text-gray-500">Назад</button>
                    <button onClick={handleConfirmUpdate} disabled={loading} className="bg-[#1677FF] text-white px-8 py-2.5 rounded-lg font-bold flex items-center gap-2">
                      {loading && <Loader2 size={16} className="animate-spin"/>} Изменить
                    </button>
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="flex flex-col items-center py-6 gap-4">
                  <CheckCircle2 size={56} className="text-[#52C41A]" />
                  <h3 className="text-lg font-bold text-gray-800">Проект обновлен!</h3>
                  <button onClick={onClose} className="bg-[#1677FF] text-white px-12 py-2.5 rounded-lg font-bold mt-2">Ок</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};