export const ReportCard = ({ title, subtitle, content, date }) => {
  return (
    <div className="bg-[#F8F9FA] p-8 rounded-2xl border border-gray-100 flex flex-col h-full shadow-sm">
      <div className="mb-6">
        <h4 className="text-xl font-bold text-gray-800 mb-1">{title}</h4>
        <p className="text-sm text-gray-400 font-medium">{subtitle}</p>
      </div>
      
      <div className="flex-1 text-[14px] text-gray-600 leading-[1.6] space-y-4 whitespace-pre-line">
        {content.map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-8 pt-5 border-t border-gray-200/60">
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
          Сгенерирован {date}
        </p>
      </div>
    </div>
  );
};