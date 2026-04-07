import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, Paperclip, Bold, Underline, Loader2 } from 'lucide-react';
import { 
  fetchTaskCommentsApi, addTaskCommentApi, 
  updateTaskCommentApi, deleteTaskCommentApi 
} from '../../services/taskService';
import { Modal } from '../general/Modal';
import { ActionMenu } from './ActionMenu'; 

export const TaskComments = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const commentsEndRef = useRef(null);

  const loadComments = async () => {
    try {
      const data = await fetchTaskCommentsApi(taskId);
      setComments([...data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
    } finally { setLoading(false); }
  };

  useEffect(() => { loadComments(); }, [taskId]);

  // useEffect(() => {
  //   commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [comments]);

  const scrollContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (comments.length > 0) {
      setTimeout(scrollToBottom, 0);
    }
  }, [comments.length]);

  const handleAdd = async () => {
    if (!newComment.trim()) return;
    await addTaskCommentApi(taskId, newComment);
    setNewComment('');
    loadComments();
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditValue(comment.content);
  };

  const handleUpdate = async (commentId) => {
    if (!editValue.trim()) return;
    try {
      await updateTaskCommentApi(taskId, commentId, editValue);
      setEditingId(null);
      loadComments();
    } catch (e) { alert("Ошибка при обновлении"); }
  };

  const handleDeleteClick = (comment) => {
    setCommentToDelete(comment);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteTaskCommentApi(taskId, commentToDelete.id);
      setIsDeleteModalOpen(false);
      loadComments();
    } catch (e) { alert("Ошибка при удалении"); }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Загрузка комментариев...</div>;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 1. Список комментариев со скроллом */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-white">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-4 group">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
              {comment.author?.first_name?.[0]}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-800 text-[14px]">
                  {comment.author?.first_name} {comment.author?.last_name}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-gray-400">
                    {format(new Date(comment.created_at), 'dd.MM.yyyy HH:mm')}
                  </span>
                  {/* Кнопки появляются при наведении на блок комментария */}
                  {/* <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(comment)} className="text-gray-300 hover:text-blue-500"><Pencil size={14}/></button>
                    <button onClick={() => handleDeleteClick(comment)} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                  </div> */}
                  <ActionMenu 
                    onEdit={() => startEdit(comment)} 
                    onDelete={() => handleDeleteClick(comment)}
                  />
                </div>
              </div>
              
              {editingId === comment.id ? (
                <div className="mt-2 animate-in fade-in duration-200">
                  <textarea 
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full p-3 border border-blue-400 rounded-xl text-sm outline-none shadow-sm min-h-[80px] focus:ring-2 focus:ring-blue-50"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setEditingId(null)} className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50">Отменить</button>
                    <button onClick={() => handleUpdate(comment.id)} className="px-4 py-1.5 bg-[#1677FF] text-white rounded-lg text-xs font-bold hover:bg-blue-600">Редактировать</button>
                  </div>
                </div>
              ) : (
                <p className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Поле ввода нового комментария */}
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
              onClick={handleAdd}
              disabled={!newComment.trim()}
              className="bg-[#1677FF] text-white px-6 py-2 rounded-lg font-bold text-xs hover:bg-blue-600 disabled:bg-gray-200 transition-all"
            >
              Добавить
            </button>
          </div>
        </div>
      </div>

      {/* Модалка подтверждения удаления */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Удалить комментарий">
        <div className="flex flex-col gap-4 p-2">
          <p className="text-gray-600 text-sm">Вы уверены, что хотите удалить этот комментарий? Это действие нельзя отменить.</p>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 border rounded-lg font-bold text-gray-400">Отмена</button>
            <button onClick={confirmDelete} className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold">Удалить</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};