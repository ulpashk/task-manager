import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, RefreshCw, Clock, Cpu, Hash, User, CheckCircle2, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { summaryService } from '../../services/summaryService';
import { ReportCharts } from '../../components/Analytics/ReportCharts';
import { useAuth } from '../../context/AuthContext';
import { llmModelService } from '../../services/llmModelService';

export const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [llmModels, setLlmModels] = useState([]);
  const [regenModelId, setRegenModelId] = useState('');
  const [showRegenPicker, setShowRegenPicker] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [detail, vers] = await Promise.all([
        summaryService.getById(id),
        summaryService.getVersions(id)
      ]);
      setSummary(detail);
      setVersions(vers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (user?.role === 'manager') {
      llmModelService.list().then(setLlmModels).catch(() => {});
    }
  }, [user?.role]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const newSummary = await summaryService.regenerate(id, regenModelId ? Number(regenModelId) : null);
      setShowRegenPicker(false);
      setRegenModelId('');
      // Navigate to the new version
      if (newSummary.id && newSummary.id !== Number(id)) {
        navigate(`/reports/summaries/${newSummary.id}`);
      } else {
        loadData();
      }
    } catch (err) {
      alert("Ошибка перегенерации");
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center text-gray-400 animate-pulse">Загрузка отчета...</div>;
  if (!summary) return <div className="p-10 text-center text-red-500">Отчет не найден</div>;

  return (
    // FIX: h-full и overflow-y-auto позволяют странице скроллиться
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto p-6 flex flex-col gap-6 font-sans pb-20">
        
        {/* Компактный Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <button 
            onClick={() => navigate('/analytics')} 
            className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-all text-sm font-bold group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            Назад к аналитике
          </button>
          
          {user?.role === 'manager' && (
            <div className="flex items-center gap-2">
              {showRegenPicker && llmModels.length > 0 && (
                <select
                  value={regenModelId}
                  onChange={e => setRegenModelId(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs w-[180px]"
                >
                  <option value="">Текущая модель</option>
                  {llmModels.map(m => <option key={m.id} value={m.id}>{m.display_name || m.model_id}</option>)}
                </select>
              )}
              <button
                onClick={() => {
                  if (!showRegenPicker) {
                    setShowRegenPicker(true);
                  } else {
                    handleRegenerate();
                  }
                }}
                disabled={regenerating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md disabled:bg-gray-300"
              >
                {regenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {showRegenPicker ? 'Подтвердить' : 'Перегенерировать'}
              </button>
            </div>
          )}
        </div>

        {/* Основная карточка отчета */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          
          {/* Заголовок внутри карточки */}
          <div className="p-8 border-b border-gray-50 bg-gray-50/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                {summary.period_type}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">ID: #{summary.id}</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">
              Отчет за {summary.period_start} — {summary.period_end}
            </h1>
            <p className="text-xs text-gray-400 mt-2 font-medium">
              Сгенерирован {format(new Date(summary.generated_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
            </p>
          </div>

          {/* Scope & Focus info */}
          {(summary.focus_prompt || summary.project_scope || summary.client_scope) && (
            <div className="px-8 py-4 border-b border-gray-50 flex flex-wrap gap-4 text-xs">
              {summary.project_scope && (
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-medium">Проект: {summary.project_scope.name}</span>
              )}
              {summary.client_scope && (
                <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg font-medium">Клиент: {summary.client_scope.name}</span>
              )}
              {summary.focus_prompt && (
                <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg font-medium">Фокус: {summary.focus_prompt}</span>
              )}
            </div>
          )}

          {/* Секции (structured) */}
          {summary.sections && Object.keys(summary.sections).length > 0 ? (
            <div className="p-8 border-b border-gray-50 flex flex-col gap-6">
              {Object.entries(summary.sections).map(([title, content]) => (
                <div key={title}>
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">{title}</h3>
                  <div className="text-[15px] text-gray-700 leading-[1.7] whitespace-pre-wrap">{content}</div>
                </div>
              ))}
            </div>
          ) : (
            /* Текстовый контент (fallback) */
            <div className="p-8 border-b border-gray-50">
              <div className="text-[15px] text-gray-700 leading-[1.7] whitespace-pre-wrap">
                {summary.summary_text}
              </div>
            </div>
          )}

          {/* Секция графиков */}
          <div className="p-8 bg-[#F9FAFB]/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Визуальный разбор</h3>
            </div>
            <ReportCharts rawData={summary.raw_data} />
          </div>

          {/* Техническая информация (футер карточки) */}
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50/50 border-t border-gray-100">
            <MetaItem icon={<Cpu size={16}/>} label="Модель" value={summary.llm_model || 'GPT-4o'} />
            <MetaItem icon={<Hash size={16}/>} label="Токены" value={Number(summary.prompt_tokens || 0) + Number(summary.completion_tokens || 0)} />
            <MetaItem icon={<Clock size={16}/>} label="Время" value={`${summary.generation_time_ms}ms`} />
            <MetaItem icon={<User size={16}/>} label="Автор" value={summary.requested_by?.first_name || 'Система'} />
          </div>
        </div>

        {/* История версий */}
        {versions.length > 1 && (
          <div className="mt-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">История версий</h3>
            <div className="flex flex-col gap-2">
              {versions.map(v => (
                <div 
                  key={v.id} 
                  onClick={() => navigate(`/reports/summaries/${v.id}`)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${v.id === summary.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:border-blue-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${v.generation_method === 'ai' ? 'bg-green-500' : 'bg-orange-500'}`} />
                    <span className={`text-sm font-bold ${v.id === summary.id ? 'text-blue-700' : 'text-gray-700'}`}>
                      {format(new Date(v.generated_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                    </span>
                  </div>
                  {v.id === summary.id && <CheckCircle2 size={18} className="text-blue-600" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Вспомогательный мини-компонент для метаданных
const MetaItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="text-gray-400">{icon}</div>
    <div>
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{label}</p>
      <p className="text-[13px] font-bold text-gray-700 mt-1">{value}</p>
    </div>
  </div>
);