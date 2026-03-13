import { Calendar, Sparkles, FileText, Table } from 'lucide-react';
import { ReportCard } from '../components/Analytics/ReportCard';

export const AnalyticsPage = () => {
  const mockReportContent = [
    "За выбранную дату в системе было создано 18 новых задач. Закрыто 12 задач, из них 9 выполнены в срок.",
    "Наиболее активные участники дня:\nИванов А. - 5 выполненных задач\nПетрова К. - 4 выполненные задачи",
    "Просроченных задач на конец дня - 2.",
    "Наиболее частые категории обращений:\n- bug\n- integration\n- documentation",
    "Рекомендуем обратить внимание на задачи с приоритетом и дедлайном в ближайшие 24 часа."
  ];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-8 font-sans pb-10">
      <section className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm flex-shrink-0">
        <h3 className="text-xl font-bold text-gray-800 mb-8">ИИ аналитика</h3>
        
        <div className="flex items-center gap-4 mb-10">
          <div className="relative flex-1 max-w-[240px]">
            <input type="text" placeholder="С даты" className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-sm" />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="relative flex-1 max-w-[240px]">
            <input type="text" placeholder="По дату" className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-sm" />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#F3F4F6] text-gray-400 rounded-xl font-bold text-sm">
            <Sparkles size={18} /> Сгенерировать отчет
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ReportCard 
            title="Ежедневный отчет" 
            subtitle="Отчет за день: 26-02-2026"
            content={mockReportContent}
            date="26 февраля 11:06 PM"
          />
          <ReportCard 
            title="Еженедельный отчет" 
            subtitle="Отчет за неделю: с 20-02-2026 по 26-02-2026"
            content={mockReportContent}
            date="26 февраля 11:06 PM"
          />
        </div>
      </section>

      <section className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm flex-shrink-0">
        <h3 className="text-xl font-bold text-gray-800 mb-8">Экспортировать отчеты</h3>
        
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative max-w-[240px] flex-1">
            <input type="text" placeholder="С даты" className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl outline-none text-sm" />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="relative max-w-[240px] flex-1">
            <input type="text" placeholder="По дату" className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl outline-none text-sm" />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#F3F4F6] text-gray-400 rounded-xl font-bold text-sm mr-4">
            <Sparkles size={18} /> Сгенерировать отчет
          </button>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
              <FileText size={18} /> PDF
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-green-600 hover:bg-green-50 transition-colors">
              <Table size={18} /> Excel
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};