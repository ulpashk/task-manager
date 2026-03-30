import { MoreVertical, Plus } from 'lucide-react';

export const EpicCard = ({ epic }) => {
  // Цвета для статусов из макета
  const statusStyles = {
    created: 'bg-[#E1F9E6] text-[#56AD6C] border-[#B7EB8F]',
    done: 'bg-blue-50 text-blue-500 border-blue-100',
  };

  return (
    <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-6 flex flex-col gap-4 font-sans h-fit">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-gray-800">{epic.title}</h3>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-0.5 rounded-lg border text-[11px] font-bold ${statusStyles[epic.status] || statusStyles.created}`}>
            Активный
          </span>
          <button className="text-gray-300 hover:text-gray-500"><MoreVertical size={18}/></button>
        </div>
      </div>

      {/* Description & Stats */}
      <p className="text-[12px] text-gray-400 leading-relaxed -mt-2">
        {epic.project?.title || 'Описание проекта...'}
      </p>

      <div className="grid grid-cols-3 gap-2 text-[12px] mt-2">
        <div><span className="text-gray-400 block">Ответственный:</span> <span className="font-bold text-gray-700">{epic.assignee?.first_name} {epic.assignee?.last_name}</span></div>
        <div><span className="text-gray-400 block">Всего задач:</span> <span className="font-bold text-gray-700">{epic.tasks_count || 12}</span></div>
        <div><span className="text-gray-400 block">Готовность:</span> <span className="font-bold text-gray-700">50%</span></div>
      </div>

      {/* Team */}
      <div className="flex flex-col gap-2 mt-2">
        <span className="text-[11px] font-bold text-gray-400 uppercase">Команда</span>
        <div className="flex flex-wrap gap-2">
          {['Улпан - Frontend', 'Мерей - UI/UX', 'Дарига - PM'].map((member, i) => (
            <span key={i} className="px-3 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-600 text-[10px] font-bold">
              {member}
            </span>
          ))}
          <button className="flex items-center gap-1 px-3 py-1 rounded-full border border-gray-200 text-gray-400 text-[10px] hover:bg-gray-50 transition-all">
            <Plus size={12}/> Добавить участника
          </button>
        </div>
      </div>

      {/* Summary Line */}
      <div className="flex gap-4 text-[11px] font-bold border-t pt-4 mt-2">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"/> Завершено: 12</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"/> В процессе: 7</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-400"/> Не начато: 0</div>
      </div>

      {/* Tasks List (Mock data for visualization) */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="p-3 rounded-xl border border-red-100 bg-red-50/30">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-gray-800 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"/> Bug fixes</span>
            <span className="text-green-500 uppercase">Выполнено</span>
          </div>
          <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1">
            Исполнитель: <span className="px-2 py-0.5 border border-purple-200 bg-white text-purple-600 rounded-full font-bold">Аскар - Backend</span>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-green-100 bg-green-50/30">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-gray-800 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"/> Интегрировать с Телеграм</span>
            <span className="text-orange-400 uppercase">В обработке</span>
          </div>
          <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1">
             Исполнитель: <span className="px-2 py-0.5 border border-purple-200 bg-white text-purple-600 rounded-full font-bold">Аскар - Backend</span>
          </div>
        </div>
      </div>
    </div>
  );
};