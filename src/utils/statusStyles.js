export const getStatusStyle = (status) => {
    if (status === 'completed' || status === 'done') return 'bg-green-50 text-green-500';
    if (status === 'TODO' || status === 'created') return 'bg-gray-100 text-gray-500';
    if (status === 'IN_PROGRESS' || status === 'in_progress') return 'bg-yellow-50 text-yellow-500';
    if (status === 'revision' || status === 'waiting') return 'bg-blue-50 text-blue-500';
    return 'bg-gray-50 text-gray-500';
};

export const getStatusLabel = (s) => {
    if (s === 'done') return 'Выполнено';
    if (s === 'completed' || s === 'Completed' || s === 'COMPLETED') return 'Выполнено';
    if (s === 'todo' || s === 'Todo' || s === 'TODO') return 'Создано';
    if (s === 'created') return 'Создано';
    if (s === 'in_progress' || s === 'In_progress' || s === 'IN_PROGRESS') return 'В обработке';
    if (s === 'revision' || s === 'Revision' || s === 'REVISION') return 'На доработке';
    if (s === 'waiting') return 'На проверке';
    return s;
}