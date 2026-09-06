import React, { useState } from 'react';
import {
  UserPlus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Building,
  Sparkles
} from 'lucide-react';
import { OnboardingTask, JobCandidate, EmployeeMaster } from '../../types';
import { storageService } from '../../services/storageService';

interface OnboardingWorkflowViewProps {
  candidates: JobCandidate[];
  employees: EmployeeMaster[];
  onRefresh: () => void;
}

export const OnboardingWorkflowView: React.FC<OnboardingWorkflowViewProps> = ({
  candidates,
  employees,
  onRefresh
}) => {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    candidateId: candidates[0]?.id || 'cand-001',
    empName: candidates[0]?.name || 'Offered Candidate',
    title: '',
    department: 'HR Admin' as OnboardingTask['department'],
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  });

  const onboardingTasks = storageService.getOnboardingTasks();

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) return;
    storageService.addOnboardingTask({
      candidateId: taskForm.candidateId,
      empName: taskForm.empName,
      title: taskForm.title,
      department: taskForm.department,
      dueDate: taskForm.dueDate,
      status: 'Pending'
    });
    setTaskModalOpen(false);
    setTaskForm({ candidateId: candidates[0]?.id || 'cand-001', empName: candidates[0]?.name || 'Offered Candidate', title: '', department: 'HR Admin', dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0] });
    onRefresh();
  };

  const handleToggleTaskStatus = (task: OnboardingTask) => {
    const nextStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
    storageService.updateOnboardingTaskStatus(task.id, nextStatus);
    onRefresh();
  };

  const completedCount = onboardingTasks.filter(t => t.status === 'Completed').length;
  const progressPct = onboardingTasks.length ? Math.round((completedCount / onboardingTasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Onboarding Stage Funnel Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                Pre-Hire to Day 1 Readiness
              </span>
              <span className="text-xs text-slate-500">HVAC Engineering & Site Crew</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Automated New Hire Onboarding Workflow & Asset Checklists
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Track KYC document collection, IT CAD/BIM workstation provisioning, site HSE safety briefing, tool kit issuance, and project manager handover.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-bold uppercase">Overall Completion</span>
              <span className="text-2xl font-bold font-mono text-indigo-600">
                {progressPct}% ({completedCount}/{onboardingTasks.length})
              </span>
            </div>

            <button
              onClick={() => setTaskModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Onboarding Task</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 mt-5 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Task Checklist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {onboardingTasks.map((task) => (
          <div
            key={task.id}
            className={`border rounded-2xl p-4 transition-all flex items-start justify-between gap-3 ${
              task.status === 'Completed'
                ? 'bg-emerald-50/40 border-emerald-200'
                : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleToggleTaskStatus(task)}
                className={`mt-0.5 p-1 rounded-lg transition-all ${
                  task.status === 'Completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {task.department}
                </span>
                <h4 className={`text-xs font-bold mt-1.5 ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {task.title}
                </h4>
                <div className="text-[11px] text-slate-500 mt-1">
                  Candidate: <strong className="text-slate-700">{task.empName}</strong>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  <span>Target: {task.dueDate}</span>
                  {task.completedAt && <span className="text-emerald-600 font-semibold">• Done {task.completedAt}</span>}
                </div>
              </div>
            </div>

            <div>
              {task.status === 'Completed' ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Completed
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Pending
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Task */}
      {taskModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Create New Onboarding Checklist Item</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Candidate / New Joiner</label>
                <select
                  value={taskForm.candidateId}
                  onChange={(e) => {
                    const c = candidates.find(cand => cand.id === e.target.value);
                    setTaskForm({
                      ...taskForm,
                      candidateId: e.target.value,
                      empName: c?.name || 'New Hire'
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} - Stage: {c.stage}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Issue Fluke Micron Gauge & Nitrogen Safety Kit"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Responsible Dept</label>
                  <select
                    value={taskForm.department}
                    onChange={(e) => setTaskForm({ ...taskForm, department: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="HR Admin">HR Admin</option>
                    <option value="IT Admin">IT Admin</option>
                    <option value="Site HSE Safety">Site HSE Safety</option>
                    <option value="Reporting Manager">Reporting Manager</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
