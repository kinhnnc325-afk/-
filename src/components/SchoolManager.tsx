import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  Building2, 
  FileText, 
  ArrowRight,
  Smartphone
} from 'lucide-react';
import { Student } from '../types';
import { CLASSES_LIST, CLASS_TEACHERS } from '../data/schoolConfig';

interface SchoolManagerProps {
  students: Student[];
  onRecordViolation: (student: Student, defaultCode?: string) => void;
  onUpdateStatus: (studentId: string, status: Student['status']) => void;
}

export const SchoolManager: React.FC<SchoolManagerProps> = ({
  students,
  onRecordViolation,
  onUpdateStatus
}) => {
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [boardingFilter, setBoardingFilter] = useState<'all' | 'boarding' | 'day'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'roster' | 'duty_check'>('roster');

  const [dutyStep, setDutyStep] = useState<number>(1);
  const [selectedDutyClass, setSelectedDutyClass] = useState<string>('10 Toán A');
  const [boardCountInput, setBoardCountInput] = useState<string>('35');
  const [phoneBoxCollected, setPhoneBoxCollected] = useState<boolean>(true);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const grade = parseInt(s.class.substring(0, 2), 10);
      if (selectedGrade !== 'all' && grade !== selectedGrade) return false;
      if (selectedClass !== 'all' && s.class !== selectedClass) return false;
      if (boardingFilter === 'boarding' && !s.isBoarding) return false;
      if (boardingFilter === 'day' && s.isBoarding) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          s.name.toLowerCase().includes(term) ||
          s.class.toLowerCase().includes(term) ||
          s.address.toLowerCase().includes(term) ||
          s.cccd.includes(term) ||
          s.studentPhone.includes(term) ||
          (s.room && s.room.includes(term))
        );
      }
      return true;
    });
  }, [students, selectedGrade, selectedClass, boardingFilter, searchTerm]);

  const stats = useMemo(() => {
    const total = students.length;
    const boarding = students.filter(s => s.isBoarding).length;
    const day = total - boarding;
    const k10 = students.filter(s => s.class.startsWith('10')).length;
    const k11 = students.filter(s => s.class.startsWith('11')).length;
    const k12 = students.filter(s => s.class.startsWith('12')).length;

    return { total, boarding, day, k10, k11, k12 };
  }, [students]);

  const dutyClassStudents = useMemo(() => {
    return students.filter(s => s.class === selectedDutyClass);
  }, [students, selectedDutyClass]);

  const handleRecordLate = (student: Student) => {
    onRecordViolation(student, 'L01');
    onUpdateStatus(student.id, 'late');
  };

  const handleRecordUniformCard = (student: Student) => {
    onRecordViolation(student, 'L02');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <GraduationCap className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Học sinh Toàn trường & Điểm danh Tòa A
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Quản lý 54 lớp khối chuyên (1.880 học sinh) và quy trình trực ban đầu giờ Tòa nhà A (06h55 - 07h15)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => setViewMode('roster')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'roster'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Danh sách 1.880 Học sinh</span>
            </button>

            <button
              onClick={() => setViewMode('duty_check')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'duty_check'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Trực ban Tòa A (06h55 - 07h15)</span>
            </button>
          </div>
        </div>

        {/* Global Summary Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[11px] font-medium text-slate-500">Toàn trường</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.total} HS</div>
            <div className="text-[10px] text-slate-400">54 Lớp Chuyên</div>
          </div>

          <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3">
            <div className="text-[11px] font-medium text-indigo-700">Nội trú KTX</div>
            <div className="text-xl font-extrabold text-indigo-700 mt-0.5">{stats.boarding} HS</div>
            <div className="text-[10px] text-indigo-600">37% học sinh trường</div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3">
            <div className="text-[11px] font-medium text-emerald-700">Ngoại trú</div>
            <div className="text-xl font-extrabold text-emerald-700 mt-0.5">{stats.day} HS</div>
            <div className="text-[10px] text-emerald-600">Đi về trong ngày</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[11px] font-medium text-slate-500">Khối 10 (Cụm 1)</div>
            <div className="text-xl font-extrabold text-slate-800 mt-0.5">{stats.k10} HS</div>
            <div className="text-[10px] text-slate-400">17 lớp chuyên</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[11px] font-medium text-slate-500">Khối 11 (Cụm 2)</div>
            <div className="text-xl font-extrabold text-slate-800 mt-0.5">{stats.k11} HS</div>
            <div className="text-[10px] text-slate-400">17 lớp chuyên</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[11px] font-medium text-slate-500">Khối 12 (Cụm 3)</div>
            <div className="text-xl font-extrabold text-slate-800 mt-0.5">{stats.k12} HS</div>
            <div className="text-[10px] text-slate-400">20 lớp chuyên</div>
          </div>
        </div>
      </div>

      {/* MODE 1: ROSTER VIEW */}
      {viewMode === 'roster' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Khối:
                </span>
                <button
                  onClick={() => { setSelectedGrade('all'); setSelectedClass('all'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGrade === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tất cả các khối
                </button>
                <button
                  onClick={() => { setSelectedGrade(10); setSelectedClass('all'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGrade === 10 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Khối 10 (17 lớp)
                </button>
                <button
                  onClick={() => { setSelectedGrade(11); setSelectedClass('all'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGrade === 11 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Khối 11 (17 lớp)
                </button>
                <button
                  onClick={() => { setSelectedGrade(12); setSelectedClass('all'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGrade === 12 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Khối 12 (20 lớp)
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setBoardingFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    boardingFilter === 'all' ? 'bg-indigo-100 text-indigo-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Tất cả ({stats.total})
                </button>
                <button
                  onClick={() => setBoardingFilter('boarding')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    boardingFilter === 'boarding' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🏢 Nội trú KTX ({stats.boarding})
                </button>
                <button
                  onClick={() => setBoardingFilter('day')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    boardingFilter === 'day' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🏡 Ngoại trú ({stats.day})
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Lớp:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="all">Tất cả 54 lớp chuyên</option>
                  {CLASSES_LIST.map(c => (
                    <option key={c} value={c}>
                      {c} ({CLASS_TEACHERS[c] || 'GVCN'})
                    </option>
                  ))}
                </select>
                {selectedClass !== 'all' && (
                  <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg font-medium">
                    GVCN: {CLASS_TEACHERS[selectedClass]}
                  </span>
                )}
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm học sinh, số CCCD, phòng KTX..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-80 pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Table of Students */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">STT</th>
                    <th className="py-3 px-4">Họ và tên</th>
                    <th className="py-3 px-4">Lớp</th>
                    <th className="py-3 px-4">Loại hình</th>
                    <th className="py-3 px-4">Phòng KTX</th>
                    <th className="py-3 px-4">Quê quán</th>
                    <th className="py-3 px-4">SĐT Học sinh</th>
                    <th className="py-3 px-4">SĐT Bố/Mẹ</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.slice(0, 150).map((student, idx) => (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{student.name}</span>
                          {student.isRoomLeader && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                              TP
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {student.birthDate} • {student.gender} • CCCD: {student.cccd}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                          {student.class}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{student.teacher}</div>
                      </td>
                      <td className="py-3 px-4">
                        {student.isBoarding ? (
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                            <Building2 className="w-3 h-3" /> Nội trú KTX
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] px-2 py-0.5 rounded-full w-max block">
                            Ngoại trú
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {student.isBoarding ? (
                          <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                            P. {student.room} ({student.dormBuilding})
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-[160px] truncate" title={student.address}>
                        {student.address}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        <a href={`tel:${student.studentPhone}`} className="hover:text-blue-600">
                          {student.studentPhone}
                        </a>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        <a href={`tel:${student.parentPhone}`} className="hover:text-emerald-600 font-semibold">
                          {student.parentPhone}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleRecordLate(student)}
                            title="Ghi muộn đầu giờ (L01)"
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Đi muộn
                          </button>
                          <button
                            onClick={() => onRecordViolation(student)}
                            title="Ghi lỗi vi phạm KPI"
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Vi phạm
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStudents.length > 150 && (
              <div className="p-3 bg-slate-50 text-center text-xs text-slate-500 border-t border-slate-200">
                Đang hiển thị 150 / {filteredStudents.length} học sinh. Dùng bộ lọc hoặc tìm kiếm để xem cụ thể.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: DUTY CHECK AT BUILDING A (06h55 - 07h15) */}
      {viewMode === 'duty_check' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-blue-500/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  Hướng dẫn số /HD-CHV • 13/10/2026
                </span>
                <h3 className="text-xl font-bold mt-2">
                  Quy trình Điểm danh & Kiểm tra Nền nếp Đầu giờ Tòa nhà A
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                  Khung thời gian từ <strong>06h55 đến 07h15</strong> hàng ngày. Huy động 37 đoàn viên Giáo viên Chi đoàn 
                  và 04 đồng chí nòng cốt Ban Chấp hành Đoàn trường trực ban đối soát sĩ số 54 phòng học.
                </p>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 text-xs space-y-1.5 flex-shrink-0">
                <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Mốc thời gian cốt tử:
                </div>
                <div>• 07h00: Khóa sổ đi muộn (Mã L01)</div>
                <div>• 07h15: Quản sinh niêm phong cửa KTX</div>
                <div>• 07h15: Gửi cảnh báo GVCN nếu vắng</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => setDutyStep(1)}
                className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                  dutyStep === 1 
                    ? 'bg-blue-600/90 border-blue-400 shadow-md ring-2 ring-blue-300' 
                    : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="text-[10px] font-bold text-blue-200 uppercase">Bước 1 (06h55 - 07h02)</div>
                <div className="text-xs font-bold text-white mt-0.5">Sĩ số góc bảng lớp</div>
                <div className="text-[10px] text-slate-300 mt-0.5">Lớp trưởng ghi nhận</div>
              </button>

              <button
                onClick={() => setDutyStep(2)}
                className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                  dutyStep === 2 
                    ? 'bg-blue-600/90 border-blue-400 shadow-md ring-2 ring-blue-300' 
                    : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="text-[10px] font-bold text-blue-200 uppercase">Bước 2 (07h02 - 07h05)</div>
                <div className="text-xs font-bold text-white mt-0.5">Truy bài 15 phút</div>
                <div className="text-[10px] text-slate-300 mt-0.5">Thu gom hộp điện thoại</div>
              </button>

              <button
                onClick={() => setDutyStep(3)}
                className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                  dutyStep === 3 
                    ? 'bg-blue-600/90 border-blue-400 shadow-md ring-2 ring-blue-300' 
                    : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="text-[10px] font-bold text-blue-200 uppercase">Bước 3 (07h05 - 07h12)</div>
                <div className="text-xs font-bold text-white mt-0.5">Kiểm tra thực tế phòng</div>
                <div className="text-[10px] text-slate-300 mt-0.5">Bắt lỗi L01, L02, L04, L05</div>
              </button>

              <button
                onClick={() => setDutyStep(4)}
                className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                  dutyStep === 4 
                    ? 'bg-blue-600/90 border-blue-400 shadow-md ring-2 ring-blue-300' 
                    : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="text-[10px] font-bold text-blue-200 uppercase">Bước 4 (07h12 - 07h15)</div>
                <div className="text-xs font-bold text-white mt-0.5">Khóa KTX & Lưu KPI</div>
                <div className="text-[10px] text-slate-300 mt-0.5">Gửi tín hiệu tới GVCN</div>
              </button>
            </div>
          </div>

          {/* Interactive Class Checklist during Duty */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-500">Chọn phòng học cần kiểm tra:</span>
                <div className="flex items-center gap-2 mt-1">
                  <select
                    value={selectedDutyClass}
                    onChange={(e) => setSelectedDutyClass(e.target.value)}
                    className="text-base font-bold bg-indigo-50 text-indigo-950 border border-indigo-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {CLASSES_LIST.map(c => (
                      <option key={c} value={c}>
                        Lớp {c} (GVCN: {CLASS_TEACHERS[c]})
                      </option>
                    ))}
                  </select>
                  <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1.5 rounded-xl">
                    Sĩ số danh sách: {dutyClassStudents.length} HS
                  </span>
                </div>
              </div>

              <div className="text-xs text-right">
                <span className="text-slate-400 block">GV Chi đoàn phụ trách:</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg inline-block mt-0.5">
                  Đoàn viên Giáo viên Chi đoàn trường
                </span>
              </div>
            </div>

            {dutyStep === 1 && (
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                  Bước 1: Chuẩn bị và ghi nhận sĩ số góc bảng (06h55 - 07h02)
                </h4>
                <p className="text-xs text-slate-600">
                  Lớp trưởng kiểm diện thành viên và ghi rõ: Tổng số, Có mặt, Vắng mặt (kèm lý do) lên góc trên bên phải bảng lớp.
                </p>

                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 max-w-md">
                  <label className="text-xs font-semibold text-slate-700">
                    Sĩ số ghi trên bảng:
                  </label>
                  <input
                    type="number"
                    value={boardCountInput}
                    onChange={(e) => setBoardCountInput(e.target.value)}
                    className="w-20 px-3 py-1.5 text-sm font-bold border border-slate-300 rounded-lg text-center"
                  />
                  <span className="text-xs text-slate-500">/ {dutyClassStudents.length} học sinh</span>
                </div>

                <button
                  onClick={() => setDutyStep(2)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-all cursor-pointer"
                >
                  <span>Xác nhận & Chuyển sang Bước 2</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {dutyStep === 2 && (
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
                  Bước 2: Ổn định nền nếp 15 phút truy bài (07h02 - 07h05)
                </h4>
                <p className="text-xs text-slate-600">
                  Ban Cán sự lớp đôn đốc học sinh chỉnh đốn trang phục, đeo thẻ học sinh và lưu giữ toàn bộ điện thoại vào hộp tập trung của lớp.
                </p>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={phoneBoxCollected}
                      onChange={(e) => setPhoneBoxCollected(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-indigo-600" />
                      Đã thu hồi 100% điện thoại di động vào hộp quản lý tập trung của lớp
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDutyStep(1)}
                    className="px-3 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={() => setDutyStep(3)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    <span>Chuyển sang Bước 3: Đối soát thực tế</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {dutyStep === 3 && (
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">3</span>
                  Bước 3: Kiểm tra thực tế tại phòng học (07h05 - 07h12)
                </h4>
                <p className="text-xs text-slate-600">
                  Đối soát học sinh vắng mặt, ghi nhận học sinh vào lớp sau 07h00 (L01), mặc sai đồng phục/thẻ (L02).
                </p>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700">Danh sách học sinh lớp {selectedDutyClass}:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                    {dutyClassStudents.map(student => (
                      <div
                        key={student.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                          student.status === 'late'
                            ? 'bg-amber-50 border-amber-300'
                            : 'bg-slate-50 border-slate-100 hover:bg-indigo-50/50'
                        }`}
                      >
                        <div className="truncate">
                          <div className="font-semibold text-slate-900 truncate">{student.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {student.isBoarding ? `P.${student.room}` : 'Ngoại trú'}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleRecordLate(student)}
                            title="Ghi muộn L01 (-1đ)"
                            className="px-1.5 py-0.5 bg-amber-200 hover:bg-amber-300 text-amber-900 text-[10px] font-bold rounded cursor-pointer"
                          >
                            Muộn
                          </button>
                          <button
                            onClick={() => handleRecordUniformCard(student)}
                            title="Lỗi thẻ/áo L02 (-3đ)"
                            className="px-1.5 py-0.5 bg-rose-200 hover:bg-rose-300 text-rose-900 text-[10px] font-bold rounded cursor-pointer"
                          >
                            Thẻ/Áo
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDutyStep(2)}
                    className="px-3 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={() => setDutyStep(4)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    <span>Hoàn thành & Sang Bước 4</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {dutyStep === 4 && (
              <div className="space-y-4 bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200">
                <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">4</span>
                  Bước 4: Cập nhật dữ liệu số hóa & Đóng cổng KTX (07h12 - 07h15)
                </h4>
                <p className="text-xs text-emerald-800">
                  Dữ liệu vi phạm đã được đồng bộ vào hệ thống Sổ đánh giá KPI rèn luyện. Đúng 07h15, Cán bộ Quản sinh thực hiện khóa cửa chính KTX và niêm phong trong giờ học.
                </p>

                <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Đã kiểm diện lớp {selectedDutyClass} (Sĩ số: {boardCountInput}/{dutyClassStudents.length})
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Tự động gửi thông báo tới GVCN {CLASS_TEACHERS[selectedDutyClass]}.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDutyStep(1)}
                    className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-all cursor-pointer"
                  >
                    Kiểm tra phòng học tiếp theo
                  </button>
                  <button
                    onClick={() => setViewMode('roster')}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Về danh sách toàn trường
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
