'use client';

import React, { useState, useEffect } from 'react';
import RouteGuard from '../../../components/RouteGuard';
import Layout from '../../../components/Layout';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import TaskDetailsModal from '../../../components/TaskDetailsModal';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function MemberCalendar() {
  const { user } = useAuth();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Month navigation state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal State
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/projects');
      const tasks = [];
      res.data.projects.forEach((proj) => {
        if (proj.tasks) {
          proj.tasks.forEach((t) => {
            if (t.assigneeId === user.id) {
              tasks.push({
                ...t,
                projectName: proj.name,
              });
            }
          });
        }
      });
      setAssignedTasks(tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const handleOpenTask = (taskId) => {
    setSelectedTaskId(taskId);
    setModalOpen(true);
  };

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Days calculations
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const numberOfDays = new Date(year, month + 1, 0).getDate(); // e.g. 30, 31

  const daysArray = Array.from({ length: numberOfDays }, (_, idx) => idx + 1);
  const leadingOffsetArray = Array.from({ length: firstDayIndex }, (_, idx) => null);

  const calendarCells = [...leadingOffsetArray, ...daysArray];

  const getTasksForDay = (day) => {
    if (!day) return [];
    return assignedTasks.filter((task) => {
      if (!task.dueDate) return false;
      const tDate = new Date(task.dueDate);
      return (
        tDate.getFullYear() === year &&
        tDate.getMonth() === month &&
        tDate.getDate() === day
      );
    });
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  return (
    <RouteGuard allowedRoles={['TEAM_MEMBER']}>
      <Layout>
        {/* Outer Directory Container - Theme matching deep bg */}
        <div className="space-y-8 bg-white dark:bg-[#18191e] text-slate-900 dark:text-white p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800/40 relative overflow-hidden font-sans transition-colors duration-200 min-h-[80vh] pb-12">
          
          {/* Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff3b30]/5 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Timeline Calendar</h2>
              <p className="text-slate-555 dark:text-slate-400 text-sm mt-0.5">Schedule view of task due dates and timelines.</p>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#1e1f25]/50 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl w-fit shadow-sm">
              <button 
                onClick={handlePrevMonth}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-[#ff3b30] rounded-xl text-slate-500 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold uppercase tracking-wider px-3 min-w-32 text-center text-slate-800 dark:text-slate-200">
                {monthNames[month]} {year}
              </span>
              <button 
                onClick={handleNextMonth}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-855 hover:text-[#ff3b30] rounded-xl text-slate-500 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="relative w-8 h-8 mx-auto">
                <div className="absolute inset-0 border-3 border-[#ff3b30]/10 rounded-full"></div>
                <div className="absolute inset-0 border-3 border-[#ff3b30] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : (
            <div className="mx-4 bg-white dark:bg-[#1e1f25] border border-slate-200 dark:border-slate-800/40 rounded-3xl overflow-hidden shadow-sm transition-colors">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-slate-150 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#1c1d21]/30 font-bold text-[9px] text-slate-450 dark:text-slate-500 text-center uppercase tracking-widest py-3.5">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Grid Days */}
              <div className="grid grid-cols-7 grid-flow-row border-collapse">
                {calendarCells.map((day, idx) => {
                  const dayTasks = getTasksForDay(day);
                  const activeToday = day && isToday(day);

                  return (
                    <div 
                      key={idx} 
                      className={`min-h-28 border-b border-r border-slate-150 dark:border-slate-800/60 p-2 flex flex-col justify-between last:border-r-0 hover:bg-slate-50/20 dark:hover:bg-[#1c1d21]/10 transition-colors ${
                        !day ? 'bg-slate-50/10 dark:bg-slate-950/20' : 'bg-white dark:bg-[#1e1f25]'
                      }`}
                    >
                      {/* Day Number */}
                      <div className="flex justify-start">
                        {day && (
                          <span className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-lg ${
                            activeToday 
                              ? 'bg-[#ff3b30] text-white shadow-md shadow-red-500/25' 
                              : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {day}
                          </span>
                        )}
                      </div>

                      {/* Day Tasks List */}
                      <div className="flex-1 mt-2 overflow-y-auto space-y-1 max-h-20 scrollbar-none">
                        {dayTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleOpenTask(task.id)}
                            className={`px-2 py-1 rounded-lg text-[9px] font-bold tracking-tight truncate cursor-pointer border hover:opacity-90 ${
                              task.status === 'COMPLETED' 
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                                : 'bg-red-50/50 dark:bg-red-950/15 border-red-100 dark:border-red-900/40 text-[#ff3b30]'
                            }`}
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
          )}

          {/* Details Modal */}
          <TaskDetailsModal
            taskId={selectedTaskId}
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onTaskUpdated={fetchTasks}
          />

        </div>
      </Layout>
    </RouteGuard>
  );
}
