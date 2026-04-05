import { ActionMenu } from '../TasksPage/ActionMenu';

export const TagTable = ({ tags, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto h-full">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead className="bg-[#F9FAFB] text-[13px] font-medium text-gray-500 uppercase tracking-wider sticky top-0 z-10">
          <tr>
            <th className="px-10 py-4 border-b border-gray-100">Наименование тэга</th>
            <th className="px-10 py-4 border-b border-gray-100">Тэг</th>
            <th className="px-6 py-4 border-b border-gray-100"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-[14px]">
          {tags.map((tag) => (
            <tr key={tag.id} className="hover:bg-gray-50 transition-colors group">
              <td className="px-10 py-5 text-gray-700 font-medium">
                {tag.name}
              </td>
              <td className="px-10 py-5">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-[4px] shadow-sm border border-gray-100" 
                    style={{ backgroundColor: tag.color || '#D9D9D9' }}
                  />
                  <span className="text-gray-600 font-mono">
                    {tag.color?.toUpperCase() || '#D9D9D9'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <ActionMenu 
                  onEdit={() => onEdit(tag)} 
                  onDelete={() => onDelete(tag)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};