import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchProjectsApi, deleteProjectApi } from '../../services/projectService';
import { ProjectFilters } from '../../components/Projects/ProjectFilters';
import { ProjectTable } from '../../components/Projects/ProjectTable';
import { Pagination } from '../../components/general/Pagination';
import { CreateTaskWizard } from '../../components/TasksPage/CreateTaskWizard';
import { EditProjectModal } from '../../components/Projects/EditProjectModal';
import { Modal } from '../../components/general/Modal';

export const ProjectsPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

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

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    try {
      await deleteProjectApi(projectToDelete.id);
      setIsDeleteModalOpen(false);
      loadProjects();
    } catch (err) {
      alert(t('projects.delete_error'));
    }
  };
    
  const handleEditRequest = (project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

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
          { label: t('projects.tab_general'), key: "" },
          { label: t('projects.tab_active'), key: "created" },
          { label: t('projects.tab_frozen'), key: "frozen" },
          { label: t('projects.tab_done'), key: "done" }
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
          <div className="p-10 text-center text-gray-400">{t('projects.loading')}</div>
        ) : (
          <ProjectTable 
            projects={data.results} 
            onEditRequest={handleEditRequest}
            onDeleteRequest={handleDeleteClick}
          />
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

      <EditProjectModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        project={selectedProject} 
        onRefresh={loadProjects} 
      />

      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title={t('projects.delete_title')}
      >
        <div className="flex flex-col gap-4 font-sans">
          <p className="text-gray-600">
            {t('projects.delete_confirm')} <span className="font-bold text-gray-800">"{projectToDelete?.title}"</span>?
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-6 py-2 font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={confirmDelete}
              className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100"
            >
              {t('common.delete')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};