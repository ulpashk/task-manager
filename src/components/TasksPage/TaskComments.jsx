import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Paperclip, Bold, Underline, X, FileText, MessageSquare } from 'lucide-react';
import {
  fetchTaskCommentsApi, addTaskCommentApi,
  updateTaskCommentApi, deleteTaskCommentApi, downloadAttachmentApi
} from '../../services/taskService';
import { fetchUsersListApi } from '../../services/userService';
import { Modal } from '../general/Modal';
import { ActionMenu } from './ActionMenu';

const ProtectedImage = React.memo(({ attachment, taskId }) => {
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadImg = async () => {
      try {
        const blob = await downloadAttachmentApi(taskId, attachment.id);
        if (isMounted) {
          setImgSrc(URL.createObjectURL(blob));
        }
      } catch (e) {
        console.error("Error loading comment image", e);
      }
    };
    loadImg();
    return () => {
      isMounted = false;
      if (imgSrc) URL.revokeObjectURL(imgSrc);
    };
  }, [attachment.id, taskId]);

  if (!imgSrc) return <div className="w-full h-32 bg-gray-100 animate-pulse rounded-xl" />;

  return (
    <img
      src={imgSrc}
      alt={attachment.filename}
      className="rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:opacity-90 transition-all max-h-64 object-cover"
      onClick={() => {
        window.open(imgSrc, '_blank');
      }}
    />
  );
});

export const TaskComments = ({ taskId, onCommentAdded }) => {
  const { t } = useTranslation();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const [allUsers, setAllUsers] = useState([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPos, setCursorPos] = useState(0);

  const scrollContainerRef = useRef(null);

  const triggerDownload = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', name);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleViewFile = useCallback(async (attachmentId, filename) => {
    try {
      const blob = await downloadAttachmentApi(taskId, attachmentId);

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
      console.error("Error opening file:", err);
      alert(t('common.error'));
    }
  }, [taskId, t]);

  const loadComments = async () => {
    try {
      const data = await fetchTaskCommentsApi(taskId);
      setComments([...data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [commentsData, usersData] = await Promise.all([
          fetchTaskCommentsApi(taskId),
          fetchUsersListApi({ is_active: 'true', page_size: 100 })
        ]);
        setComments([...commentsData].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
        setAllUsers(usersData || []);
      } finally { setLoading(false); }
    };
    init();
  }, [taskId]);

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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAdd = async () => {
    if (!newComment.trim() && selectedFiles.length === 0) return;

    try {
      await addTaskCommentApi(taskId, newComment, selectedFiles);
      setNewComment('');
      setSelectedFiles([]);
      loadComments();
      if (onCommentAdded) {
        onCommentAdded();
      }

    } catch (e) {
      alert(t('common.error'));
    }
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
    } catch (e) { alert(t('common.error')); }
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
    } catch (e) { alert(t('common.error')); }
  };

  const handleTextChange = (e) => {
    const value = e.target.value;
    const selectionStart = e.target.selectionStart;
    setNewComment(value);
    setCursorPos(selectionStart);

    const lastAtPos = value.lastIndexOf('@', selectionStart - 1);

    if (lastAtPos !== -1) {
      const textAfterAt = value.substring(lastAtPos + 1, selectionStart);
      if (!textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt);
        setShowMentionList(true);
      } else {
        setShowMentionList(false);
      }
    } else {
      setShowMentionList(false);
    }
  };

  const insertMention = (user) => {
    const lastAtPos = newComment.lastIndexOf('@', cursorPos - 1);
    const beforeAt = newComment.substring(0, lastAtPos);
    const afterMention = newComment.substring(cursorPos);
    const fullName = `${user.first_name} ${user.last_name}`;
    const newText = `${beforeAt}@${fullName} ${afterMention}`;
    setNewComment(newText);
    setShowMentionList(false);
  };

  const renderFormattedText = (text) => {
    if (!text) return '';
    const parts = text.split(/(@[A-ZА-Я][a-zа-яё]+\s[A-ZА-Я][a-zа-яё]+)/g);
    return parts.map((part, i) =>
      part.startsWith('@')
        ? <span key={i} className="text-[#1677FF] font-bold">{part}</span>
        : part
    );
  };

  const handleMenuOpen = (event) => {
    const commentElement = event.currentTarget.closest('.comment-row');
    const container = scrollContainerRef.current;

    if (commentElement && container) {
      const elementTop = commentElement.offsetTop;
      const elementHeight = commentElement.offsetHeight;
      const containerHeight = container.offsetHeight;

      const targetScrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);

      container.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const screenshot = new File([file], `screenshot_${Date.now()}.png`, {
            type: file.type,
          });

          setSelectedFiles((prev) => [...prev, screenshot]);

        }
      }
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">{t('common.loading')}</div>;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-white relative z-10">
        {comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} className="comment-row flex gap-4 group transition-all duration-300">
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
                    <ActionMenu
                      onOpen={handleMenuOpen}
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
                      <button onClick={() => setEditingId(null)} className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50">{t('common.cancel')}</button>
                      <button onClick={() => handleUpdate(comment.id)} className="px-4 py-1.5 bg-[#1677FF] text-white rounded-lg text-xs font-bold hover:bg-blue-600">{t('common.edit')}</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">{renderFormattedText(comment.content)}</p>
                )}

                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-2">
                    {comment.attachments.map(file => {
                      const ext = file.filename.split('.').pop().toLowerCase();
                      const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);

                      return (
                        <div key={file.id} className="max-w-[400px]">
                          {isImage ? (
                            <ProtectedImage attachment={file} taskId={taskId} />
                          ) : (
                            <div
                              onClick={() => handleViewFile(file.id, file.filename)}
                              className="flex items-center gap-3 px-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl hover:border-blue-300 transition-all cursor-pointer group/file"
                            >
                              <FileText className={ext === 'pdf' ? "text-red-500" : "text-blue-500"} size={20} />
                              <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-blue-600 underline decoration-blue-200 group-hover/file:decoration-blue-500">
                                  {file.filename}
                                </span>
                                <span className="text-[10px] text-gray-400 uppercase font-medium">
                                  {(file.file_size / 1024).toFixed(1)} KB
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          ))) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <MessageSquare size={32} className="opacity-20" />
              </div>
              <p className="text-sm font-medium">{t('tasks.comments_empty')}</p>
              <p className="text-xs opacity-60">{t('tasks.comments_first')}</p>
            </div>
        )}
        <div className="h-18 flex-shrink-0 pointer-events-none" />
      </div>

      <div className="p-8 border-t border-gray-50 flex-shrink-0 bg-white relative">
        {showMentionList && (
          <div className="absolute bottom-[calc(100%-20px)] left-8 w-64 bg-white border border-gray-100 shadow-2xl rounded-xl z-[100] overflow-hidden animate-in slide-in-from-bottom-2">
            <div className="p-2 bg-gray-50 border-b text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('tasks.comments_mention')}</div>
            <div className="max-h-48 overflow-y-auto">
              {allUsers.filter(u => `${u.first_name} ${u.last_name}`.toLowerCase().includes(mentionSearch.toLowerCase())).map(u => (
                <div
                  key={u.id}
                  onClick={() => insertMention(u)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                    {u.first_name[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{u.first_name} {u.last_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 animate-in slide-in-from-bottom-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-[12px] text-blue-600 font-medium shadow-sm">
                <FileText size={14} />
                <span className="truncate max-w-[150px]">{file.name}</span>
                <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => removeSelectedFile(index)} />
              </div>
            ))}
          </div>
        )}

        <h4 className="text-sm font-bold text-gray-800 mb-3">{t('tasks.comments_title')}</h4>
        <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-400 transition-all shadow-sm">
          <textarea
            value={newComment}
            onChange={handleTextChange}
            onPaste={handlePaste}
            placeholder={t('tasks.comments_placeholder')}
            className="w-full h-24 p-4 text-sm outline-none resize-none"
          />
          <div className="bg-[#F9FAFB] px-4 py-3 flex items-center justify-between border-t border-gray-50">
            <div className="flex items-center gap-4 text-gray-400">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple />
              <button type="button" onClick={() => fileInputRef.current.click()} className="hover:text-blue-500 transition-colors">
                <Paperclip size={18} />
              </button>
              <Bold size={18} className="hover:text-blue-500 cursor-pointer" />
              <Underline size={18} className="hover:text-blue-500 cursor-pointer" />
            </div>
            <button
              onClick={handleAdd}
              disabled={!newComment.trim() && selectedFiles.length === 0}
              className="bg-[#1677FF] text-white px-6 py-2 rounded-lg font-bold text-xs hover:bg-blue-600 disabled:bg-gray-200 transition-all"
            >
              {t('tasks.comments_add')}
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('tasks.comments_delete_title')}>
        <div className="flex flex-col gap-4 p-2">
          <p className="text-gray-600 text-sm">{t('tasks.comments_delete_confirm')}</p>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 border rounded-lg font-bold text-gray-400">{t('common.cancel')}</button>
            <button onClick={confirmDelete} className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold">{t('common.delete')}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
