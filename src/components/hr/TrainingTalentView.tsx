import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  Plus,
  CheckCircle2,
  Calendar,
  Users,
  Search,
  Star,
  BookOpen
} from 'lucide-react';
import { TrainingCourse, EmployeeSkillMatrix, EmployeeMaster } from '../../types';
import { storageService } from '../../services/storageService';

interface TrainingTalentViewProps {
  employees: EmployeeMaster[];
  onRefresh: () => void;
}

export const TrainingTalentView: React.FC<TrainingTalentViewProps> = ({
  employees,
  onRefresh
}) => {
  const [subTab, setSubTab] = useState<'courses' | 'skills'>('courses');
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const courses = storageService.getTrainingCourses();
  const skillMatrices = storageService.getSkillMatrices();

  const [courseForm, setCourseForm] = useState({
    title: '',
    courseCode: `TRN-${Math.floor(100 + Math.random() * 900)}`,
    category: 'HVAC Technical' as TrainingCourse['category'],
    trainerName: 'Daikin Certified Master Trainer',
    durationHours: 16,
    format: 'Classroom & Site Workshop' as TrainingCourse['format'],
    targetAudience: 'Site Commissioning Engineers & Technicians',
    passingScorePct: 80,
    description: '',
    upcomingDate: new Date().toISOString().split('T')[0]
  });

  const [skillForm, setSkillForm] = useState({
    empId: employees[0]?.id || 'emp-001',
    skillName: 'VRF Piping & Low-Loss Header Commissioning',
    category: 'Testing & Commissioning' as 'Technical Sizing' | 'Site Execution' | 'Testing & Commissioning' | 'Safety Compliance',
    proficiencyLevel: 3 as 1 | 2 | 3 | 4,
    certified: true
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title) return;
    storageService.addTrainingCourse({
      courseCode: courseForm.courseCode,
      title: courseForm.title,
      category: courseForm.category,
      trainerName: courseForm.trainerName,
      durationHours: Number(courseForm.durationHours),
      format: courseForm.format,
      targetAudience: courseForm.targetAudience,
      totalEnrolled: 0,
      totalCompleted: 0,
      passingScorePct: Number(courseForm.passingScorePct),
      description: courseForm.description,
      upcomingDate: courseForm.upcomingDate
    });
    setCourseModalOpen(false);
    setCourseForm({
      title: '',
      courseCode: `TRN-${Math.floor(100 + Math.random() * 900)}`,
      category: 'HVAC Technical',
      trainerName: 'Daikin Certified Master Trainer',
      durationHours: 16,
      format: 'Classroom & Site Workshop',
      targetAudience: 'Site Commissioning Engineers & Technicians',
      passingScorePct: 80,
      description: '',
      upcomingDate: new Date().toISOString().split('T')[0]
    });
    onRefresh();
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === skillForm.empId);
    if (!emp) return;

    const existingMatrix = skillMatrices.find(m => m.empId === emp.id);
    const newSkill = {
      skillName: skillForm.skillName,
      category: skillForm.category,
      proficiencyLevel: skillForm.proficiencyLevel,
      certified: skillForm.certified
    };

    if (existingMatrix) {
      const updatedSkills = [...existingMatrix.skills.filter(s => s.skillName !== skillForm.skillName), newSkill];
      storageService.updateEmployeeSkillMatrix({
        ...existingMatrix,
        skills: updatedSkills
      });
    } else {
      storageService.updateEmployeeSkillMatrix({
        id: `skm-${Date.now()}`,
        empId: emp.id,
        empName: emp.fullName || emp.name || 'Employee',
        designation: emp.designation,
        department: emp.department,
        skills: [newSkill]
      });
    }

    setSkillModalOpen(false);
    onRefresh();
  };

  const getProficiencyLabel = (lvl: number) => {
    switch (lvl) {
      case 1: return { label: 'Beginner', color: 'bg-slate-100 text-slate-700' };
      case 2: return { label: 'Intermediate', color: 'bg-blue-50 text-blue-700 border border-blue-200' };
      case 3: return { label: 'Advanced', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
      case 4: return { label: 'Master Specialist', color: 'bg-purple-50 text-purple-700 border border-purple-200' };
      default: return { label: 'Proficient', color: 'bg-slate-100 text-slate-700' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => { setSubTab('courses'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              subTab === 'courses'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>HVAC Training Programs ({courses.length})</span>
          </button>

          <button
            onClick={() => { setSubTab('skills'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              subTab === 'skills'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Technical Skill Matrix ({skillMatrices.length} Engineers)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {subTab === 'courses' ? (
            <button
              onClick={() => setCourseModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course Module</span>
            </button>
          ) : (
            <button
              onClick={() => setSkillModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Map Competency / Skill</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. COURSES VIEW */}
      {subTab === 'courses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map((c) => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase">
                      {c.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">{c.durationHours} Hours</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2.5">{c.title}</h4>
                  <div className="text-[11px] font-mono text-indigo-600 mt-0.5">{c.courseCode} • {c.format}</div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{c.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Trainer: <strong>{c.trainerName}</strong></span>
                    <span className="text-emerald-700 font-bold text-[11px] font-mono">Passing: {c.passingScorePct}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{c.upcomingDate}</span>
                    </span>
                    <span className="font-semibold text-indigo-600">
                      {c.totalEnrolled} Enrolled • {c.totalCompleted} Certified
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SKILL MATRIX VIEW */}
      {subTab === 'skills' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillMatrices.map((matrix) => (
              <div key={matrix.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{matrix.empName}</h4>
                    <p className="text-xs text-slate-500">{matrix.designation} • {matrix.department}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold font-mono">
                    {matrix.skills.length} Certified Skills
                  </span>
                </div>

                <div className="space-y-2">
                  {matrix.skills.map((sk, idx) => {
                    const prof = getProficiencyLabel(sk.proficiencyLevel);
                    return (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{sk.skillName}</span>
                            {sk.certified && (
                              <span title="Certified">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{sk.category}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${prof.color}`}>
                            {prof.label}
                          </span>
                          <div className="flex items-center text-amber-500">
                            {[...Array(4)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < sk.proficiencyLevel ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Course */}
      {courseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add HVAC Training Module</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 550 PSI Nitrogen Pressure Holding & Vacuum Dehydration"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="HVAC Technical">HVAC Technical</option>
                    <option value="Site HSE & Safety">Site HSE & Safety</option>
                    <option value="BMS & Controls">BMS & Controls</option>
                    <option value="Project Management">Project Management</option>
                    <option value="Soft Skills & Leadership">Soft Skills & Leadership</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={courseForm.durationHours}
                    onChange={(e) => setCourseForm({ ...courseForm, durationHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Trainer / OEM Partner</label>
                <input
                  type="text"
                  required
                  value={courseForm.trainerName}
                  onChange={(e) => setCourseForm({ ...courseForm, trainerName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Course Description & Syllabus</label>
                <textarea
                  rows={3}
                  required
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Outline syllabus, practical testing steps, and OEM guidelines..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                >
                  Save Training Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Skill */}
      {skillModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Map Technical Skill to Engineer</h3>
            <form onSubmit={handleAddSkill} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Employee</label>
                <select
                  value={skillForm.empId}
                  onChange={(e) => setSkillForm({ ...skillForm, empId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName || emp.name} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Skill / Competency Name</label>
                <input
                  type="text"
                  required
                  value={skillForm.skillName}
                  onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Domain</label>
                  <select
                    value={skillForm.category}
                    onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="Technical Sizing">Technical Sizing</option>
                    <option value="Site Execution">Site Execution</option>
                    <option value="Testing & Commissioning">Testing & Commissioning</option>
                    <option value="Safety Compliance">Safety Compliance</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Proficiency Level</label>
                  <select
                    value={skillForm.proficiencyLevel}
                    onChange={(e) => setSkillForm({ ...skillForm, proficiencyLevel: Number(e.target.value) as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value={1}>1 - Beginner</option>
                    <option value={2}>2 - Intermediate</option>
                    <option value={3}>3 - Advanced</option>
                    <option value={4}>4 - Master Specialist</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="certCheck"
                  checked={skillForm.certified}
                  onChange={(e) => setSkillForm({ ...skillForm, certified: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="certCheck" className="text-slate-700 font-medium">
                  Verified by OEM / Site Quality Audit
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSkillModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                >
                  Save Competency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
