export const OrganizationTable = ({ orgs }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead className="bg-gray-50 text-[13px] font-semibold text-gray-500 uppercase">
          <tr>
            <th className="px-6 py-4 border-b border-gray-100">Name</th>
            <th className="px-6 py-4 border-b border-gray-100">Slug</th>
            <th className="px-6 py-4 border-b border-gray-100 text-center">Status</th>
            <th className="px-6 py-4 border-b border-gray-100 text-center">Users</th>
            <th className="px-6 py-4 border-b border-gray-100 text-center">Tasks</th>
            <th className="px-6 py-4 border-b border-gray-100">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-[14px]">
          {orgs.map((org) => (
            <tr key={org.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-5 font-medium text-gray-800">{org.name}</td>
              <td className="px-6 py-5 text-gray-500">{org.slug}</td>
              <td className="px-6 py-5 text-center">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white ${org.is_active ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                  {org.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-5 text-center text-gray-600">{org.user_count}</td>
              <td className="px-6 py-5 text-center text-gray-600">{org.task_count}</td>
              <td className="px-6 py-5 text-gray-500">
                {new Date(org.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};