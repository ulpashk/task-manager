import { useTranslation } from 'react-i18next';
import { ActionMenu } from './ActionMenu';
import { useNavigate } from 'react-router-dom';
import { formatDateTime } from '../../utils/formatters';
import { getStatusStyle } from '../../utils/statusStyles';

const STATUS_KEY_MAP = {
  done: 'status.done',
  completed: 'status.done',
  COMPLETED: 'status.done',
  todo: 'status.created',
  Todo: 'status.created',
  TODO: 'status.created',
  created: 'status.created',
  in_progress: 'status.in_progress',
  In_progress: 'status.in_progress',
  IN_PROGRESS: 'status.in_progress',
  revision: 'status.revision',
  Revision: 'status.revision',
  REVISION: 'status.revision',
  waiting: 'status.waiting',
};

const PRIORITY_KEY_MAP = {
  high: 'priority.high',
  HIGH: 'priority.high',
  medium: 'priority.medium',
  MEDIUM: 'priority.medium',
  low: 'priority.low',
  LOW: 'priority.low',
};

export const TaskTable = ({ tasks, onEditRequest, onDeleteRequest }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getPriorityStyle = (priority) => {
    if (priority === 'high' || priority === 'HIGH') return 'bg-red-50 text-red-500 border-red-100';
    if (priority === 'medium' || priority === 'MEDIUM') return 'bg-orange-50 text-orange-500 border-orange-100';
    return 'bg-gray-50 text-gray-500 border-gray-100';
  };

  const handleMenuOpen = (e) => {
    const rowElement = e.currentTarget.closest('.task-row');
    if (rowElement) {
      rowElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead className="text-[13px] font-medium text-gray-500 sticky top-0 z-20">
          <tr>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">{t('tasks.company')}</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">{t('tasks.title')}</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">{t('tasks.tag')}</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">{t('tasks.assignee')}</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">{t('tasks.creator')}</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100 text-center">{t('tasks.priority_col')}</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100 text-center">{t('tasks.status_col')}</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-[14px]">
          {tasks.map((task) => (
            <tr key={task.id} className="task-row hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    <img src={`https://ui-avatars.com/api/?name=${task.client?.name}`} alt="logo" />
                  </div>
                  <span className="font-medium text-gray-700 truncate max-w-[150px]">{task.client?.name || 'Unknown Client'}</span>
                </div>
              </td>
              <td
                className="px-6 py-4 text-gray-600 max-w-[200px] truncate"
              >
                {task.title}
              </td>
              <td className="px-4 py-5">
                <div className="flex flex-wrap gap-1.5">
                  {task.tags && task.tags.length > 0 ? (
                    task.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 rounded-md text-xs font-medium border transition-all"
                        style={{
                          color: tag.color,
                          borderColor: `${tag.color}40`,
                        }}
                      >
                        {tag.name}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-1 bg-gray-50 text-gray-400 rounded-md border border-gray-100 text-xs font-medium">
                      {t('tasks.no_tags')}
                    </span>
                  )}
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {task.assignees && task.assignees.length > 0 ? (
                    task.assignees.map((assignee) => (
                      <div className="flex items-center gap-2" key={assignee.id}>
                        <img className="w-6 h-6 rounded-full" src={`https://ui-avatars.com/api/?name=${assignee.first_name}`} alt="" />
                        <span
                          className="text-gray-700"
                        >
                          {assignee.first_name} {assignee.last_name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="px-2 py-1 bg-gray-50 text-gray-400 rounded-md border border-gray-100 text-xs font-medium">
                      {t('tasks.no_assignees')}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <img className="w-6 h-6 rounded-full" src={`https://ui-avatars.com/api/?name=${task.created_by?.first_name}`} alt="" />
                  <span className="text-gray-700">{task.created_by?.first_name} {task.created_by?.last_name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`px-3 py-1 rounded-full text-xs border font-medium ${getPriorityStyle(task.priority)}`}>
                  {t(PRIORITY_KEY_MAP[task.priority] || 'priority.low')}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <div className='flex flex-col items-center gap-1'>
                  <span className="px-3 py-1 text-gray-500 whitespace-nowrap">
                    {formatDateTime(task.deadline)}
                  </span>
                  <span className={`px-3 py-1 w-2/3 rounded-full text-xs font-medium ${getStatusStyle(task.status)}`}>
                    {t(STATUS_KEY_MAP[task.status] || 'status.created')}
                  </span>
                </div>
              </td>
              <td className="px-4" onClick={(e) => e.stopPropagation()}>
                <ActionMenu
                  onOpen={handleMenuOpen}
                  onDelete={() => onDeleteRequest(task)}
                  onEdit={() => onEditRequest(task)}
                />
              </td>
            </tr>
          ))}
          <tr className="h-16 pointer-events-none"><td></td></tr>
        </tbody>
      </table>
    </div>
  );
};
