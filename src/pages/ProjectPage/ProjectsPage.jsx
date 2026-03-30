import { useEffect, useState, useCallback } from 'react';
import { fetchProjectsApi } from '../../services/projectService';
import { ProjectFilters } from '../../components/Projects/ProjectFilters';
import { ProjectTable } from '../../components/Projects/ProjectTable';
import { TaskTabs } from '../../components/TasksPage/TaskTabs';
import { Pagination } from '../../components/general/Pagination';
import { CreateTaskWizard } from '../../components/TasksPage/CreateTaskWizard';

export const ProjectsPage = () => {
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '' });

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchProjectsApi({
        page: currentPage,
        page_size: pageSize,
        search: filters.search,
        status: filters.status
      });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden font-sans">
      <ProjectFilters 
        searchTerm={filters.search}
        onSearch={(val) => { setFilters(p => ({...p, search: val})); setCurrentPage(1); }}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        onAddClick={() => setIsModalOpen(true)}
      />
      
      {/* Кастомные табы для проектов */}
      <div className="px-6 mt-6 border-b border-gray-100 flex gap-6">
        {[
          { label: "Общий", key: "" },
          { label: "Активный", key: "created" },
          { label: "Заморожен", key: "frozen" },
          { label: "Завершен", key: "done" }
        ].map(tab => (
          <button 
            key={tab.key}
            onClick={() => { setFilters(p => ({...p, status: tab.key})); setCurrentPage(1); }}
            className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
              filters.status === tab.key ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            {tab.label}
            {filters.status === tab.key && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden mt-4">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Загрузка проектов...</div>
        ) : (
          <ProjectTable projects={data.results} />
        )}
      </div>

      <Pagination 
        totalCount={data.count} 
        pageSize={pageSize} 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />

      <CreateTaskWizard 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={loadProjects}
        initialType="project"
      />
    </div>
  );
};