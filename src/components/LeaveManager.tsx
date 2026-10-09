import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Search, 
  Check, 
  Phone, 
  Home, 
  BookOpen, 
  HeartPulse, 
  X
} from 'lucide-react';
import { LeaveRequest, Student } from '../types';

interface LeaveManagerProps {
  leaveRequests: LeaveRequest[];
  students: Student[];
  onAddLeaveRequest: (request: Omit<LeaveRequest, 'id'>) => void;
  onUpdateLeaveStatus: (id: string, status: LeaveRequest['status'], approver?: string) => void;
}

export const LeaveManager: React.FC<LeaveManagerProps> = ({
  leaveRequests,
  students,
  onAddLeaveRequest,
  onUpdateLeaveStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('weekend_home');
  const [fromDate, setFromDate] = useState('2026-10-10');
  const [toDate, setToDate] = useState('2026-10-11');
  const [fromTime, setFromTime] = useState('17:30');
  const [toTime, setToTime] = useState('19:00');
  const [reason, setReason] = useState('');
  const [parentContact, setParentContact] = useState('');

  const studentSuggestions = useMemo(() => {
    if (!studentSearch.trim() || selectedStudent) return [];
    const term = studentSearch.toLowerCase();
    return students
      .filter(s => s.isBoarding)
      .filter(s => s.name.toLowerCase().includes(term) || (s.room && s.room.includes(term)))
      .slice(0, 5);
  }, [students, studentSearch, selectedStudent]);

  const filteredRequests = useMemo(() => {
    return leaveRequests.filter(req => {
      if (typeFilter !== 'all' && req.leaveType !== typeFilter) return false;
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          req.studentName.toLowerCase().includes(term) ||
          req.class.toLowerCase().includes(term) ||
          req.room.toLowerCase().includes(term) ||
          req.reason.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [leaveRequests, typeFilter, statusFilter, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    onAddLeaveRequest({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      class: selectedStudent.class,
      room: selectedStudent.room || '',
      building: selectedStudent.dormBuilding || 'Nam',
      leaveType,
      fromDate,
      toDate,
      fromTime,
      toTime,
      reason: reason || 'Có việc gia đình đã xin phép phụ huynh',
      parentContact: parentContact || selectedStudent.parentPhone,
      status: 'approved',
      approvedBy: 'Cán bộ Quản sinh KTX'
    });

    setShowAddModal(false);
    setSelectedStudent(null);
    setStudentSearch('');
    setReason('');
  };

  const getLeaveTypeBadge = (type: LeaveRequest['leaveType']) => {
    switch (type) {
      case 'weekend_home':
        return { label: 'Về quê cuối tuần', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: Home };
      case 'evening_tutoring':
        return { label: 'Học thêm tối', bg: 'bg-blue-50 text-blue-800 border-blue-200', icon: BookOpen };
      case 'medical':
        return { label: 'Y tế / Khám bệnh', bg: 'bg-rose-50 text-rose-800 border-rose-200', icon: HeartPulse };
      default:
        return { label: 'Việc gia đình', bg: 'bg-purple-50 text-purple-800 border-purple-200', icon: Calendar };
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Calendar className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Quản lý Đơn xin phép Ra / Vào Ký túc xá
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Kiểm soát học sinh về quê cuối tuần, đi học thêm buổi tối sau 17h30/18h00 và điểm danh trở lại phòng
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 self-start md:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo Đơn Xin Phép Mới</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Tất cả loại đơn</option>
              <option value="weekend_home">Về quê cuối tuần</option>
              <option value="evening_tutoring">Đi học thêm tối</option>
              <option value="medical">Khám bệnh / Y tế</option>
              <option value="family_event">Việc riêng gia đình</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Mọi trạng thái duyệt</option>
              <option value="approved">Đã phê duyệt</option>
              <option value="pending">Chờ phê duyệt</option>
              <option value="returned">Đã trở lại phòng KTX</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên học sinh, phòng, lý do..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.map(req => {
          const typeInfo = getLeaveTypeBadge(req.leaveType);
          const TypeIcon = typeInfo.icon;

          return (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`p-2 rounded-xl border ${typeInfo.bg}`}>
                      <TypeIcon className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{req.studentName}</h4>
                      <div className="text-xs text-slate-500">
                        Lớp {req.class} • P.{req.room} ({req.building})
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    req.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : req.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                  }`}>
                    {req.status === 'approved' ? 'Đã duyệt' : req.status === 'pending' ? 'Chờ duyệt' : 'Đã về phòng'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" /> Thời gian:
                    </span>
                    <span className="font-semibold">
                      {req.fromTime} ({req.fromDate}) → {req.toTime} ({req.toDate})
                    </span>
                  </div>

                  <div className="text-slate-700">
                    <span className="text-slate-500">Lý do: </span>
                    <span className="font-medium">{req.reason}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-slate-600">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600" /> SĐT Phụ huynh:
                    </span>
                    <span className="font-mono font-bold text-slate-800">{req.parentContact}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                {req.status === 'pending' && (
                  <button
                    onClick={() => onUpdateLeaveStatus(req.id, 'approved', 'Cán bộ Quản sinh')}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Phê duyệt đơn</span>
                  </button>
                )}

                {req.status === 'approved' && (
                  <button
                    onClick={() => onUpdateLeaveStatus(req.id, 'returned')}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã trở lại phòng KTX</span>
                  </button>
                )}

                {req.status === 'returned' && (
                  <div className="text-xs text-slate-400 italic text-center w-full py-1">
                    Đã hoàn thành chuyến đi
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredRequests.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          Không có đơn xin phép nào phù hợp với bộ lọc.
        </div>
      )}

      {/* Add Leave Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                Lập Đơn Xin Phép Ra / Vào KTX
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  1. Học sinh nội trú:
                </label>
                {selectedStudent ? (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-indigo-950 text-sm">{selectedStudent.name}</div>
                      <div className="text-indigo-700 mt-0.5">
                        Lớp {selectedStudent.class} • Phòng {selectedStudent.room} ({selectedStudent.dormBuilding})
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedStudent(null); setStudentSearch(''); }}
                      className="text-rose-600 font-semibold hover:underline cursor-pointer"
                    >
                      Đổi học sinh
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Gõ tên hoặc phòng KTX học sinh..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    {studentSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden divide-y divide-slate-100">
                        {studentSuggestions.map(s => (
                          <div
                            key={s.id}
                            onClick={() => {
                              setSelectedStudent(s);
                              setStudentSearch('');
                              setParentContact(s.parentPhone);
                            }}
                            className="p-2.5 hover:bg-indigo-50 cursor-pointer flex items-center justify-between"
                          >
                            <span className="font-bold text-slate-800">{s.name} ({s.class})</span>
                            <span className="text-slate-500 font-semibold">P.{s.room}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  2. Mục đích xin phép:
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="weekend_home">🏡 Về quê cuối tuần (Thứ Sáu - Chủ Nhật)</option>
                  <option value="evening_tutoring">📚 Học thêm tối (sau 17h30/18h00)</option>
                  <option value="medical">🏥 Đi viện / Khám sức khỏe</option>
                  <option value="family_event">👨‍👩‍👧 Việc đột xuất gia đình</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Từ ngày / Giờ rời KTX:</label>
                  <div className="flex gap-1">
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                    <input
                      type="time"
                      value={fromTime}
                      onChange={(e) => setFromTime(e.target.value)}
                      className="w-20 px-1 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Đến ngày / Giờ trở lại:</label>
                  <div className="flex gap-1">
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                    <input
                      type="time"
                      value={toTime}
                      onChange={(e) => setToTime(e.target.value)}
                      className="w-20 px-1 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  3. Lý do chi tiết:
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ghi rõ địa điểm đến, người đưa đón..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  4. SĐT Phụ huynh xác nhận:
                </label>
                <input
                  type="text"
                  value={parentContact}
                  onChange={(e) => setParentContact(e.target.value)}
                  placeholder="Số điện thoại Bố hoặc Mẹ..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!selectedStudent}
                  className="px-5 py-2 bg-blue-600 disabled:bg-slate-300 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Lưu & Phê Duyệt Đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
