import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  fetchTaskByIdApi, fetchTaskAttachmentsApi, 
  fetchTaskCommentsApi, fetchTasksApi, uploadAttachmentApi,
  deleteAttachmentApi, downloadAttachmentApi, changeTaskStatusApi 
} from '../../services/taskService';
import { 
  ChevronLeft, Star, Calendar, Users, Tag as TagIcon, 
  Building2, LayoutGrid, Layers, FileText, Trash2, 
  Pencil, Loader2, Paperclip, Plus, Link2
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { SubtaskForm } from '../../components/TasksPage/forms/SubtaskForm';
import { TaskComments } from '../../components/TasksPage/TaskComments';
import { TaskHistory } from '../../components/TasksPage/TaskHistory';
import { Modal } from '../../components/general/Modal';

export const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  
  const [task, setTask] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [activeTab, setActiveTab] = useState('subtasks');
  const [loading, setLoading] = useState(true);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [isAttachDeleteModalOpen, setIsAttachDeleteModalOpen] = useState(false);
  const [attachToDelete, setAttachToDelete] = useState(null);

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const isSubtask = !!task?.parent_task;
  const availableTabs = isSubtask 
    ? ['comments', 'history'] 
    : ['subtasks', 'comments', 'history'];
  
  useEffect(() => {
    if (isSubtask && activeTab === 'subtasks') {
      setActiveTab('comments');
    }
  }, [isSubtask]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setTask(null);
    try {
      const delay = (ms) => new Promise(res => setTimeout(res, ms));
      const [taskData, attachData, commentData, subtaskData] = await Promise.all([
        fetchTaskByIdApi(id),
        fetchTaskAttachmentsApi(id),
        fetchTaskCommentsApi(id),
        fetchTasksApi({ parent_task: id }), 
        delay(300)
      ]);
      setTask(taskData);
      setAttachments(attachData || []);
      setSubtasks(subtaskData.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
    if (pageRef.current) {
      pageRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [id, loadData]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert("Файл слишком большой. Максимальный размер 25 МБ.");
      return;
    }

    setUploading(true);
    try {
      await uploadAttachmentApi(id, file);
      const updatedAttachments = await fetchTaskAttachmentsApi(id);
      setAttachments(updatedAttachments);
    } catch (err) {
      console.error(err);
      alert("Ошибка при загрузке файла");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteAttachClick = (e, file) => {
    e.stopPropagation();
    setAttachToDelete(file);
    setIsAttachDeleteModalOpen(true);
  };

  const confirmAttachDelete = async () => {
    if (!attachToDelete) return;
    
    try {
      await deleteAttachmentApi(id, attachToDelete.id);
      setAttachments(prev => prev.filter(a => a.id !== attachToDelete.id));
      setIsAttachDeleteModalOpen(false);
      setAttachToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Не удалось удалить файл");
    }
  };

  const handleViewFile = async (attachmentId, filename) => {
    try {
      const blob = await downloadAttachmentApi(id, attachmentId);
      
      const fileURL = window.URL.createObjectURL(new Blob([blob], { type: blob.type }));

      const extension = filename.split('.').pop().toLowerCase();
      
      const viewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'txt'];

      if (viewableExtensions.includes(extension)) {
        const viewWindow = window.open(fileURL, '_blank');
        if (!viewWindow) {
          triggerDownload(fileURL, filename);
        }
      } else {
        triggerDownload(fileURL, filename);
      }
      setTimeout(() => window.URL.revokeObjectURL(fileURL), 10000);
      
    } catch (err) {
      console.error("Ошибка при открытии/скачивании файла:", err);
      alert("Ошибка при загрузке файла");
    }
  };

  const triggerDownload = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', name); 
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const refreshAttachments = useCallback(async () => {
    try {
      const updatedAttachments = await fetchTaskAttachmentsApi(id);
      setAttachments(updatedAttachments || []);
    } catch (err) {
      console.error("Ошибка при обновлении вложений:", err);
    }
  }, [id]);

  if (loading || !task) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#FAFAFA] font-sans">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-400 font-medium animate-pulse">Загрузка данных...</p>
      </div>
    );
  }

  const getStatusStyle = (status) => {
    if (status === 'completed' || status === 'done') return 'bg-green-50 text-green-500 border-green-100';
    if (status === 'TODO' || status === 'created') return 'bg-gray-100 text-gray-500 border-gray-200';
    if (status === 'IN_PROGRESS' || status === 'in_progress') return 'bg-yellow-50 text-yellow-500 border-yellow-100';
    if (status === 'revision') return 'bg-blue-50 text-blue-500 border-blue-100';
    if (status === 'waiting') return 'bg-blue-50 text-blue-500 border-blue-100';
    return 'bg-gray-50 text-gray-500 border-gray-100';
  };

  const getStatusLabel = (s) => {
    if (s === 'done' || s === 'completed' || s === 'COMPLETED') return 'Выполнено';
    if (s === 'todo' || s === 'Todo' || s === 'TODO' || s === 'created') return 'Создано';
    if (s === 'in_progress' || s === 'IN_PROGRESS') return 'В обработке';
    if (s === 'revision') return 'На доработке';
    if (s === 'waiting') return 'На проверке';
    return s;
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setLoading(true);
      await changeTaskStatusApi(id, newStatus, "Статус изменен пользователем");
      const updatedTask = await fetchTaskByIdApi(id);
      setTask(updatedTask);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.detail || "Ошибка при смене статуса";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const canStart = task?.status === 'created';
  const canFinish = task?.status === 'in_progress' || task?.status === 'revision';

  return (
    <div ref={pageRef} className="flex flex-col h-full bg-[#FAFAFA] overflow-y-auto custom-scrollbar font-sans p-4 pt-0 gap-6">

      <div className="flex flex-col gap-4">
        <button onClick={() => navigate('/tasks')} className="p-1 text-gray-400 hover:bg-gray-200 rounded-md w-fit transition-all">
          <ChevronLeft size={16}/>
        </button>

        {isSubtask && (
          <div className="flex items-center gap-2 -mb-2 animate-in fade-in slide-in-from-left-2">
            <Link2 size={16} className="text-blue-500" />
            <button 
              onClick={() => navigate(`/tasks/${task.parent_task.id}`)}
              className="text-[14px] font-medium text-blue-600 underline hover:text-blue-500 decoration-blue-300"
            >
              {task.parent_task.title}
            </button>
          </div>
        )}

        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">{isSubtask ? 'Тема подзадачи' : 'Тема задачи'}</span>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-lg text-[12px] font-bold uppercase border ${getStatusStyle(task.status)}`}>
                    {getStatusLabel(task.status)}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400">Дата создания: {format(new Date(task.created_at), 'd апреля yyyy г. HH:mm:ss', { locale: ru })}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleStatusUpdate('in_progress')}
              disabled={!canStart || loading}
              className={`px-6 py-2 rounded-lg font-bold text-[13px] transition-all shadow-md ${
                canStart 
                  ? 'bg-[#1677FF] text-white hover:bg-blue-600 shadow-blue-100' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Начать работу
            </button>
            <button 
              onClick={() => handleStatusUpdate('waiting')}
              disabled={!canFinish || loading}
              className={`px-6 py-2 rounded-lg font-bold text-[13px] transition-all border ${
                canFinish 
                  ? 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm' 
                  : 'bg-white text-gray-200 border-gray-100 cursor-not-allowed'
              }`}
            >
              Завершить
            </button>
          </div>
        </div>
      </div>

      {isSubtask ? (
        <div className="grid grid-cols-2 gap-6 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <Star size={18} className="text-gray-400" />
              <span className="text-[14px] text-gray-400 w-24">Приоритет:</span>
              <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold border ${task.priority === 'high' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                {task.priority === 'high' ? 'Высокий' : 'Низкий'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-gray-400" />
              <span className="text-[14px] text-gray-400 w-24">Дедлайн:</span>
              <span className="text-[14px] font-bold text-gray-800">
                {format(new Date(task.deadline), 'd MMMM yyyy г. HH:mm', { locale: ru })}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-start gap-3">
              <Users size={18} className="text-gray-400 mt-1" />
              <span className="text-[14px] text-gray-400 w-24">Исполнители:</span>
              <div className="flex flex-col gap-3">
                {task.assignees?.map(a => (
                  <div key={a.id} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                      {a.first_name[0]}
                    </div>
                    <span className="text-[14px] font-bold text-gray-700">{a.first_name} {a.last_name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TagIcon size={18} className="text-gray-400" />
              <span className="text-[14px] text-gray-400 w-24">Тэг:</span>
              <div className="flex gap-2">
                {task.tags?.map(t => (
                  <span key={t.id} className="px-2 py-0.5 bg-white text-purple-600 rounded-md border border-purple-200 text-[10px] font-bold">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <Star size={16} className="text-gray-400" />
              <span className="text-sm text-gray-400 w-24">Приоритет:</span>
              <span className="bg-red-50 text-red-500 border border-red-100 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase">
                {task.priority === 'high' ? 'Высокий' : 'Низкий'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-sm text-gray-400 w-24">Дедлайн:</span>
              <span className="text-sm font-bold text-gray-800">{format(new Date(task.deadline), 'd апреля yyyy г. HH:mm', { locale: ru })}</span>
            </div>
            <div className="flex items-start gap-3">
              <Users size={16} className="text-gray-400 mt-1" />
              <span className="text-sm text-gray-400 w-24">Исполнители:</span>
              <div className="flex flex-wrap gap-2">
                {task.assignees?.map(a => (
                  <div key={a.id} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
                      {a.first_name[0]}
                    </div>
                    <span className="text-sm font-bold text-gray-700">{a.first_name} {a.last_name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TagIcon size={16} className="text-gray-400" />
              <span className="text-sm text-gray-400 w-24">Тэг:</span>
              <div className="flex gap-2">
                {task.tags?.map(t => (
                  <span key={t.id} className="px-2 py-0.5 border border-purple-200 text-purple-600 rounded-md text-[10px] font-bold">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <Building2 size={16} className="text-gray-400" />
              <span className="text-sm text-gray-400 w-24">Компания:</span>
              <span className="text-sm font-bold text-gray-800 uppercase">{task.client?.name || '—'}</span>
            </div>
            <div className="flex items-center gap-3">
              <LayoutGrid size={16} className="text-gray-400" />
              <span className="text-sm text-gray-400 w-24">Проект:</span>
              <span className="text-sm font-medium text-gray-700">{task.epic?.project?.title || '—'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Layers size={16} className="text-gray-400" />
              <span className="text-sm text-gray-400 w-24">Эпик:</span>
              <span className="text-sm font-medium text-gray-700">{task.epic?.title || '—'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wider">
          <Pencil size={16} className="text-gray-400" /> Описание
        </h3>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 min-h-[120px] text-sm text-gray-700 leading-relaxed">
          {task.description || 'Нет описания'}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wider">
          <Paperclip size={16} className="text-gray-400" /> Вложения
        </h3>
        <div className="flex flex-wrap gap-4 items-center">
          {attachments.map(file => (
            <div 
              key={file.id} 
              onClick={() => handleViewFile(file.id, file.filename)}
              className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm group hover:border-blue-300 transition-all cursor-pointer"
            >
              <FileText size={18} className="text-green-500" />
              <span className="text-sm font-medium text-blue-600 underline">{file.filename}</span>
              <button
                 onClick={(e) => handleDeleteAttachClick(e, file)}
                className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors ml-2"
                title="Удалить файл"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={20} className="animate-spin text-blue-500" />
            ) : (
              <Plus size={20} className="text-gray-400" />
            )}
          </button>
          {attachments.length === 0 && <span className="text-gray-400 text-xs italic">Нет вложений</span>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden h-[600px] flex-shrink-0">
        <div className="flex px-8 border-b border-gray-50 bg-white">
          {availableTabs.map((t) => (
            <button 
              key={t}
              onClick={() => setActiveTab(t)}
              className={`py-4 px-6 text-sm font-bold transition-all relative capitalize ${activeTab === t ? 'text-blue-600' : 'text-gray-400'}`}
            >
              {t === 'subtasks' ? 'Подзадачи' : t === 'comments' ? 'Комментарий' : 'История'}
              {activeTab === t && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'subtasks' && !isSubtask && (
            <div className="p-8 space-y-4 overflow-y-auto">
              {subtasks.map(st => (
                <div 
                  key={st.id}
                  className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center cursor-pointer hover:border-blue-300 transition-all group"
                  onClick={() => navigate(`/tasks/${st.id}`)}
                >
                  <span className="font-bold text-gray-800 group-hover:text-blue-600">{st.title}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-white px-2 py-1 rounded border font-bold uppercase text-gray-400">{st.status}</span>
                    <ChevronLeft className="rotate-180 text-gray-300" size={16} />
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setIsSubtaskModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs"
              >
                + Добавить подзадачу
              </button>
            </div>
          )}

          {activeTab === 'comments' && <TaskComments taskId={id} onCommentAdded={refreshAttachments} />}

          {activeTab === 'history' && <TaskHistory taskId={id} />}
        </div>
      </div>

      <Modal 
        isOpen={isAttachDeleteModalOpen} 
        onClose={() => setIsAttachDeleteModalOpen(false)} 
        title="Удаление вложения"
      >
        <div className="flex flex-col gap-4 font-sans">
          <p className="text-gray-600">
            Вы уверены, что хотите удалить файл <span className="font-bold text-gray-800">"{attachToDelete?.filename}"</span>?
          </p>
          
          <div className="flex justify-end gap-3 mt-4">
            <button 
              onClick={() => setIsAttachDeleteModalOpen(false)}
              className="px-6 py-2 font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors border border-transparent"
            >
              Отмена
            </button>
            <button 
              onClick={confirmAttachDelete}
              className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100 flex items-center justify-center"
            >
              Удалить
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isSubtaskModalOpen} onClose={() => setIsSubtaskModalOpen(false)} title="Добавить подзадачу">
        <SubtaskForm onClose={() => setIsSubtaskModalOpen(false)} onRefresh={loadData} initialParentId={task.id} />
      </Modal>

    </div>
  );
};