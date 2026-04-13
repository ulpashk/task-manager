import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { fetchProjectEpicsApi, fetchProjectByIdApi, deleteEpicApi, generateEpicTasksApi, pollGenerationStatusApi, confirmEpicTasksApi } from '../../services/projectService';
import { EpicCard } from '../../components/Epics/EpicCard';
import { fetchUsersListApi } from '../../services/userService';
import { fetchTagsListApi } from '../../services/tagService';
import { Search, Plus, Loader2, Sparkles } from 'lucide-react';
import { CreateTaskWizard } from '../../components/TasksPage/CreateTaskWizard';
import { EditEpicModal } from '../../components/Epics/EditEpicModal';
import { Modal } from '../../components/general/Modal';
import { usePage } from '../../context/PageContext';
import { AiTaskPreviewModal } from '../../components/Epics/AiTaskPreviewModal';
import { GenerationPipeline } from '../../components/Epics/GenerationPipeline';

export const ProjectDetailPage = () => {
  const { t } = useTranslation();
  const { setCustomTitle } = usePage();
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [epics, setEpics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEpic, setSelectedEpic] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingEpicId, setGeneratingEpicId] = useState(null);
  const [generatingTaskId, setGeneratingTaskId] = useState(null);
  const [generatedData, setGeneratedData] = useState({ tasks: [], warnings: [], epicId: null });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetchUsersListApi({ role: 'engineer' }).then(setUsers);
    fetchTagsListApi().then(setTags);
  }, []);

  const handleEdit = (epic) => { setSelectedEpic(epic); setIsEditOpen(true); };
  const handleDelete = (epic) => { setSelectedEpic(epic); setIsDeleteOpen(true); };
  
  const confirmDelete = async () => {
    try {
      await deleteEpicApi(selectedEpic.id);
      setIsDeleteOpen(false);
      loadData();
    } catch (e) { alert(t('projects.delete_error')); }
  };

  const loadData = useCallback(async () => {
    try {
      const [projData, epicsData] = await Promise.all([
        fetchProjectByIdApi(id),
        fetchProjectEpicsApi(id, { search: searchTerm })
      ]);
      setProject(projData);
      setEpics(epicsData.results || []);
      setCustomTitle(projData.title); 
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, [id, searchTerm]);

  useEffect(() => {
    return () => setCustomTitle(null);
  }, [setCustomTitle]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerateAI = async (epicId) => {
    setIsGenerating(true);
    setGeneratingEpicId(epicId);
    try {
      const { task_id } = await generateEpicTasksApi(epicId);
      setGeneratingTaskId(task_id);
    } catch (err) {
      alert(t('epics.ai_generate_error'));
      setIsGenerating(false);
      setGeneratingEpicId(null);
    }
  };

  const handlePipelineCompleted = async () => {
    // Pipeline completed — fetch the final results
    try {
      const res = await pollGenerationStatusApi(generatingEpicId, generatingTaskId);
      if (res.status === 'completed' && res.result) {
        setGeneratedData({ tasks: res.result.tasks, warnings: res.result.warnings || [], epicId: generatingEpicId });
        setIsPreviewOpen(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
      setGeneratingEpicId(null);
      setGeneratingTaskId(null);
    }
  };

  const handlePipelineFailed = () => {
    alert(t('epics.ai_failed'));
    setIsGenerating(false);
    setGeneratingEpicId(null);
    setGeneratingTaskId(null);
  };

  const handleConfirmTasks = async (finalTasks) => {
    setIsConfirming(true);
    try {
      await confirmEpicTasksApi(generatedData.epicId, finalTasks);
      setIsPreviewOpen(false);
      loadData();
    } catch (err) {
      alert(t('epics.ai_confirm_error'));
    } finally {
      setIsConfirming(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400"><Loader2 className="animate-spin inline mr-2"/> {t('projects.loading_project')}</div>;

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2 font-sans pb-10">

      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{t('projects.all_epics')}</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1677FF] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:bg-blue-600 shadow-lg shadow-blue-100 transition-all"
          >
            <Plus size={20}/> {t('projects.add_epic')}
          </button>
        </div>

        <div className="relative max-w-xl">
          <Search 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-all" 
            placeholder={t('projects.search_epics')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {epics.map(epic => (
            <EpicCard 
              key={epic.id} 
              epic={epic} 
              onGenerateAI={handleGenerateAI}
              isGenerating={isGenerating}
              onEditRequest={handleEdit} 
              onDeleteRequest={handleDelete}/>
          ))}
          {epics.length === 0 && <div className="col-span-2 text-center py-20 text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed">{t('projects.no_epics')}</div>}
        </div>

        {isGenerating && generatingEpicId && generatingTaskId && (
          <GenerationPipeline
            epicId={generatingEpicId}
            taskId={generatingTaskId}
            onCompleted={handlePipelineCompleted}
            onFailed={handlePipelineFailed}
          />
        )}

        <AiTaskPreviewModal 
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          tasks={generatedData.tasks}
          warnings={generatedData.warnings}
          users={users}
          tags={tags}
          onConfirm={handleConfirmTasks}
          loading={isConfirming}
        />
        
        <EditEpicModal 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          epic={selectedEpic} 
          onRefresh={loadData} 
        />
        <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title={t('epics.delete_title')}>
          <div className="p-4 flex flex-col gap-6">
            <p className="text-gray-600">{t('epics.delete_confirm')} <b>"{selectedEpic?.title}"</b>? {t('epics.delete_warning')}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteOpen(false)} className="px-6 py-2 font-bold text-gray-400">{t('common.cancel')}</button>
              <button onClick={confirmDelete} className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold">{t('common.delete')}</button>
            </div>
          </div>
        </Modal>
      </div>

      <CreateTaskWizard 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={loadData}
        initialType="epic"
        initialProjectId={id}
      />
    </div>
  );
};