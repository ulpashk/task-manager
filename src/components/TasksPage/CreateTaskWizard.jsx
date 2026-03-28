import { useState, useEffect } from 'react';
import { Modal } from '../general/Modal';
import { ProjectForm } from './forms/ProjectForm';
import { EpicForm } from './forms/EpicForm';
import { TaskForm } from './forms/TaskForm';
import { SubtaskForm } from './forms/SubtaskForm';
import { ChevronDown } from 'lucide-react';

export const CreateTaskWizard = ({ isOpen, onClose, onRefresh }) => {
  const [step, setStep] = useState('selection');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('selection');
      setSelectedType('');
    }
  }, [isOpen]);

  const typeOptions = [
    { id: 'project', label: 'Проект' },
    { id: 'epic', label: 'Эпик' },
    { id: 'task', label: 'Задача' },
    { id: 'subtask', label: 'Подзадача' },
  ];

  if (step === 'selection') {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Создать">
        <div className="flex flex-col gap-6 font-sans">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Тип</label>
            <div className="relative">
              <select 
                className="w-full h-[48px] bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 outline-none appearance-none cursor-pointer"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">Выберите тип</option>
                {typeOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={onClose} className="px-6 py-2.5 font-bold text-gray-400 hover:text-gray-600 transition-colors">Отменить</button>
            <button 
              disabled={!selectedType}
              onClick={() => setStep('form')}
              className="bg-[#1677FF] text-white px-8 py-2.5 rounded-lg font-bold disabled:bg-gray-200 transition-all"
            >
              Создать
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  const renderForm = () => {
    const props = { onClose, onRefresh, onBack: () => setStep('selection') };
    switch (selectedType) {
      case 'project': return <ProjectForm {...props} />;
      case 'epic':    return <EpicForm {...props} />;
      case 'task':    return <TaskForm {...props} />;
      case 'subtask': return <SubtaskForm {...props} />;
      default: return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Добавить ${typeOptions.find(t => t.id === selectedType)?.label.toLowerCase()}`}>
      {renderForm()}
    </Modal>
  );
};