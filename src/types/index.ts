export type UserRoleType = 
  | 'warden' 
  | 'room_leader' 
  | 'floor_leader' 
  | 'youth_union' 
  | 'homeroom' 
  | 'admin';

export interface UserSession {
  role: UserRoleType;
  username: string;
  displayName: string;
  dutyTitle: string;
  dutySummary: string;
  mandates: string[];
  allowedTabs: string[];
  className?: string;
  building?: 'Nam' | 'Nữ';
  roomNumber?: string;
  floor?: number;
}

export interface Student {
  id: string;
  name: string;
  gender: 'Nam' | 'Nữ';
  birthDate: string;
  class: string;
  teacher: string;
  address: string;
  cccd: string;
  studentPhone: string;
  parentPhone: string;
  isBoarding: boolean;
  dormBuilding?: 'Nam' | 'Nữ';
  room?: string;
  floor?: number;
  isRoomLeader?: boolean;
  status?: 'present' | 'absent_excused' | 'absent_unexcused' | 'late';
  kpiScore?: number;
  violationCount?: number;
  academicStatus?: 'studying' | 'graduated';
  academicYear?: string;
}

export interface ViolationRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  isBoarding: boolean;
  room?: string;
  building?: 'Nam' | 'Nữ';
  date: string;
  time: string;
  code: string;
  title: string;
  penaltyPoints: number;
  note: string;
  recordedBy: string;
  status: 'recorded' | 'parent_notified' | 'expelled_from_dorm';
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  room: string;
  building: 'Nam' | 'Nữ';
  leaveType: 'weekend_home' | 'evening_tutoring' | 'medical' | 'family_event';
  fromDate: string;
  toDate: string;
  fromTime: string;
  toTime: string;
  reason: string;
  parentContact: string;
  status: 'pending' | 'approved' | 'returned';
  approvedBy?: string;
}

export interface RoomInfo {
  roomNumber: string;
  building: 'Nam' | 'Nữ';
  floor: number;
  capacity: number;
  students: Student[];
  roomLeader?: Student;
  hygieneScore: number;
  status: 'clean' | 'warning' | 'violation';
}

export interface Regime {
  id: number;
  name: string;
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
  timeRange: string;
  description: string;
  supervisors: string;
  kpiCodeAffected?: string;
  detailedTasks: string[];
}

export interface KpiError {
  code: string;
  name: string;
  penalty: number;
  category: string;
  description: string;
}

export interface RoomReport {
  id: string;
  roomNumber: string;
  building: 'Nam' | 'Nữ';
  floor: number;
  reportedAt: string;
  reportedBy: string;
  totalStudents: number;
  presentCount: number;
  absentExcusedCount: number;
  absentUnexcusedCount: number;
  hygieneStatus: 'Tốt' | 'Khá' | 'Cần khắc phục';
  note: string;
  details: Array<{
    studentId: string;
    studentName: string;
    status: Student['status'];
    reason?: string;
  }>;
}

export interface FloorReport {
  id: string;
  floor: number;
  building: 'Nam' | 'Nữ';
  reportedAt: string;
  reportedBy: string;
  totalRooms: number;
  reportedRoomsCount: number;
  totalStudents: number;
  presentTotal: number;
  absentExcusedTotal: number;
  absentUnexcusedTotal: number;
  note: string;
}
