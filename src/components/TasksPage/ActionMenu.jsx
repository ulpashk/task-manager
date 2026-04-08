import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2, Pin, PinOff } from 'lucide-react';

export const ActionMenu = ({ onEdit, onDelete, onOpen}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (e) => {
    e.stopPropagation();
    const newState = !isOpen;
    setIsOpen(newState);
    
    if (newState && onOpen) {
      onOpen(e);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={handleToggle} 
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <MoreVertical size={18} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-[100] p-1.5 animate-in fade-in zoom-in duration-150">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-[14px] text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            <Pencil size={16} /> Редактировать
          </button>
          
          {/* <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Pin size={16} /> Закрепить
          </button> */}
          
            {/* {isPinned ? <PinOff size={16} className="text-blue-500" /> : <Pin size={16} />}
            {isPinned ? 'Открепить' : 'Закрепить'} */}

          <button 
            onClick={(e) => { 
              e.stopPropagation();
              onDelete(); 
              setIsOpen(false); 
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1 border-t border-gray-50 pt-2"
          >
            <Trash2 size={16} /> Удалить
          </button>
        </div>
      )}
    </div>
  );
};