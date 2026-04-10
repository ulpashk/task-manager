import { useNavigate } from 'react-router-dom';
import { getStatusStyle, getStatusLabel } from '../../utils/statusStyles';
import { ActionMenu } from '../TasksPage/ActionMenu';

export const EpicCard = ({ epic, onEditRequest, onDeleteRequest }) => {
  const navigate = useNavigate();
  const statusStyles = {
    created: 'bg-[#E1F9E6] text-[#56AD6C] border-[#B7EB8F]',
    done: 'bg-blue-50 text-blue-500 border-blue-100',
  };

  function getTaskProgress(stats) {
    if (!stats || stats.total === 0) return 0;

    const weightedCompleted = stats.completed + stats.in_progress * 0.5;

    const progress = (weightedCompleted / stats.total) * 100;

    return Math.round(progress);
  }

  return (
    <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-6 flex flex-col gap-4 font-sans h-full">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-gray-800">{epic.title}</h3>
        <div className="flex items-center gap-1">
          <span className={`px-3 py-0.5 rounded-lg border text-[11px] font-bold ${statusStyles[epic.status] || statusStyles.created}`}>
            {(epic.status === 'done' || epic.status === 'completed')  ? 'Завершено' : 'Активный'}
          </span>
          <ActionMenu 
            onEdit={() => onEditRequest(epic)} 
            onDelete={() => onDeleteRequest(epic)} 
            hidePin 
          />
        </div>
      </div>

      <p className="text-[12px] text-gray-400 leading-relaxed -mt-2">
        {epic.project?.title || 'Название проекта...'}
      </p>

      <div className="grid grid-cols-3 gap-2 text-[12px] mt-2">
        <div><span className="text-gray-400 block">Ответственный:</span> <span className="font-bold text-gray-700">{epic.assignee?.first_name || 'Не назначен'} {epic.assignee?.last_name}</span></div>
        <div><span className="text-gray-400 block">Всего задач:</span> <span className="font-bold text-gray-700">{epic.tasks_count}</span></div>
        <div><span className="text-gray-400 block">Готовность:</span> <span className="font-bold text-gray-700">{getTaskProgress(epic.task_stats)}%</span></div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <span className="text-[11px] font-bold text-gray-400 uppercase">Команда</span>
        <div className="flex flex-wrap gap-2">
          {epic.team && epic.team.length > 0 ? (
            epic.team.map((member) => (
              <span key={member.id} className="px-3 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-600 text-[10px] font-bold">
                {member.job_title===null ? member.first_name : `${member.first_name} - ${member.job_title}`}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-[10px]">Команда не назначена</span>
          )}
          {/* <button className="flex items-center gap-1 px-3 py-1 rounded-full border border-gray-200 text-gray-400 text-[10px] hover:bg-gray-50 transition-all">
            <Plus size={12}/> Добавить участника
          </button> */}
        </div>
      </div>

      <div className="flex gap-4 text-[11px] font-bold border-t pt-4 mt-2">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"/> Завершено: {epic.task_stats?.completed || 0}</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"/> В процессе: {epic.task_stats?.in_progress || 0}</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-400"/> Не начато: {epic.task_stats?.not_started || 0}</div>
      </div>

      <div className="flex flex-col gap-2 mt-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
        {epic.tasks?.map((task) => {
          const hasSubtasks = task.subtasks && task.subtasks.length > 0;

          return (
            <div 
              key={task.id} 
              className={`p-4 rounded-2xl border transition-all shadow-sm ${
                hasSubtasks ? 'bg-[#F0F9F4] border-[#B7EB8F]' : 'bg-[#FFF1F0] border-[#FFA39E]'
              }`}
            >
              <div className="flex justify-between items-start mb-3" onClick={() => navigate(`/tasks/${task.id}`)}>
                <div className="flex items-center gap-2 font-bold text-[13px] text-gray-800 cursor-pointer">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${hasSubtasks ? 'bg-[#008C8C]' : 'bg-[#CF1322]'}`} />
                  {task.title}
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${getStatusStyle(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11px] text-gray-500 font-medium">Исполнитель:</span>
                <div className="flex flex-wrap gap-1.5">
                  {task.assignees && task.assignees.length > 0 ? (
                    task.assignees.map(a => (
                      <span key={a.id} className="px-3 py-0.5 border border-blue-300 bg-white text-blue-600 rounded-full text-[10px] font-bold">
                        {a.role === undefined ? a.first_name : `${a.first_name} - ${a.role}`}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-[10px]">Исполнитель не назначен</span>
                  )}
                </div>
              </div>

              {hasSubtasks && (
                <div className="mt-4 space-y-2">
                  <p className="text-[11px] font-black text-gray-800 tracking-wider mb-2">ПОДЗАДАЧИ:</p>
                  {task.subtasks.map(sub => (
                    <div 
                      key={sub.id}
                      onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${sub.id}`); }}
                      className="bg-[#FFFBE6] border border-[#FFE58F] rounded-xl p-3 flex justify-between items-center hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 font-bold text-[12px] text-gray-800 leading-tight">
                           <div className="w-1.5 h-1.5 rounded-full bg-[#D48806]" />
                           {sub.title}
                        </div>
                        <span className="text-[9px] font-bold text-blue-500 bg-blue-50 w-fit px-1.5 py-0.5 rounded ml-3">
                          {getStatusLabel(sub.status)}
                        </span>
                      </div>
                      
                      <div className="flex-shrink-0 ml-4">
                        {sub.assignees && sub.assignees.length > 0 ? (
                          sub.assignees.map(a => (
                            <span key={a.id} className="px-2 py-0.5 border border-green-400 text-green-700 bg-white rounded-full text-[9px] font-bold">
                              {a.role === undefined ? a.first_name : `${a.first_name} - ${a.role}`}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-[10px]">Исполнитель не назначен</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};