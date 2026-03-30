import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProjectEpicsApi, fetchProjectByIdApi } from '../../services/projectService';
import { EpicCard } from '../../components/Epics/EpicCard';
import { Search, Plus, Loader2 } from 'lucide-react';
import { CreateTaskWizard } from '../../components/TasksPage/CreateTaskWizard';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [epics, setEpics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      const [projData, epicsData] = await Promise.all([
        fetchProjectByIdApi(id),
        fetchProjectEpicsApi(id)
      ]);
      setProject(projData);
      setEpics(epicsData.results || []);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <div className="p-10 text-center text-gray-400"><Loader2 className="animate-spin inline mr-2"/> Загрузка проекта...</div>;

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2 font-sans pb-10">
      <h1 className="text-2xl font-bold text-gray-900 max-w-2xl leading-tight">
        {project?.title}
      </h1>

      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Все эпики</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1677FF] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:bg-blue-600 shadow-lg shadow-blue-100 transition-all"
          >
            <Plus size={20}/> Добавить эпик
          </button>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-all" placeholder="Поиск по эпикам..." />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {epics.map(epic => (
            <EpicCard key={epic.id} epic={epic} />
          ))}
          {epics.length === 0 && <div className="col-span-2 text-center py-20 text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed">В этом проекте пока нет эпиков</div>}
        </div>
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