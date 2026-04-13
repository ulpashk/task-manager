import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Loader2, X, Check, Plus, Trash2, FileText } from 'lucide-react';
import { createTaskApi, fetchTasksApi, fetchProjectsListApi, fetchEpicsListApi, fetchProjectEpicsApi, uploadAttachmentApi } from '../../../services/taskService';
import { fetchUsersListApi } from '../../../services/userService';
import { fetchTagsListApi } from '../../../services/tagService';
import { fetchClientsApi } from '../../../services/clientService';
import { SingleSelect } from '../../general/SingleSelect';

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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [epicsLoading, setEpicsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [filteredEpics, setFilteredEpics] = useState([]);

  const priorityOptions = [
    { id: 'low', title: t('priority.low') },
    { id: 'medium', title: t('priority.medium') },
    { id: 'high', title: t('priority.high') }
  ];

  const [lists, setLists] = useState({
    projects: [],
    epics: [],
    users: [],
    engineers: [],
    tags: [],
    clients: []
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
    assignee_ids: [],
    tag_ids: []
  });

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [projects, users, engineers, tags, clients] = await Promise.all([
          fetchProjectsListApi(),
          fetchUsersListApi({ is_active: 'true' }),
          fetchUsersListApi({ role: 'engineer', is_active: 'true' }),
          fetchTagsListApi(),
          fetchClientsApi({ page_size: 100 })
        ]);

        setLists({
          projects: projects || [],
          users: users || [],
          engineers: engineers || [],
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

  useEffect(() => {
    const loadEpics = async () => {
      if (formData.project_id) {
        setEpicsLoading(true);
        try {
          const epics = await fetchProjectEpicsApi(formData.project_id);
          setFilteredEpics(epics || []);
        } catch (err) {
          console.error("Error loading epics:", err);
          setFilteredEpics([]);
        } finally {
          setEpicsLoading(false);
        }
      } else {
        setFilteredEpics([]);
        setFormData(prev => ({ ...prev, epic_id: '' }));
      }
    };
    loadEpics();
  }, [formData.project_id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        alert(t('tasks.form_error_file_size'));
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.project_id && !formData.epic_id) {
      alert(t('tasks.form_error_epic'));
      return;
    }

    if (!formData.client_id || formData.assignee_ids.length === 0) {
      alert(t('tasks.form_error_required'));
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

      if (selectedFile) {
        const latestTasksResponse = await fetchTasksApi({
          page_size: 1,
          ordering: '-id'
        });

        const createdTask = latestTasksResponse.results[0];

        if (createdTask && createdTask.title === formData.title) {
          try {
            await uploadAttachmentApi(createdTask.id, selectedFile);
          } catch (fileErr) {
            console.error("Error uploading file:", fileErr);
          }
        } else {
          console.error("Could not find created task ID for file upload");
        }
      }

      onRefresh();
      onClose();
    } catch (err) {
      console.error("Error:", err);
      alert(t('tasks.form_error_create'));
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (field, id) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(id) ? prev[field].filter(i => i !== id) : [...prev[field], id]
    }));
  };

  if (dataLoading) return <div className="p-10 text-center text-gray-400 font-sans flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18}/> {t('common.loading')}</div>;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-bold text-gray-700">{t('tasks.form_title')}</label>
        <input name="title" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500" placeholder={t('tasks.form_title_placeholder')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-bold text-gray-700">{t('tasks.form_description')}</label>
        <textarea name="description" required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-3 h-20 outline-none resize-none focus:border-blue-500" placeholder={t('tasks.form_description_placeholder')} />
      </div>

     <div className="grid grid-cols-2 gap-4">
      <SingleSelect
        label={t('tasks.form_project')}
        options={lists.projects}
        selectedId={formData.project_id}
        onSelect={(id) => setFormData({...formData, project_id: id, epic_id: ''})}
        placeholder="(Не указано)"
      />

      <SingleSelect
        label={`${t('tasks.form_epic')} ${formData.project_id ? '*' : ''}`}
        options={filteredEpics}
        selectedId={formData.epic_id}
        onSelect={(id) => setFormData({...formData, epic_id: id})}
        disabled={!formData.project_id}
        isLoading={epicsLoading}
        placeholder={formData.project_id ? t('tasks.form_epic') : t('tasks.form_epic_select_project')}
      />
    </div>

      <div className="grid grid-cols-2 gap-4">
        <MultiSelect
          label={t('tasks.form_tags')}
          options={lists.tags}
          selectedIds={formData.tag_ids}
          onToggle={(id) => toggleSelection('tag_ids', id)}
          placeholder={t('tasks.form_tags_placeholder')}
        />

        <SingleSelect
          label={t('tasks.form_priority')}
          options={priorityOptions}
          selectedId={formData.priority}
          onSelect={(val) => setFormData({...formData, priority: val})}
          placeholder={t('tasks.form_priority')}
        />
      </div>

      <MultiSelect
        label={`${t('tasks.form_assignees')} *`}
        options={lists.engineers}
        selectedIds={formData.assignee_ids}
        onToggle={(id) => toggleSelection('assignee_ids', id)}
        placeholder={t('tasks.form_assignees_placeholder')}
      />

      <SingleSelect
        label={`${t('tasks.form_company')} *`}
        options={lists.clients}
        selectedId={formData.client_id}
        onSelect={(id) => setFormData({...formData, client_id: id})}
        placeholder={t('tasks.form_company_placeholder')}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-bold text-gray-700">{t('tasks.form_deadline')}</label>
        <input name="deadline" required type="datetime-local" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-[#F9FAFB] border border-gray-200 rounded-lg animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-3 overflow-hidden">
            <FileText size={18} className="text-gray-400 flex-shrink-0" />
            <span className="text-sm text-blue-600 font-medium truncate">
              {selectedFile.name}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="p-1 hover:bg-gray-200 rounded-md text-gray-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {!selectedFile && (
        <div
          onClick={() => fileInputRef.current.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-400 hover:bg-gray-50 hover:border-blue-300 cursor-pointer transition-all group"
        >
          <Plus size={20} className="group-hover:text-blue-500" />
          <span className="text-sm font-bold group-hover:text-blue-500">{t('tasks.form_attachment')}</span>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
        <button type="button" onClick={onClose} className="px-6 py-2 font-bold text-gray-400 hover:text-gray-600 transition-colors text-sm">{t('common.cancel')}</button>
        <button type="submit" disabled={loading} className="bg-[#1677FF] text-white px-10 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 flex items-center gap-2 hover:bg-blue-600 transition-all">
          {loading ? <Loader2 size={16} className="animate-spin" /> : t('common.add')}
        </button>
      </div>
    </form>
  );
};
