import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTaskByIdApi, fetchTaskAttachmentsApi, fetchTaskCommentsApi, addTaskCommentApi } from '../../services/taskService';
import { ArrowLeft, Calendar, User, Paperclip, MessageSquare, Bold, Italic, Underline, Link2, Trash2, Pencil, Loader2, FileText, ChevronLeft } from 'lucide-react';
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
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('comments');
  const [loading, setLoading] = useState(true);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);

  const InfoRow = ({ label, children }) => (
    <div className="flex items-center gap-4 py-1">
      <span className="text-[14px] text-gray-400 w-28 flex-shrink-0">{label}</span>
      <div className="text-[14px] text-gray-800 font-medium">{children}</div>
    </div>
  );

  const loadData = useCallback(async () => {
    try {
      const [taskData, attachData, commentData] = await Promise.all([
        fetchTaskByIdApi(id),
        fetchTaskAttachmentsApi(id),
        fetchTaskCommentsApi(id)
      ]);
      setTask(taskData);
      setAttachments(attachData);
      setComments(commentData);
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
    } catch (err) { alert("Ошибка при отправке комментария"); }
  };

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === 'comments' && comments.length > 0) {
      scrollToBottom();
    }
  }, [comments, activeTab]);

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline mr-2"/> Загрузка...</div>;
  if (!task) return <div className="p-10 text-center text-red-500">Задача не найдена</div>;

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] overflow-y-auto custom-scrollbar font-sans p-8 gap-6 pb-20">
      <div className="flex flex-col gap-4">
        <button onClick={() => navigate('/tasks')} className="p-1 text-gray-600 hover:bg-gray-200 rounded-md w-fit transition-all">
          <ChevronLeft size={24}/>
        </button>

        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-bold text-gray-800">Тема задачи</span>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold border ${task.priority === 'high' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                {task.priority === 'high' ? 'Высокий' : 'Низкий'}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Дата создания: {format(new Date(task.created_at), 'd апреля yyyy г. HH:mm:ss', { locale: ru })}</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-[#1677FF] text-white px-6 py-2 rounded-lg font-bold text-[13px] hover:bg-blue-600 shadow-md">Начать работу</button>
            <button className="bg-white text-gray-300 border border-gray-200 px-6 py-2 rounded-lg font-bold text-[13px] cursor-not-allowed">Завершить задачу</button>
          </div>
        </div>
        <div className="mt-2">
           <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-[12px] font-medium">Не начато</span>
        </div>
      </div>

      {/* --- ИНФОРМАЦИОННЫЙ БЛОК (В БЕЛОЙ РАМКЕ) --- */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-1 flex-shrink-0">
        <InfoRow label="Компания:">
          <span className="uppercase">{task.client?.name || '—'}</span>
        </InfoRow>
        <InfoRow label="Проект:">
          <span className="text-gray-900 font-bold">{task.project?.title || 'Система управления задачами и обращениями для IT-аутсорсинговых команд'}</span>
        </InfoRow>
        <InfoRow label="Эпик:">
          <span className="text-gray-900 font-bold">{task.epic?.title || 'Интеграция с Телеграм'}</span>
        </InfoRow>
        <div className="flex items-center gap-4 py-1">
          <span className="text-[14px] text-gray-400 w-28 flex-shrink-0">Тэг:</span>
          <div className="flex gap-2">
            {task.tags?.length > 0 ? task.tags.map(t => (
              <span key={t.id} className="px-2 py-0.5 bg-white text-purple-600 rounded-md border border-purple-200 text-[10px] font-bold">
                {t.name}
              </span>
            )) : <span className="text-gray-300">—</span>}
          </div>
        </div>
        <InfoRow label="Дедлайн:">
          <span className="font-bold">{format(new Date(task.deadline), 'd MMMM yyyy г. HH:mm', { locale: ru })}</span>
        </InfoRow>
        <div className="flex items-center gap-4 py-1">
          <span className="text-[14px] text-gray-400 w-28 flex-shrink-0">Исполнитель:</span>
          <div className="flex items-center gap-2">
             {task.assignees?.map(a => (
               <div key={a.id} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
                    {a.first_name[0]}
                  </div>
                  <span className="font-bold">{a.first_name} {a.last_name}</span>
               </div>
             ))}
          </div>
        </div>
        <InfoRow label="Инициатор:">
          <span className="font-bold">Утешова Рая</span>
        </InfoRow>

        <button 
          onClick={() => setIsSubtaskModalOpen(true)}
          className="mt-6 bg-[#1677FF] text-white px-4 py-2 rounded-lg font-bold text-[12px] w-fit hover:bg-blue-600 transition-all shadow-sm"
        >
          Добавить подзадачу
        </button>
      </div>

      {/* --- СЕКЦИЯ ОПИСАНИЯ --- */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest px-1">Описание</h3>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8">
            <p className="text-[14px] text-gray-800 leading-[1.8]">
              {task.description || 'Контрагент инициировал процесс заключения договора на проведение Банковской экспертизы...'}
            </p>
          </div>
          
          {/* Toolbar & Attachments Area */}
          <div className="border-t border-gray-100">
            <div className="px-6 py-3 flex items-center gap-6 border-b border-gray-50">
               <button className="text-gray-600 hover:text-blue-600"><Paperclip size={18}/></button>
               <div className="w-px h-4 bg-gray-200"></div>
               <button className="text-sm font-bold text-gray-600 hover:text-gray-900">B</button>
               <button className="text-sm italic text-gray-600 hover:text-gray-900 font-serif">I</button>
               <button className="text-sm underline text-gray-600 hover:text-gray-900">U</button>
               <button className="text-gray-600 hover:text-blue-600"><Link2 size={18}/></button>
            </div>
            <div className="p-6 flex flex-wrap gap-3">
               {attachments.map(file => (
                 <div key={file.id} className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-200 transition-colors cursor-pointer group">
                   <FileText size={16} className="text-gray-400 group-hover:text-blue-500" />
                   <span className="text-[12px] font-medium text-blue-600 underline">{file.filename}</span>
                   <Trash2 size={14} className="text-gray-300 hover:text-red-500" />
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Добавляем фиксированную высоту (например, h-[700px]) и убираем min-h */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden h-[600px] flex-shrink-0">
        
        {/* Шапка табов (Фиксированная) */}
        <div className="flex px-8 border-b border-gray-50 flex-shrink-0 bg-white">
          <button 
            onClick={() => setActiveTab('comments')}
            className={`py-4 px-4 text-sm font-bold transition-all relative ${activeTab === 'comments' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            Комментарий
            {activeTab === 'comments' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`py-4 px-4 text-sm font-bold transition-all relative ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            История
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />}
          </button>
        </div>

        {/* Контент табов (Занимает все оставшееся место) */}
        <div className="flex-1 flex flex-col min-h-0">
          {activeTab === 'comments' ? (
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
          ) : (
            <div className="p-8 text-gray-400 text-center">
              История изменений пока пуста
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isSubtaskModalOpen} onClose={() => setIsSubtaskModalOpen(false)} title="Добавить подзадачу">
        <SubtaskForm 
          onClose={() => setIsSubtaskModalOpen(false)} 
          onRefresh={loadData}
          initialParentId={task.id}
        />
      </Modal>
    </div>
  );
};