import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  fetchTaskByIdApi, fetchTaskAttachmentsApi, 
  fetchTaskCommentsApi, addTaskCommentApi, fetchTasksApi 
} from '../../services/taskService';
import { 
  ChevronLeft, Star, Calendar, Users, Tag as TagIcon, 
  Building2, LayoutGrid, Layers, FileText, Trash2, 
  Pencil, Loader2, Paperclip, Bold, Underline, Link2 
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { SubtaskForm } from '../../components/TasksPage/forms/SubtaskForm';
import { Modal } from '../../components/general/Modal';

export const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const commentsEndRef = useRef(null);
  
  const [task, setTask] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [comments, setComments] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('subtasks');
  const [loading, setLoading] = useState(true);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [taskData, attachData, commentData, subtaskData] = await Promise.all([
        fetchTaskByIdApi(id),
        fetchTaskAttachmentsApi(id),
        fetchTaskCommentsApi(id),
        fetchTasksApi({ parent_task: id })
      ]);
      setTask(taskData);
      setAttachments(attachData || []);
      setComments(commentData || []);
      setSubtasks(subtaskData.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addTaskCommentApi(id, newComment);
      setNewComment('');
      const updatedComments = await fetchTaskCommentsApi(id);
      setComments(updatedComments);
    } catch (err) { alert("Ошибка при отправке"); }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline mr-2"/> Загрузка...</div>;
  if (!task) return <div className="p-10 text-center text-red-500">Задача не найдена</div>;

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] overflow-y-auto custom-scrollbar font-sans p-8 gap-6 pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4">
        <button onClick={() => navigate('/tasks')} className="p-1 text-gray-400 hover:bg-gray-200 rounded-md w-fit transition-all">
          <ChevronLeft size={28}/>
        </button>

        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Тема задачи</span>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
              <span className="bg-gray-200/50 text-gray-500 px-3 py-1 rounded-lg text-[12px] font-bold">
                {task.status === 'created' ? 'Создано' : task.status}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Дата создания: {format(new Date(task.created_at), 'd апреля yyyy г. HH:mm:ss', { locale: ru })}</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-[#1677FF] text-white px-6 py-2 rounded-lg font-bold text-[13px] hover:bg-blue-600 shadow-md">Начать работу</button>
            <button className="bg-white text-gray-300 border border-gray-100 px-6 py-2 rounded-lg font-bold text-[13px] cursor-not-allowed">Завершить</button>
          </div>
        </div>
      </div>

      {/* --- INFO BOX (Grid 2 columns) --- */}
      <div className="grid grid-cols-2 gap-6 flex-shrink-0">
        {/* Левая часть */}
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

        {/* Правая часть */}
        <div className="bg-[#F9FAFB]/50 p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <Building2 size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400 w-24">Компания:</span>
            <span className="text-sm font-bold text-gray-800 uppercase">{task.client?.name || '—'}</span>
          </div>
          <div className="flex items-center gap-3">
            <LayoutGrid size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400 w-24">Проект:</span>
            <span className="text-sm font-medium text-gray-700">{task.project?.title || '—'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Layers size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400 w-24">Эпик:</span>
            <span className="text-sm font-medium text-gray-700">{task.epic?.title || '—'}</span>
          </div>
        </div>
      </div>

      {/* --- DESCRIPTION --- */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wider">
          <Pencil size={16} className="text-gray-400" /> Описание
        </h3>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 min-h-[120px] text-sm text-gray-700 leading-relaxed">
          {task.description || 'Нет описания'}
        </div>
      </div>

      {/* --- ATTACHMENTS --- */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wider">
          <Paperclip size={16} className="text-gray-400" /> Вложения
        </h3>
        <div className="flex flex-wrap gap-4">
          {attachments.map(file => (
            <div key={file.id} className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm group hover:border-blue-300 transition-all cursor-pointer">
              <FileText size={18} className="text-green-500" />
              <span className="text-sm font-medium text-blue-600">{file.filename}</span>
              <Trash2 size={14} className="text-gray-300 hover:text-red-500 ml-2" />
            </div>
          ))}
          {attachments.length === 0 && <span className="text-gray-400 text-xs italic">Нет вложений</span>}
        </div>
      </div>

      {/* --- TABS SECTION --- */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden h-[600px] flex-shrink-0">
        <div className="flex px-8 border-b border-gray-50 bg-white">
          {['subtasks', 'comments', 'history'].map((t) => (
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
          {activeTab === 'subtasks' && (
            <div className="p-8 space-y-4 overflow-y-auto">
              {subtasks.map(st => (
                <div key={st.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-gray-800">{st.title}</span>
                  <span className="text-xs bg-white px-2 py-1 rounded border">{st.status}</span>
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

          {activeTab === 'comments' && (
            <div className="flex flex-col h-full">
              
              {/* ЧАСТЬ 1: СПИСОК КОММЕНТАРИЕВ (Теперь имеет свой скролл) */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6 bg-white">
                {comments.length > 0 ? (
                  [...comments].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(comment => (
                    <div key={comment.id} className="flex gap-4 animate-in fade-in duration-300">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
                        {comment.author?.first_name?.[0] || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-800 text-[14px]">
                            {comment.author?.first_name} {comment.author?.last_name}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="text-[11px] text-gray-400">
                              {format(new Date(comment.created_at), 'dd.MM.yyyy HH:mm')}
                            </span>
                            <button className="text-gray-300 hover:text-gray-600"><Pencil size={14}/></button>
                            <button className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                          </div>
                        </div>
                        <p className="text-[14px] text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    Комментариев пока нет
                  </div>
                )}
                <div ref={commentsEndRef} />
              </div>

              {/* ЧАСТЬ 2: ПОЛЕ ВВОДА (Всегда зафиксировано внизу контейнера) */}
              <div className="p-8 border-t border-gray-50 flex-shrink-0 bg-white">
                <h4 className="text-sm font-bold text-gray-800 mb-3">Ваш комментарий</h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-400 transition-all shadow-sm">
                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Введите текст комментария..."
                    className="w-full h-24 p-4 text-sm outline-none resize-none"
                  />
                  <div className="bg-[#F9FAFB] px-4 py-3 flex items-center justify-between border-t border-gray-50">
                    <div className="flex items-center gap-4 text-gray-400">
                       <Paperclip size={18} className="hover:text-blue-500 cursor-pointer" />
                       <Bold size={18} className="hover:text-blue-500 cursor-pointer" />
                       <Underline size={18} className="hover:text-blue-500 cursor-pointer" />
                    </div>
                    <button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="bg-[#1677FF] text-white px-6 py-2 rounded-lg font-bold text-xs hover:bg-blue-600 disabled:bg-gray-200 transition-all shadow-md"
                    >
                      Добавить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
           
          {activeTab === 'history' && (
            <div className="p-8 text-gray-400 text-center">
              История изменений пока пуста
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      <Modal isOpen={isSubtaskModalOpen} onClose={() => setIsSubtaskModalOpen(false)} title="Добавить подзадачу">
        <SubtaskForm onClose={() => setIsSubtaskModalOpen(false)} onRefresh={loadData} initialParentId={task.id} />
      </Modal>
    </div>
  );
};