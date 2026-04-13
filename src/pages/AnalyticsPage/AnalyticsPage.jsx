import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, FileText, Table, History, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { summaryService } from '../../services/summaryService';
import { AISummaryCard } from '../../components/Analytics/AISummaryCard';
import { llmModelService } from '../../services/llmModelService';
import { fetchProjectsListApi } from '../../services/taskService';
import { fetchClientsApi } from '../../services/clientService';

export const AnalyticsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [latest, setLatest] = useState({ daily: null, weekly: null });
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const [aiDates, setAiDates] = useState({ from: '', to: '' });
  const [reportDates, setReportDates] = useState({ from: '', to: '' });

  const [focusPrompt, setFocusPrompt] = useState('');
  const [llmModels, setLlmModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [latestRes, historyRes, statsRes] = await Promise.all([
        summaryService.getLatest(),
        summaryService.list(1),
        summaryService.getStats('', '')
      ]);
      setLatest(latestRes);
      setHistory(historyRes.results || []);
      setStats(statsRes);
      llmModelService.list().then(setLlmModels).catch(() => {});
      fetchProjectsListApi().then(r => setProjects(r || [])).catch(() => {});
      fetchClientsApi({ page_size: 100 }).then(r => setClients(r.results || [])).catch(() => {});
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  const handleAiGenerate = async () => {
    setGenerating(true);
    try {
      await summaryService.generateAI(aiDates.from, aiDates.to, {
        projectId: selectedProjectId || undefined,
        clientId: selectedClientId || undefined,
        focusPrompt: focusPrompt || undefined,
        llmModelId: selectedModelId ? Number(selectedModelId) : undefined,
      });
      const latestRes = await summaryService.getLatest();
      setLatest(latestRes);
      alert(t('analytics.generate_success'));
    } catch (err) {
      alert(t('analytics.generate_error'));
    } finally {
      setGenerating(false);
    }
  };

  const handleLoadStats = async () => {
    setStatsLoading(true);
    try {
      const data = await summaryService.getStats(reportDates.from, reportDates.to);
      setStats(data);
    } catch (err) {
      alert(t('analytics.stats_error'));
    } finally {
      setStatsLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const blob = await summaryService.exportFile(type, reportDates.from, reportDates.to);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${type}_${format(new Date(), 'yyyy-MM-dd')}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();
    } catch (err) { alert(t('analytics.export_error')); }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline" /></div>;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pr-4 flex flex-col gap-8 font-sans pb-10">

      {/* 1. AI Analytics Section */}
      <section className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-8">{t('analytics.ai_title')}</h3>

        <div className="flex flex-col gap-4 mb-10">
          <div className="flex items-center gap-4 flex-wrap">
            <input type="date" value={aiDates.from} onChange={(e) => setAiDates({...aiDates, from: e.target.value})} className="pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-sm w-[180px]" />
            <input type="date" value={aiDates.to} onChange={(e) => setAiDates({...aiDates, to: e.target.value})} className="pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-sm w-[180px]" />
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm w-[180px]"
            >
              <option value="">{t('analytics.all_projects')}</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <select
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm w-[180px]"
            >
              <option value="">{t('analytics.all_clients')}</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {llmModels.length > 0 && (
              <select
                value={selectedModelId}
                onChange={e => setSelectedModelId(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm w-[200px]"
              >
                <option value="">{t('analytics.default_model')}</option>
                {llmModels.map(m => <option key={m.id} value={m.id}>{m.display_name || m.model_id}</option>)}
              </select>
            )}
          </div>
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-xl">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">{t('analytics.focus_label')}</label>
              <textarea
                value={focusPrompt}
                onChange={e => setFocusPrompt(e.target.value)}
                maxLength={500}
                rows={2}
                placeholder={t('analytics.focus_placeholder')}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-sm resize-none"
              />
            </div>
            <button
              onClick={handleAiGenerate}
              disabled={generating || !aiDates.from || !aiDates.to}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1677FF] text-white rounded-xl font-bold text-sm hover:bg-blue-600 disabled:bg-gray-200 h-fit"
            >
              {generating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {t('analytics.generate')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div onClick={() => latest.daily && navigate(`/reports/summaries/${latest.daily.id}`)} className="cursor-pointer">
            <AISummaryCard title={t('analytics.daily_report')} summary={latest.daily} />
          </div>
          <div onClick={() => latest.weekly && navigate(`/reports/summaries/${latest.weekly.id}`)} className="cursor-pointer">
            <AISummaryCard title={t('analytics.weekly_report')} summary={latest.weekly} />
          </div>
        </div>
      </section>

      {/* 2. Stats & Export Section */}
      <section className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-8">{t('analytics.export_title')}</h3>

        <div className="flex items-center gap-4 flex-wrap mb-10">
          <input type="date" value={reportDates.from} onChange={(e) => setReportDates({...reportDates, from: e.target.value})} className="pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm w-[200px]" />
          <input type="date" value={reportDates.to} onChange={(e) => setReportDates({...reportDates, to: e.target.value})} className="pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm w-[200px]" />

          <button onClick={handleLoadStats} className="px-6 py-2.5 bg-[#1677FF] text-white rounded-xl font-bold text-sm">
            {statsLoading ? <Loader2 size={18} className="animate-spin" /> : t('analytics.show_data')}
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-6 py-2.5 border border-red-100 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"><FileText size={18} /> PDF</button>
            <button onClick={() => handleExport('excel')} className="flex items-center gap-2 px-6 py-2.5 border border-green-100 rounded-xl text-sm font-bold text-green-600 hover:bg-green-50 transition-colors"><Table size={18} /> Excel</button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-4 gap-6 mt-8">
            <div className="p-6 bg-gray-50 rounded-2xl text-center border border-gray-100">
              <p className="text-3xl font-black text-gray-800">{stats.tasks.total}</p>
              <p className="text-xs font-bold text-gray-400 uppercase mt-1">{t('analytics.total_tasks')}</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl text-center border border-gray-100">
              <p className="text-3xl font-black text-gray-800">{stats.tasks.created_in_period}</p>
              <p className="text-xs font-bold text-gray-400 uppercase mt-1">{t('analytics.created')}</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl text-center border border-gray-100">
              <p className="text-3xl font-black text-gray-800">{stats.tasks.closed_in_period}</p>
              <p className="text-xs font-bold text-gray-400 uppercase mt-1">{t('analytics.completed')}</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl text-center border border-gray-100">
              <p className="text-3xl font-black text-red-500">{stats.tasks.overdue}</p>
              <p className="text-xs font-bold text-gray-400 uppercase mt-1">{t('analytics.overdue')}</p>
            </div>
          </div>
        )}
      </section>

      {/* 3. Generation History */}
      <section className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <History size={20} className="text-gray-400" />
          <h3 className="text-xl font-bold text-gray-800">{t('analytics.history_title')} ({history.length})</h3>
        </div>
        <div className="flex flex-col gap-3">
          {history.map(item => (
            <div
              key={item.id}
              onClick={() => navigate(`/reports/summaries/${item.id}`)}
              className="p-5 bg-blue-50/20 border border-blue-50 rounded-2xl flex justify-between items-center group hover:border-blue-200 transition-all cursor-pointer">
              <div>
                <p className="text-sm font-bold text-gray-800">
                  {item.period_start} — {item.period_end} ({item.period_type})
                </p>
                <p className="text-[11px] text-gray-400 mt-1 font-medium italic">
                  {t('analytics.created')}: {format(new Date(item.generated_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                </p>
              </div>
              <span className="text-[#1677FF] text-xs font-bold">{t('analytics.open_report')}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
