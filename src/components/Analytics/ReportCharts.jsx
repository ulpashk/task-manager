import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export const ReportCharts = ({ rawData }) => {
  if (!rawData) return null;

  const { tasks, by_engineer, by_client } = rawData;

  const statusData = {
    labels: ['Выполнено', 'В работе', 'Ожидание', 'Создано'],
    datasets: [{
      data: [tasks.by_status.done, tasks.by_status.in_progress, tasks.by_status.waiting, tasks.by_status.created],
      backgroundColor: ['#52C41A', '#1677FF', '#FAAD14', '#D9D9D9'],
    }]
  };

  const engineerData = {
    labels: by_engineer.slice(0, 7).map(e => e.engineer_name),
    datasets: [
      { label: 'Выполнено', data: by_engineer.map(e => e.done), backgroundColor: '#52C41A' },
      { label: 'В работе', data: by_engineer.map(e => e.in_progress), backgroundColor: '#1677FF' },
      { label: 'Просрочено', data: by_engineer.map(e => e.overdue), backgroundColor: '#FF4D4F' },
    ]
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 border-t pt-10">
      <div className="bg-gray-50 p-6 rounded-2xl">
        <h4 className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Распределение статусов</h4>
        <div className="h-[250px] flex justify-center">
          <Doughnut data={statusData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl">
        <h4 className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Нагрузка инженеров</h4>
        <div className="h-[250px]">
          <Bar 
            data={engineerData} 
            options={{ 
              indexAxis: 'y', 
              scales: { x: { stacked: true }, y: { stacked: true } },
              maintainAspectRatio: false 
            }} 
          />
        </div>
      </div>
    </div>
  );
};