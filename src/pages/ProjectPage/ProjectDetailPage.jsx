import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProjectEpicsApi, fetchProjectByIdApi, deleteEpicApi } from '../../services/projectService';
import { EpicCard } from '../../components/Epics/EpicCard';
import { Search, Plus, Loader2 } from 'lucide-react';
import { CreateTaskWizard } from '../../components/TasksPage/CreateTaskWizard';
import { EditEpicModal } from '../../components/Epics/EditEpicModal';
import { Modal } from '../../components/general/Modal';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [epics, setEpics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEpic, setSelectedEpic] = useState(null);

  const handleEdit = (epic) => { setSelectedEpic(epic); setIsEditOpen(true); };
  const handleDelete = (epic) => { setSelectedEpic(epic); setIsDeleteOpen(true); };
  
  const confirmDelete = async () => {
    try {
      await deleteEpicApi(selectedEpic.id);
      setIsDeleteOpen(false);
      loadData();
    } catch (e) { alert("Ошибка при удалении"); }
  };

  const loadData = useCallback(async () => {
    try {
      const [projData, epicsData] = await Promise.all([
        fetchProjectByIdApi(id),
        fetchProjectEpicsApi(id, { search: searchTerm })
      ]);
      setProject(projData);
      setEpics(epicsData.results || []);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, [id, searchTerm]);

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
          <Search 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-all" 
            placeholder="Поиск по эпикам..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {epics.map(epic => (
            <EpicCard 
              key={epic.id} 
              epic={epic} 
              onEditRequest={handleEdit} 
              onDeleteRequest={handleDelete}/>
          ))}
          {epics.length === 0 && <div className="col-span-2 text-center py-20 text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed">В этом проекте пока нет эпиков</div>}
        </div>
        
        <EditEpicModal 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          epic={selectedEpic} 
          onRefresh={loadData} 
        />
        <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Удалить эпик">
          <div className="p-4 flex flex-col gap-6">
            <p className="text-gray-600">Вы уверены, что хотите удалить эпик <b>"{selectedEpic?.title}"</b>? Все задачи внутри него тоже будут удалены.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteOpen(false)} className="px-6 py-2 font-bold text-gray-400">Отмена</button>
              <button onClick={confirmDelete} className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold">Удалить</button>
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