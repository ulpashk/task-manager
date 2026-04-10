import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, Table, History, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { summaryService } from '../../services/summaryService';
import { AISummaryCard } from '../../components/Analytics/AISummaryCard';

export const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [latest, setLatest] = useState({ daily: null, weekly: null });
  const [stats, setStats] = useState(null); // Данные из /api/reports/summary/
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [selectedReport, setSelectedReport] = useState(null);
  
  // Состояния кнопок
  const [generating, setGenerating] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Даты
  const [aiDates, setAiDates] = useState({ from: '', to: '' });
  const [reportDates, setReportDates] = useState({ from: '', to: '' });

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [latestRes, historyRes, statsRes] = await Promise.all([
        summaryService.getLatest(),
        summaryService.list(1),
        summaryService.getStats('', '') // Начальная статистика (все время)
      ]);
      setLatest(latestRes);
      setHistory(historyRes.results || []);
      setStats(statsRes);
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  // Вызов генерации ИИ
  const handleAiGenerate = async () => {
    setGenerating(true);
    try {
      await summaryService.generateAI(aiDates.from, aiDates.to);
      const latestRes = await summaryService.getLatest();
      setLatest(latestRes);
      alert("Запрос на генерацию отправлен!");
    } catch (err) {
      alert("Ошибка при генерации ИИ");
    } finally {
      setGenerating(false);
    }
  };

  // Вызов загрузки статистики (Грид с цифрами)
  const handleLoadStats = async () => {
    setStatsLoading(true);
    try {
      const data = await summaryService.getStats(reportDates.from, reportDates.to);
      setStats(data);
    } catch (err) {
      alert("Ошибка загрузки статистики");
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
    } catch (err) { alert("Ошибка экспорта"); }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline" /></div>;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pr-4 flex flex-col gap-8 font-sans pb-10">
      
      {/* 1. СЕКЦИЯ ИИ АНАЛИТИКА */}
      <section className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-8">ИИ аналитика</h3>
        
        <div className="flex items-center gap-4 mb-10">
          <input type="date" value={aiDates.from} onChange={(e) => setAiDates({...aiDates, from: e.target.value})} className="pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-sm w-[200px]" />
          <input type="date" value={aiDates.to} onChange={(e) => setAiDates({...aiDates, to: e.target.value})} className="pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-sm w-[200px]" />
          <button 
            onClick={handleAiGenerate}
            disabled={generating || !aiDates.from || !aiDates.to}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1677FF] text-white rounded-xl font-bold text-sm hover:bg-blue-600 disabled:bg-gray-200"
          >
            {generating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            Сгенерировать отчет
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div onClick={() => latest.daily && navigate(`/reports/summaries/${latest.daily.id}`)} className="cursor-pointer">
            <AISummaryCard title="Ежедневный отчет" summary={latest.daily} />
          </div>
          <div onClick={() => latest.weekly && navigate(`/reports/summaries/${latest.weekly.id}`)} className="cursor-pointer">
            <AISummaryCard title="Еженедельный отчет" summary={latest.weekly} />
          </div>
        </div>
      </section>

      {/* 2. СЕКЦИЯ СТАТИСТИКИ И ЭКСПОРТА */}
      <section className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-8">Экспортировать отчеты</h3>
        
        <div className="flex items-center gap-4 flex-wrap mb-10">
          <input type="date" value={reportDates.from} onChange={(e) => setReportDates({...reportDates, from: e.target.value})} className="pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm w-[200px]" />
          <input type="date" value={reportDates.to} onChange={(e) => setReportDates({...reportDates, to: e.target.value})} className="pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm w-[200px]" />
          
          <button onClick={handleLoadStats} className="px-6 py-2.5 bg-[#1677FF] text-white rounded-xl font-bold text-sm">
            {statsLoading ? <Loader2 size={18} className="animate-spin" /> : "Показать данные"}
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-6 py-2.5 border border-red-100 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"><FileText size={18} /> PDF</button>
            <button onClick={() => handleExport('excel')} className="flex items-center gap-2 px-6 py-2.5 border border-green-100 rounded-xl text-sm font-bold text-green-600 hover:bg-green-50 transition-colors"><Table size={18} /> Excel</button>
          </div>
        </div>

        {/* Сетка цифр статистики (как в Figma) */}
        {stats && (
          <div className="grid grid-cols-4 gap-6 mt-8">
            <div className="p-6 bg-gray-50 rounded-2xl text-center border border-gray-100">
              <p className="text-3xl font-black text-gray-800">{stats.tasks.total}</p>
              <p className="text-xs font-bold text-gray-400 uppercase mt-1">Всего задач</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl text-center border border-gray-100">
              <p className="text-3xl font-black text-gray-800">{stats.tasks.created_in_period}</p>
              <p className="text-xs font-bold text-gray-400 uppercase mt-1">Создано</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl text-center border border-gray-100">
              <p className="text-3xl font-black text-gray-800">{stats.tasks.closed_in_period}</p>
              <p className="text-xs font-bold text-gray-400 uppercase mt-1">Выполнено</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl text-center border border-gray-100">
              <p className="text-3xl font-black text-red-500">{stats.tasks.overdue}</p>
              <p className="text-xs font-bold text-gray-400 uppercase mt-1">Просрочено</p>
            </div>
          </div>
        )}
      </section>

      {/* 3. ИСТОРИЯ ГЕНЕРАЦИИ */}
      <section className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <History size={20} className="text-gray-400" />
          <h3 className="text-xl font-bold text-gray-800">История генерации ({history.length})</h3>
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
                  Создано: {format(new Date(item.generated_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                </p>
              </div>
              <span className="text-[#1677FF] text-xs font-bold">Открыть отчет →</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};