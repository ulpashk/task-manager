import { useEffect, useState, useMemo } from 'react';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay 
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchTasksByDateRange } from '../services/taskService';

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const today = new Date();

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  useEffect(() => {
    const start = calendarDays[0];
    const end = calendarDays[calendarDays.length - 1];
    fetchTasksByDateRange(start, end).then(data => setTasks(data.results));
  }, [currentDate, calendarDays]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col p-6 overflow-hidden">
      
      <div className="flex items-center justify-center mb-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
             <button 
               onClick={() => setCurrentDate(subMonths(currentDate, 1))} 
               className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
             >
               <ChevronLeft size={20} />
             </button>
             <h2 className="text-xl font-bold capitalize min-w-[160px] text-center">
               {format(currentDate, 'LLLL yyyy', { locale: ru })}
             </h2>
             <button 
               onClick={() => setCurrentDate(addMonths(currentDate, 1))} 
               className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
             >
               <ChevronRight size={20} />
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-100 flex-shrink-0">
        {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map(day => (
          <div key={day} className="text-center font-bold text-gray-500 text-sm py-3 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar border-l border-t mt-2">
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dayTasks = tasks.filter(t => isSameDay(new Date(t.deadline), day));
            const isToday = isSameDay(day, today);
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div 
                key={idx} 
                className={`
                  min-h-[140px] p-2 border-b border-r transition-colors
                  ${isToday ? 'bg-blue-100/50' : isCurrentMonth ? 'bg-white' : 'bg-gray-50/50'}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`
                    text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-blue-600 text-white' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}
                  `}>
                    {format(day, 'd')}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  {dayTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="text-[10px] px-2 py-1 rounded border-l border-blue-300 bg-gray-100 text-blue-600 truncate shadow-sm hover:z-10 hover:relative"
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};