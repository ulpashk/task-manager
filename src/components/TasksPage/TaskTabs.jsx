import { useTranslation } from 'react-i18next';

export const TaskTabs = ({ activeStatus, onStatusChange }) => {
  const { t } = useTranslation();

  const tabs = [
    { label: t('status.general'), key: "" },
    { label: t('status.created'), key: "created" },
    { label: t('status.in_progress'), key: "in_progress" },
    { label: t('status.waiting'), key: "waiting" },
    { label: t('status.revision'), key: "revision" },
    { label: t('status.done'), key: "done" },
  ];

  return (
    <div className="px-6 mt-6 border-b border-gray-100 flex gap-6">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onStatusChange(tab.key)}
          className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
            activeStatus === tab.key ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
          {activeStatus === tab.key && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full animate-in fade-in duration-300" />
          )}
        </button>
      ))}
    </div>
  );
};
