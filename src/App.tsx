/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { DormManager } from './components/DormManager';
import { RegimesTimeline } from './components/RegimesTimeline';
import { SchoolManager } from './components/SchoolManager';
import { SelfGovernanceRollCall } from './components/SelfGovernanceRollCall';
import { KpiDiscipline } from './components/KpiDiscipline';
import { LeaveManager } from './components/LeaveManager';
import { AnalyticsReports } from './components/AnalyticsReports';
import { StudentProfileManager } from './components/StudentProfileManager';
import { AdminConfigManager } from './components/AdminConfigManager';
import { RoleLoginModal } from './components/RoleLoginModal';

import { Student, ViolationRecord, LeaveRequest, RoomReport, FloorReport, UserSession, UserRoleType } from './types';
import { INITIAL_STUDENTS_DATA, INITIAL_VIOLATIONS_DATA, INITIAL_LEAVE_DATA } from './data/studentsData';
import { AppConfig, DEFAULT_APP_CONFIG } from './data/appConfig';
import { ROLE_ACCOUNTS } from './data/authAccounts';

export default function App() {
  // 1. Students State
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('chv_students_data_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved students:', e);
      }
    }
    return INITIAL_STUDENTS_DATA;
  });

  // 2. Violations State
  const [violations, setViolations] = useState<ViolationRecord[]>(() => {
    const saved = localStorage.getItem('chv_violations_data_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading violations:', e);
      }
    }
    return INITIAL_VIOLATIONS_DATA;
  });

  // 3. Leave Requests State
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('chv_leave_data_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading leave requests:', e);
      }
    }
    return INITIAL_LEAVE_DATA;
  });

  // 4. Room & Floor Reports
  const [roomReports, setRoomReports] = useState<RoomReport[]>(() => {
    const saved = localStorage.getItem('chv_room_reports_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading room reports:', e);
      }
    }
    return [];
  });

  const [floorReports, setFloorReports] = useState<FloorReport[]>(() => {
    const saved = localStorage.getItem('chv_floor_reports_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading floor reports:', e);
      }
    }
    return [];
  });

  // 5. App Configuration
  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('chv_app_config_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading config:', e);
      }
    }
    return DEFAULT_APP_CONFIG;
  });

  // 6. User Session & Roles
  const [userSession, setUserSession] = useState<UserSession>(() => {
    const defaultAcc = ROLE_ACCOUNTS[0];
    return {
      role: defaultAcc.role,
      username: defaultAcc.username,
      displayName: defaultAcc.fullName,
      dutyTitle: defaultAcc.title,
      dutySummary: defaultAcc.dutySummary,
      mandates: defaultAcc.mandates,
      allowedTabs: defaultAcc.allowedTabs
    };
  });

  const [currentRole, setCurrentRole] = useState<string>(userSession.role);
  const [activeTab, setActiveTab] = useState<string>('dorm');
  const [showRoleLoginModal, setShowRoleLoginModal] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('chv_students_data_v1', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('chv_violations_data_v1', JSON.stringify(violations));
  }, [violations]);

  useEffect(() => {
    localStorage.setItem('chv_leave_data_v1', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('chv_room_reports_v1', JSON.stringify(roomReports));
  }, [roomReports]);

  useEffect(() => {
    localStorage.setItem('chv_floor_reports_v1', JSON.stringify(floorReports));
  }, [floorReports]);

  useEffect(() => {
    localStorage.setItem('chv_app_config_v1', JSON.stringify(appConfig));
  }, [appConfig]);

  // Handle Role Change
  const handleRoleChange = (newRole: string) => {
    setCurrentRole(newRole);
    const matchedAcc = ROLE_ACCOUNTS.find(a => a.role === newRole);
    if (matchedAcc) {
      setUserSession({
        role: matchedAcc.role,
        username: matchedAcc.username,
        displayName: matchedAcc.fullName,
        dutyTitle: matchedAcc.title,
        dutySummary: matchedAcc.dutySummary,
        mandates: matchedAcc.mandates,
        allowedTabs: matchedAcc.allowedTabs
      });
      if (!matchedAcc.allowedTabs.includes(activeTab)) {
        setActiveTab(matchedAcc.allowedTabs[0] || 'dorm');
      }
    }
  };

  const handleLoginSession = (newSession: UserSession) => {
    setUserSession(newSession);
    setCurrentRole(newSession.role);
    if (!newSession.allowedTabs.includes(activeTab)) {
      setActiveTab(newSession.allowedTabs[0] || 'dorm');
    }
  };

  // Student operations
  const handleUpdateStudentStatus = (studentId: string, status: Student['status']) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents(prev => [newStudent, ...prev]);
  };

  const handleBatchAddStudents = (newStudents: Student[]) => {
    setStudents(prev => [...newStudents, ...prev]);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  const handleBatchDeleteStudents = (studentIds: string[]) => {
    const idSet = new Set(studentIds);
    setStudents(prev => prev.filter(s => !idSet.has(s.id)));
  };

  const handlePromoteByGrade = (fromGrade: number, toGrade: number | 'graduate') => {
    setStudents(prev => prev.map(s => {
      const g = parseInt(s.class.substring(0, 2), 10);
      if (g !== fromGrade) return s;
      if (toGrade === 'graduate') {
        return {
          ...s,
          academicStatus: 'graduated',
          isBoarding: false,
          room: undefined,
          floor: undefined
        };
      } else {
        const branch = s.class.substring(2);
        return {
          ...s,
          class: `${toGrade}${branch}`,
          academicStatus: 'studying'
        };
      }
    }));
  };

  const handlePromoteByClass = (fromClass: string, toClass: string | 'graduate') => {
    setStudents(prev => prev.map(s => {
      if (s.class !== fromClass) return s;
      if (toClass === 'graduate') {
        return {
          ...s,
          academicStatus: 'graduated',
          isBoarding: false,
          room: undefined,
          floor: undefined
        };
      } else {
        return {
          ...s,
          class: toClass,
          academicStatus: 'studying'
        };
      }
    }));
  };

  const handlePromoteIndividual = (studentId: string, newClass: string | 'graduate') => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      if (newClass === 'graduate') {
        return {
          ...s,
          academicStatus: 'graduated',
          isBoarding: false,
          room: undefined,
          floor: undefined
        };
      } else {
        return {
          ...s,
          class: newClass,
          academicStatus: 'studying'
        };
      }
    }));
  };

  const handleRestoreStudent = (studentId: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, academicStatus: 'studying' } : s));
  };

  // Violation operations
  const handleAddViolation = (v: Omit<ViolationRecord, 'id'>) => {
    const newRecord: ViolationRecord = {
      ...v,
      id: `VIO_${Date.now()}`
    };
    setViolations(prev => [newRecord, ...prev]);

    // Deduct student's KPI score
    setStudents(prev => prev.map(s => {
      if (s.id === v.studentId) {
        const currentKpi = s.kpiScore ?? 100;
        return {
          ...s,
          kpiScore: Math.max(0, currentKpi - Math.abs(v.penaltyPoints)),
          violationCount: (s.violationCount || 0) + 1
        };
      }
      return s;
    }));
  };

  const handleDeleteViolation = (id: string) => {
    setViolations(prev => prev.filter(v => v.id !== id));
  };

  // Leave operations
  const handleAddLeaveRequest = (req: Omit<LeaveRequest, 'id'>) => {
    const newReq: LeaveRequest = {
      ...req,
      id: `LR_${Date.now()}`
    };
    setLeaveRequests(prev => [newReq, ...prev]);
  };

  const handleUpdateLeaveStatus = (id: string, status: LeaveRequest['status'], approver?: string) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status, approvedBy: approver || l.approvedBy } : l));
  };

  // Room & Floor reports
  const handleAddRoomReport = (report: RoomReport) => {
    setRoomReports(prev => [report, ...prev]);
  };

  const handleAddFloorReport = (report: FloorReport) => {
    setFloorReports(prev => [report, ...prev]);
  };

  // Background update
  const handleUpdateBackground = (imageUrl: string, opacity?: number, brightness?: number, saturation?: number) => {
    setAppConfig(prev => ({
      ...prev,
      backgroundImageUrl: imageUrl,
      backgroundOverlayOpacity: typeof opacity === 'number' ? opacity : prev.backgroundOverlayOpacity,
      backgroundBrightness: typeof brightness === 'number' ? brightness : prev.backgroundBrightness,
      backgroundSaturation: typeof saturation === 'number' ? saturation : prev.backgroundSaturation
    }));
  };

  const handleSaveConfig = (newConfig: AppConfig) => {
    setAppConfig(newConfig);
  };

  const handleResetConfig = () => {
    setAppConfig(DEFAULT_APP_CONFIG);
  };

  // Compute live boarding stats for Header
  const boardingStats = useMemo(() => {
    const activeBoarding = students.filter(s => s.isBoarding && (s.academicStatus || 'studying') === 'studying');
    let present = 0;
    let excused = 0;
    let unexcused = 0;

    activeBoarding.forEach(s => {
      if (s.status === 'absent_excused') excused++;
      else if (s.status === 'absent_unexcused') unexcused++;
      else present++;
    });

    return {
      total: activeBoarding.length,
      present,
      excused,
      unexcused,
      violationsCount: violations.length
    };
  }, [students, violations]);

  return (
    <div className="min-h-screen relative flex flex-col bg-slate-950 font-sans antialiased text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Dynamic Background Image with customizable overlay & clarity filters */}
      {appConfig.backgroundImageUrl && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center transition-all duration-700"
          style={{ 
            backgroundImage: `url("${appConfig.backgroundImageUrl}")`,
            filter: `brightness(${appConfig.backgroundBrightness ?? 102}%) saturate(${appConfig.backgroundSaturation ?? 110}%)`
          }}
        />
      )}

      {/* Primary Brand Color Overlay (Logo Royal Navy Blue #002B7F) with user-controlled opacity */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
        style={{
          backgroundColor: '#002B7F',
          opacity: appConfig.backgroundOverlayOpacity ?? 0.20
        }}
      />

      {/* Subtle radial lighting gradient */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950/60" />

      {/* Main App Container */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Navigation Header */}
        <Header
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          config={appConfig}
          boardingStats={boardingStats}
          userSession={userSession}
          onOpenRoleLoginModal={() => setShowRoleLoginModal(true)}
          onUpdateBackground={handleUpdateBackground}
        />

        {/* Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dorm' && (
            <DormManager
              students={students}
              onUpdateStudentStatus={handleUpdateStudentStatus}
              onRecordViolation={(student, code) => handleAddViolation({
                studentId: student.id,
                studentName: student.name,
                class: student.class,
                isBoarding: student.isBoarding,
                room: student.room,
                building: student.dormBuilding,
                date: new Date().toISOString().split('T')[0],
                time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
                code: code || 'L07',
                title: 'Vi phạm quy định KTX',
                penaltyPoints: -3,
                note: 'Không chấp hành đúng nền nếp nội vụ KTX theo Điều 3 & 4',
                recordedBy: userSession.displayName,
                status: 'recorded'
              })}
              onRequestLeave={(student) => {
                setActiveTab('leave');
              }}
            />
          )}

          {activeTab === 'regimes' && (
            <RegimesTimeline regimes={appConfig.regimes} />
          )}

          {activeTab === 'school' && (
            <SchoolManager
              students={students}
              onRecordViolation={(student, code) => handleAddViolation({
                studentId: student.id,
                studentName: student.name,
                class: student.class,
                isBoarding: student.isBoarding,
                room: student.room,
                building: student.dormBuilding,
                date: new Date().toISOString().split('T')[0],
                time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
                code: code || 'L01',
                title: code === 'L01' ? 'Đi học muộn (sau 07h00)' : 'Sai đồng phục / Thẻ',
                penaltyPoints: code === 'L01' ? -1 : -3,
                note: 'Ghi nhận trong ca trực ban đầu giờ Tòa nhà A (06h55 - 07h15)',
                recordedBy: userSession.displayName,
                status: 'recorded'
              })}
              onUpdateStatus={handleUpdateStudentStatus}
            />
          )}

          {activeTab === 'manage_students' && (
            <StudentProfileManager
              students={students}
              onAddStudent={handleAddStudent}
              onBatchAddStudents={handleBatchAddStudents}
              onDeleteStudent={handleDeleteStudent}
              onBatchDeleteStudents={handleBatchDeleteStudents}
              onPromoteByGrade={handlePromoteByGrade}
              onPromoteByClass={handlePromoteByClass}
              onPromoteIndividual={handlePromoteIndividual}
              onRestoreStudent={handleRestoreStudent}
            />
          )}

          {activeTab === 'self_governance' && (
            <SelfGovernanceRollCall
              students={students}
              onUpdateStudentStatus={handleUpdateStudentStatus}
              onRecordViolation={(student, code) => handleAddViolation({
                studentId: student.id,
                studentName: student.name,
                class: student.class,
                isBoarding: student.isBoarding,
                room: student.room,
                building: student.dormBuilding,
                date: new Date().toISOString().split('T')[0],
                time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
                code: code || 'L07',
                title: 'Vi phạm nề nếp KTX',
                penaltyPoints: -3,
                note: 'Ghi nhận qua kiểm tra Ban Tự Quản phòng/tầng',
                recordedBy: userSession.displayName,
                status: 'recorded'
              })}
              roomReports={roomReports}
              onAddRoomReport={handleAddRoomReport}
              floorReports={floorReports}
              onAddFloorReport={handleAddFloorReport}
              userSession={userSession}
            />
          )}

          {activeTab === 'discipline' && (
            <KpiDiscipline
              violations={violations}
              students={students}
              onAddViolation={handleAddViolation}
              onDeleteViolation={handleDeleteViolation}
            />
          )}

          {activeTab === 'leave' && (
            <LeaveManager
              leaveRequests={leaveRequests}
              students={students}
              onAddLeaveRequest={handleAddLeaveRequest}
              onUpdateLeaveStatus={handleUpdateLeaveStatus}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsReports
              students={students}
              violations={violations}
              leaveRequests={leaveRequests}
              userSession={userSession}
            />
          )}

          {activeTab === 'admin_config' && (
            <AdminConfigManager
              config={appConfig}
              onSaveConfig={handleSaveConfig}
              onResetConfig={handleResetConfig}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="relative z-10 bg-slate-950/90 border-t border-slate-800 text-slate-400 py-6 px-4 text-xs text-center">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <strong className="text-white">{appConfig.schoolName}</strong> • {appConfig.academicYear}
            </div>
            <div>
              Hệ thống Quản lý Ký túc xá Nội trú & Nền nếp Học sinh Tòa nhà A • Phiên bản 2026.10
            </div>
          </div>
        </footer>
      </div>

      {/* Role Login Modal */}
      <RoleLoginModal
        isOpen={showRoleLoginModal}
        onClose={() => setShowRoleLoginModal(false)}
        currentSession={userSession}
        onLoginSession={handleLoginSession}
        students={students}
      />
    </div>
  );
}
