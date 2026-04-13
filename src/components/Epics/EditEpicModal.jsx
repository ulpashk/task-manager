import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../general/Modal';
import { updateEpicApi, fetchEpicByIdApi } from '../../services/projectService';
import { fetchUsersListApi } from '../../services/userService';
import { formatDateTime, toInputDateTime } from '../../utils/formatters';
import { X, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';

export const EditEpicModal = ({ isOpen, onClose, epic, onRefresh }) => {
  const { t } = useTranslation();

  const FIELD_LABELS = {
    title: t('epics.form_title'),
    description: t('epics.form_description'),
    priority: t('tasks.form_priority'),
    deadline: t('projects.form_deadline'),
    assignee_id: t('epics.form_assignee')
  };

  const PRIORITY_LABELS = {
    low: t('priority.low'),
    medium: t('priority.medium'),
    high: t('priority.high')
  };
  const [step, setStep] = useState('edit');
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false); // Новый лоадер для деталей
  const [fullEpicData, setFullEpicData] = useState(null); 
  const [users, setUsers] = useState([]);
  const [finalChanges, setFinalChanges] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', priority: '', deadline: '', assignee_id: '' });

  const getDisplayValue = (key, value) => {
    if (!value || value === '' || value === '—') return '—';
    if (key === 'priority') return PRIORITY_LABELS[value] || value;
    if (key === 'assignee_id') {
      const user = users.find(u => String(u.id) === String(value));
      return user ? `${user.first_name} ${user.last_name}` : value;
    }
    return value;
  };

  useEffect(() => {
    if (isOpen && epic?.id) {
      const loadFullData = async () => {
        setDetailLoading(true);
        try {
          const [usersList, fullEpic] = await Promise.all([
            fetchUsersListApi({ is_active: 'true' }),
            fetchEpicByIdApi(epic.id)
          ]);
          
          setUsers(usersList);
          setFullEpicData(fullEpic);
          setFormData({
            title: fullEpic.title || '',
            description: fullEpic.description || '',
            priority: fullEpic.priority || 'low',
            deadline: toInputDateTime(fullEpic.deadline),
            assignee_id: fullEpic.assignee?.id || ''
          });
          setStep('edit');
        } catch (err) {
          console.error("Ошибка загрузки деталей эпика:", err);
        } finally {
          setDetailLoading(false);
        }
      };
      loadFullData();
    }
  }, [isOpen, epic?.id]);

  if (!isOpen || !epic) return null;

  const getChanges = () => {
    const changes = [];
    if (!fullEpicData) return changes;

    const fields = ['title', 'description', 'priority', 'assignee_id', 'deadline'];
    fields.forEach(key => {
      let originalValue = key === 'assignee_id' ? fullEpicData.assignee?.id : fullEpicData[key];
      let currentValue = formData[key];

      if (key === 'deadline') {
        const origFmt = formatDateTime(originalValue);
        const currFmt = formatDateTime(currentValue);
        if (origFmt !== currFmt) {
          changes.push({
            key,
            label: FIELD_LABELS[key],
            oldValue: origFmt,
            newValue: currFmt
          });
        }
        return;
      }
      
      const oldStr = String(originalValue || '').trim();
      const newStr = String(currentValue || '').trim();

      if (newStr !== oldStr) {
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

  const handleSave = (e) => {
    e.preventDefault();
    const diff = getChanges();
    if (diff.length > 0) { setFinalChanges(diff); setStep('confirm'); }
    else onClose();
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await updateEpicApi(epic.id, {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        assignee_id: Number(formData.assignee_id)
      });
      setStep('success');
      onRefresh();
    } catch (err) { alert(t('common.error')); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={step === 'edit' ? t('epics.edit_title') : t('projects.edit_confirm')}>
      {step === 'edit' && (
        <form onSubmit={handleSave} className="flex flex-col gap-4 font-sans">
          <div className="flex flex-col gap-1"><label className="text-xs font-bold text-gray-400 uppercase">{t('epics.form_title')}</label>
          <input className="bg-gray-50 border p-2.5 rounded-lg outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-bold text-gray-400 uppercase">{t('epics.form_description')}</label>
          <textarea className="bg-gray-50 border p-2.5 rounded-lg h-24 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1"><label className="text-xs font-bold text-gray-400 uppercase">{t('tasks.form_priority')}</label>
            <select className="bg-gray-50 border p-2.5 rounded-lg" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}><option value="low">{t('priority.low')}</option><option value="medium">{t('priority.medium')}</option><option value="high">{t('priority.high')}</option></select></div>
            <div className="flex flex-col gap-1"><label className="text-xs font-bold text-gray-400 uppercase">{t('epics.form_assignee')}</label>
            <select className="bg-gray-50 border p-2.5 rounded-lg" value={formData.assignee_id} onChange={e => setFormData({...formData, assignee_id: e.target.value})}><option value="">{t('projects.form_manager_placeholder')}</option>{users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}</select></div>
          </div>
          <div className="flex flex-col gap-1"><label className="text-xs font-bold text-gray-400 uppercase">{t('projects.form_deadline')}</label>
          <input type="datetime-local" className="bg-gray-50 border p-2.5 rounded-lg" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} /></div>
          <div className="flex justify-end gap-3 mt-4 border-t pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 font-bold text-gray-400">{t('common.cancel')}</button>
            <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold">{t('common.save')}</button>
          </div>
        </form>
      )}
      {step === 'confirm' && (
        <div className="flex flex-col gap-4">
          {finalChanges.map(f => <div key={f.key} className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm"><b>{f.label}:</b> {f.oldValue} → <span className="text-blue-600 font-bold">{f.newValue}</span></div>)}
          <div className="flex justify-end gap-3 mt-4"><button onClick={() => setStep('edit')} className="px-6 py-2 font-bold text-gray-400">{t('common.back')}</button>
          <button onClick={handleConfirm} disabled={loading} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2">{loading && <Loader2 size={16} className="animate-spin"/>} {t('common.edit')}</button></div>
        </div>
      )}
      {step === 'success' && (
        <div className="flex flex-col items-center py-6 gap-4"><CheckCircle2 size={56} className="text-green-500" /><h3 className="text-lg font-bold">{t('projects.edit_success')}</h3>
        <button onClick={onClose} className="bg-blue-600 text-white px-12 py-2 rounded-lg font-bold mt-4">{t('common.ok')}</button></div>
      )}
    </Modal>
  );
};