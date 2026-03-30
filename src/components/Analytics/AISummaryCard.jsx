import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const AISummaryCard = ({ title, summary }) => {
  if (!summary) return null;

  return (
    <div className="bg-[#F8F9FA] p-8 rounded-[24px] border border-gray-100 flex flex-col h-full shadow-sm relative overflow-hidden group">
      {/* Желтый акцент из Angular */}
      {/* <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" /> */}
      
      <div className="flex justify-between items-start mb-6 pl-2">
        <div>
          <h4 className="text-xl font-bold text-gray-800">{title}</h4>
          <p className="text-xs text-gray-400 font-bold uppercase mt-1">
            {summary.period_start} {summary.period_end ? `— ${summary.period_end}` : ''}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          summary.generation_method === 'ai' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
        }`}>
          {summary.generation_method}
        </span>
      </div>
      
      <div className="flex-1 text-[14px] text-gray-600 leading-[1.7] whitespace-pre-wrap pl-2">
        {summary.summary_text}
      </div>

      <div className="mt-8 pt-5 border-t border-gray-200/60 pl-2">
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
          Сгенерирован {format(new Date(summary.generated_at), 'd MMMM HH:mm', { locale: ru })}
        </p>
      </div>
    </div>
  );
};