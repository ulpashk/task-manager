import React from 'react';
import { Modal } from '../general/Modal';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Loader2} from 'lucide-react';

export const AiTaskPreviewModal = ({ isOpen, onClose, tasks, warnings, onConfirm, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Предпросмотр сгенерированных задач">
      <div className="flex flex-col gap-6 font-sans">
        
        {warnings?.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-700 text-sm">
            <AlertCircle size={20} className="flex-shrink-0" />
            <div>
              <p className="font-bold">Внимание:</p>
              <ul className="list-disc ml-4">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          {tasks?.map((task, idx) => (
            <div key={idx} className="p-4 border border-gray-100 bg-gray-50 rounded-xl">
              <p className="font-bold text-gray-800 text-sm">{task.title}</p>
              <p className="text-xs text-gray-500 mt-1">{task.description}</p>
              <div className="mt-2 flex gap-2">
                <span className="text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded border border-gray-200">
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-4 border-t pt-6">
          <button onClick={onClose} className="px-6 py-2.5 font-bold text-gray-400 hover:text-gray-600">Отмена</button>
          <button 
            onClick={onConfirm} 
            disabled={loading}
            className="bg-[#1677FF] text-white px-10 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
            Создать эти задачи
          </button>
        </div>
      </div>
    </Modal>
  );
};