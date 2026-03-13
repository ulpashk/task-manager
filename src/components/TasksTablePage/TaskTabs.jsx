export const TaskTabs = () => {
  const tabs = ["Общий", "Не выполнено", "В обработке", "На доработке", "Выполнено"];
  const activeTab = "Общий";

  return (
    <div className="px-6 mt-6 border-b border-gray-100 flex gap-6">
      {tabs.map(tab => (
        <button 
          key={tab}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab}
          {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />}
        </button>
      ))}
    </div>
  );
};