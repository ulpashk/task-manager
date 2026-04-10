import { ActionMenu } from '../TasksPage/ActionMenu';
import { useNavigate } from 'react-router-dom';

export const ProjectTable = ({ projects, onEditRequest, onDeleteRequest }) => {
  const navigate = useNavigate();
  const statusStyles = {
    created: 'bg-[#E1F9E6] text-[#56AD6C] border-[#B7EB8F]',
    done: 'bg-[#E6F4FF] text-[#1677FF] border-[#91CAFF]',
    frozen: 'bg-[#F5F5F5] text-[#8C8C8C] border-[#D9D9D9]',
  };

  const getStatusLabel = (s) => {
    const labels = { created: 'Активный', done: 'Завершен', frozen: 'Заморожен' };
    return labels[s] || 'Активный';
  };

  const handleMenuOpen = (e) => {
    const rowElement = e.currentTarget.closest('.project-row');
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
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">Компания</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">Название проекта</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100">Описание проекта</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100 text-center">Кол-во эпиков</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100 text-center">Статус</th>
            <th className="px-6 py-4 bg-[#F9FAFB] border-b border-gray-100"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-[14px]">
          {projects.map((project) => (
            <tr
              key={project.id} 
              className="project-row hover:bg-gray-50 transition-colors group cursor-pointer"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    <img src={`https://ui-avatars.com/api/?name=${project.client?.name}`} alt="logo"/>
                  </div>
                  <span className="font-medium text-gray-700 truncate max-w-[150px]">{project.client?.name}</span>
                </div>
              </td>
              <td className="px-6 py-5 text-gray-600 max-w-[200px] truncate">
                {project.title}
              </td>
              <td className="px-6 py-5">
                <div className="max-w-[300px] text-gray-500 text-[13px] line-clamp-2">
                  {project.description || 'Нет описания'}
                </div>
              </td>
              <td className="px-6 py-5 text-center text-gray-500">
                {project.epics_count || 0}
              </td>
              <td className="px-6 py-5 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[11px] text-gray-400 font-medium">07.03.2026 15:00</span>
                  <span className={`px-4 py-0.5 rounded-full border text-[11px] font-bold ${statusStyles[project.status] || statusStyles.created}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>
              </td>
              <td className="px-4" onClick={(e) => e.stopPropagation()}>
                <ActionMenu 
                  onOpen={handleMenuOpen}
                  onDelete={() => onDeleteRequest(project)} 
                  onEdit={() => onEditRequest(project)}
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