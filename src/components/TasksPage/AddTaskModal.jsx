import { useState } from 'react';
import { ChevronDown, Calendar, Loader2 } from 'lucide-react';
import { Modal } from '../general/Modal';
import { createTaskApi } from '../../services/taskService';

const InputGroup = ({ label, children, optional = false }) => (
  <div className="flex flex-col gap-2 mb-5">
    <label className="text-[14px] font-semibold text-gray-700">
      {label} {optional && <span className="text-gray-400 font-normal">(необязательно)</span>}
    </label>
    {children}
  </div>
);

export const AddTaskModal = ({ isOpen, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    // type: '',
    // project: '',
    // epic: '',
    priority: 'low',
    assignees: [],
    deadline: '',
    // status: 'TODO',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors(null);

    try {
      const payload = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      await createTaskApi(payload);
      
      onRefresh();
      onClose();
      setFormData({ title: '', description: '', priority: 'low', deadline: ''});
    } catch (err) {
      setErrors(err.errors || err);
      console.error("Ошибка при создании:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Добавить задачу">
      <form className="flex flex-col" onSubmit={handleSubmit}>
        
        <InputGroup label="Тема задачи">
          <input 
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            type="text"
            placeholder="Например: Разработать эпик для дипломки"
            className={`w-full h-[48px] bg-[#F9FAFB] border ${errors?.title ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 outline-none focus:border-blue-500 text-[14px]`}
          />
        </InputGroup>

        <InputGroup label="Описание">
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Опишите подробно задачу"
            className={`w-full min-h-[120px] bg-[#F9FAFB] border ${errors?.description ? 'border-red-500' : 'border-gray-200'} rounded-lg p-4 outline-none focus:border-blue-500 text-[14px] resize-none`}
          />
        </InputGroup>

        <InputGroup label="Проект" optional>
          <div className="relative">
            <select className="w-full h-[48px] appearance-none bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 outline-none text-[14px] text-gray-400">
              <option>Выберите проект</option>
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </InputGroup>

        <InputGroup label="Эпик" optional>
          <div className="relative">
            <select className="w-full h-[48px] appearance-none bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 outline-none text-[14px] text-gray-400">
              <option>Выберите эпик</option>
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </InputGroup>

        <div className="grid grid-cols-1 gap-1">
          <InputGroup label="Приоритет">
            <div className="relative">
              <select 
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full h-[48px] appearance-none bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 outline-none focus:border-blue-500 text-[14px] text-gray-700"
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </InputGroup>
        </div>

        <InputGroup label="Исполнитель">
          <div className="relative">
            <select className="w-full h-[48px] appearance-none bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 outline-none text-[14px] text-gray-400">
              <option>Выберите исполнителя</option>
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </InputGroup>

        <InputGroup label="Дедлайн">
          <div className="relative">
            <input 
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
              type="datetime-local" 
              className={`w-full h-[48px] bg-[#F9FAFB] border ${errors?.deadline ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 outline-none text-[14px] text-gray-700`}
            />
          </div>
        </InputGroup>

        {errors && typeof errors === 'string' && (
          <p className="text-red-500 text-xs mb-4">{errors}</p>
        )}

        <div className="flex items-center justify-end gap-3 mt-4">
          <button 
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-8 py-3 border border-gray-200 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Отменить
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-[#1677FF] text-white rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200 disabled:bg-blue-300 flex items-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Добавление...' : 'Добавить'}
          </button>
        </div>
      </form>
    </Modal>
  );
};