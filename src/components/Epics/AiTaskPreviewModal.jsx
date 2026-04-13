import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../general/Modal';
import { CheckCircle2, AlertCircle, Trash2, X, ChevronDown, Loader2 } from 'lucide-react';

export const AiTaskPreviewModal = ({ 
  isOpen, 
  onClose, 
  tasks: initialTasks, 
  warnings, 
  onConfirm, 
  loading,
  users = [],
  tags = []
}) => {
  const { t } = useTranslation();
  const [editableTasks, setEditableTasks] = useState([]);

  useEffect(() => {
    if (isOpen && initialTasks) {
      setEditableTasks(initialTasks.map(t => ({
        ...t,
        priority: t.priority?.toLowerCase() || 'medium',
        assignee_id: t.assignee_id || '',
        tag_ids: t.tag_ids || [],
        estimation: t.estimation || ''
      })));
    }
  }, [isOpen, initialTasks]);

  const handleUpdateTask = (index, field, value) => {
    const newTasks = [...editableTasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setEditableTasks(newTasks);
  };

  const handleDeleteTask = (index) => {
    setEditableTasks(editableTasks.filter((_, i) => i !== index));
  };

  const priorityOptions = [
    { value: 'critical', label: t('priority.critical') },
    { value: 'high', label: t('priority.high') },
    { value: 'medium', label: t('priority.medium') },
    { value: 'low', label: t('priority.low') },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('pipeline.title')}>
      <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
        
        {warnings?.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-700 text-sm">
            <AlertCircle size={20} className="flex-shrink-0" />
            <div>
              <p className="font-bold">{t('pipeline.validating')}:</p>
              <ul className="list-disc ml-4">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
            </div>
          </div>
        )}

        <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
          {editableTasks.map((task, idx) => (
            <div key={idx} className="relative p-6 border border-gray-200 bg-white rounded-2xl shadow-sm group hover:border-blue-200 transition-all">
              
              <button 
                onClick={() => handleDeleteTask(idx)}
                className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <X size={20} />
              </button>

              <span className="text-xs font-black text-gray-300 uppercase mb-4 block">Задача #{idx + 1}</span>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">{t('tasks.form_title')}*</label>
                  <input 
                    value={task.title}
                    onChange={(e) => handleUpdateTask(idx, 'title', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-400 outline-none text-[14px] font-medium transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">{t('tasks.form_description')}</label>
                  <textarea 
                    value={task.description}
                    onChange={(e) => handleUpdateTask(idx, 'description', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-400 outline-none text-[13px] leading-relaxed resize-none h-24 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">{t('tasks.form_priority')}</label>
                    <div className="relative">
                      <select 
                        value={task.priority}
                        onChange={(e) => handleUpdateTask(idx, 'priority', e.target.value)}
                        className="w-full appearance-none bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 cursor-pointer transition-all"
                      >
                        {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">{t('epics.form_assignee')}</label>
                    <div className="relative">
                      <select 
                        value={task.assignee_id}
                        onChange={(e) => handleUpdateTask(idx, 'assignee_id', e.target.value)}
                        className="w-full appearance-none bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 cursor-pointer transition-all"
                      >
                        {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">{t('tasks.tag')}</label>
                    <div className="relative">
                      <select 
                        value={task.tag_ids?.[0] || ''}
                        onChange={(e) => handleUpdateTask(idx, 'tag_ids', [Number(e.target.value)])}
                        className="w-full appearance-none bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 cursor-pointer transition-all"
                      >
                        {/* <option value="">Без тэга</option> */}
                        {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">{t('report.time')}</label>
                    <input 
                      type="number"
                      placeholder="h"
                      value={task.estimation}
                      onChange={(e) => handleUpdateTask(idx, 'estimation', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-400 text-sm transition-all"
                    />
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-4 border-t pt-6">
          <button onClick={onClose} className="px-6 py-2.5 font-bold text-gray-400 hover:text-gray-600 transition-all">
            {t('common.cancel')}
          </button>
          <button 
            onClick={() => onConfirm(editableTasks)}
            disabled={loading || editableTasks.length === 0}
            className="bg-[#1677FF] text-white px-10 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg disabled:bg-gray-200"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
            {t('common.create')} ({editableTasks.length})
          </button>
        </div>
      </div>
    </Modal>
  );
};