import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';
import { updateTaskApi, fetchProjectsListApi, fetchEpicsListApi } from '../../services/taskService';
import { formatDateTime, toInputDateTime } from '../../utils/formatters';
import { fetchUsersListApi } from '../../services/userService';
import { fetchTagsListApi } from '../../services/tagService';
import { fetchClientsApi } from '../../services/clientService';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const EditTaskModal = ({ isOpen, onClose, task, onRefresh }) => {
  const { t } = useTranslation();

  const FIELD_LABELS = {
    title: t('tasks.edit_field_topic'),
    description: t('tasks.edit_field_description'),
    priority: t('tasks.edit_field_priority'),
    deadline: t('tasks.edit_field_deadline'),
    client_id: t('tasks.edit_field_company'),
    project_id: t('tasks.project'),
    epic_id: t('tasks.epic'),
    assignee_ids: t('tasks.assignees'),
    tag_ids: t('tasks.form_tags')
  };

  const PRIORITY_LABELS = {
    low: t('priority.low'),
    medium: t('priority.medium'),
    high: t('priority.high')
  };

  const [step, setStep] = useState('edit');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [finalChanges, setFinalChanges] = useState([]);

  const [lists, setLists] = useState({ projects: [], epics: [], users: [], tags: [], clients: [] });
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [p, e, u, tg, c] = await Promise.all([
            fetchProjectsListApi(), fetchEpicsListApi(), fetchUsersListApi(),
            fetchTagsListApi(), fetchClientsApi({ page_size: 100 })
          ]);
          setLists({ projects: p, epics: e, users: u, tags: tg, clients: c.results });
        } finally { setDataLoading(false); }
      };
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'low',
        deadline: toInputDateTime(task.deadline),
        client_id: task.client?.id || '',
        project_id: task.project?.id || '',
        epic_id: task.epic?.id || '',
        assignee_ids: task.assignees?.map(a => a.id) || [],
        tag_ids: task.tags?.map(tg => tg.id) || []
      });
      setStep('edit');
    }
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  const getDisplayValue = (key, value) => {
    if (!value || value === '') return '';

    if (key === 'deadline') {
      try {
        return format(new Date(value), 'dd.MM.yyyy HH:mm', { locale: ru });
      } catch (e) {
        return value;
      }
    }

    if (key === 'priority') return PRIORITY_LABELS[value] || value;

    if (key === 'client_id') {
      const item = lists.clients.find(c => String(c.id) === String(value));
      return item ? item.name : value;
    }

    if (key === 'project_id') {
      const item = lists.projects.find(p => String(p.id) === String(value));
      return item ? item.title : value;
    }

    if (key === 'epic_id') {
      const item = lists.epics.find(e => String(e.id) === String(value));
      return item ? item.title : value;
    }

    return value;
  };

  const getChanges = () => {
    const changes = [];
    if (!task) return changes;

    const fieldsToCompare = ['title', 'description', 'priority', 'client_id', 'project_id', 'epic_id', 'deadline'];

    fieldsToCompare.forEach(key => {
      let originalValue = key.includes('_id') ? task[key.replace('_id', '')]?.id : task[key];
      let currentValue = formData[key];

      if (key === 'deadline') {
        const fmt = 'yyyy-MM-dd HH:mm';
        const originalDate = originalValue ? format(new Date(originalValue), fmt) : '';
        const currentSelection = currentValue ? format(new Date(currentValue), fmt) : '';

        if (originalDate !== currentSelection) {
          changes.push({
            key,
            label: FIELD_LABELS[key],
            oldValue: getDisplayValue(key, originalValue),
            newValue: getDisplayValue(key, currentValue)
          });
        }
        return;
      }

      if (String(currentValue || '') !== String(originalValue || '')) {
        changes.push({
          key,
          label: FIELD_LABELS[key],
          oldValue: getDisplayValue(key, originalValue),
          newValue: getDisplayValue(key, currentValue)
        });
      }
    });

    const arrayFields = ['assignee_ids', 'tag_ids'];
    arrayFields.forEach(key => {
      const originalIds = (key === 'assignee_ids' ? task.assignees : task.tags)?.map(i => i.id) || [];
      if (JSON.stringify([...originalIds].sort()) !== JSON.stringify([...formData[key]].sort())) {
        changes.push({
          key,
          label: FIELD_LABELS[key],
          oldValue: `${originalIds.length}`,
          newValue: `${formData[key].length}`
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
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        project_id: formData.project_id || null,
        epic_id: formData.epic_id || null
      };
      await updateTaskApi(task.id, payload);
      setStep('success');
      onRefresh();
    } catch (err) {
      alert(t('common.error'));
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
            {step === 'edit' ? t('tasks.edit_title') : t('tasks.edit_confirm')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>

        <div className="p-8">
          {dataLoading ? (
            <div className="py-20 text-center text-gray-400"><Loader2 className="animate-spin inline mr-2"/> {t('tasks.edit_loading')}</div>
          ) : (
            <>
              {step === 'edit' && (
                <form onSubmit={handleSaveClick} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('tasks.edit_field_topic')}</label>
                    <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('tasks.edit_field_description')}</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-3 h-24 outline-none resize-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">{t('tasks.edit_field_company')}</label>
                      <select value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-3 py-2 outline-none">
                        {lists.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">{t('tasks.edit_field_priority')}</label>
                      <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-3 py-2 outline-none">
                        <option value="low">{t('priority.low')}</option>
                        <option value="medium">{t('priority.medium')}</option>
                        <option value="high">{t('priority.high')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('tasks.edit_field_deadline')}</label>
                    <input type="datetime-local" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 font-bold text-gray-400">{t('common.cancel')}</button>
                    <button type="submit" className="bg-[#1677FF] text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-blue-100">{t('common.save')}</button>
                  </div>
                </form>
              )}

              {step === 'confirm' && (
                <div className="flex flex-col gap-6">
                  <div className="space-y-3">
                    {finalChanges.map(f => (
                      <div key={f.key} className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-sm">
                        <span className="font-bold">{f.label}:</span> &laquo;{f.oldValue}&raquo; &rarr; <span className="text-blue-600 font-bold">&laquo;{f.newValue}&raquo;</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3 border-t pt-6">
                    <button onClick={() => setStep('edit')} className="px-6 py-2 font-bold text-gray-500">{t('common.back')}</button>
                    <button onClick={handleConfirmUpdate} disabled={loading} className="bg-[#1677FF] text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2">
                      {loading && <Loader2 size={16} className="animate-spin"/>} {t('common.confirm')}
                    </button>
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="flex flex-col items-center py-4 gap-4">
                  <CheckCircle2 size={48} className="text-[#52C41A]" />
                  <h3 className="text-lg font-bold text-gray-800">{t('tasks.edit_success')}</h3>
                  <button onClick={onClose} className="bg-[#1677FF] text-white px-12 py-2 rounded-lg font-bold mt-2">{t('common.ok')}</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
