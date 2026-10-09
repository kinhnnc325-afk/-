import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  PlusCircle, 
  Search, 
  FileText, 
  Trash2, 
  Printer, 
  Flame, 
  X
} from 'lucide-react';
import { ViolationRecord, Student } from '../types';
import { KPI_ERROR_DEFINITIONS, DORM_DISCIPLINE_LEVELS } from '../data/kpiRulesData';

interface KpiDisciplineProps {
  violations: ViolationRecord[];
  students: Student[];
  onAddViolation: (violation: Omit<ViolationRecord, 'id'>) => void;
  onDeleteViolation: (id: string) => void;
}

export const KpiDiscipline: React.FC<KpiDisciplineProps> = ({
  violations,
  students,
  onAddViolation,
  onDeleteViolation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCodeFilter, setSelectedCodeFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecordForPrint, setSelectedRecordForPrint] = useState<ViolationRecord | null>(null);

  const [formStudentSearch, setFormStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCode, setSelectedCode] = useState<string>('L07');
  const [formNote, setFormNote] = useState('');
  const [formRecordedBy, setFormRecordedBy] = useState('Thầy Quản sinh KTX');

  const filteredViolations = useMemo(() => {
    return violations.filter(v => {
      if (selectedCodeFilter !== 'all' && v.code !== selectedCodeFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          v.studentName.toLowerCase().includes(term) ||
          v.class.toLowerCase().includes(term) ||
          v.title.toLowerCase().includes(term) ||
          v.note.toLowerCase().includes(term) ||
          (v.room && v.room.includes(term))
        );
      }
      return true;
    });
  }, [violations, selectedCodeFilter, searchTerm]);

  const studentSuggestions = useMemo(() => {
    if (!formStudentSearch.trim() || selectedStudent) return [];
    const term = formStudentSearch.toLowerCase();
    return students.filter(s => 
      s.name.toLowerCase().includes(term) ||
      s.class.toLowerCase().includes(term) ||
      (s.room && s.room.includes(term))
    ).slice(0, 6);
  }, [students, formStudentSearch, selectedStudent]);

  const studentViolationsSummary = useMemo(() => {
    const map = new Map<string, number>();
    violations.forEach(v => {
      map.set(v.studentId, (map.get(v.studentId) || 0) + 1);
    });
    return map;
  }, [violations]);

  const criticalDormStudents = useMemo(() => {
    return students.filter(s => {
      const count = studentViolationsSummary.get(s.id) || 0;
      return count >= 2 && s.isBoarding;
    }).map(s => ({
      student: s,
      count: studentViolationsSummary.get(s.id) || 0
    }));
  }, [students, studentViolationsSummary]);

  const handleSubmitViolation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const errorDef = KPI_ERROR_DEFINITIONS.find(d => d.code === selectedCode) || KPI_ERROR_DEFINITIONS[0];
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const currentCount = (studentViolationsSummary.get(selectedStudent.id) || 0) + 1;
    let status: ViolationRecord['status'] = 'recorded';
    if (selectedCode === 'L10' || currentCount >= 3) {
      status = 'expelled_from_dorm';
    } else if (currentCount === 2) {
      status = 'parent_notified';
    }

    onAddViolation({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      class: selectedStudent.class,
      isBoarding: selectedStudent.isBoarding,
      room: selectedStudent.room,
      building: selectedStudent.dormBuilding,
      date: dateStr,
      time: timeStr,
      code: errorDef.code,
      title: errorDef.name,
      penaltyPoints: errorDef.penalty,
      note: formNote || errorDef.description,
      recordedBy: formRecordedBy,
      status
    });

    setShowAddModal(false);
    setSelectedStudent(null);
    setFormStudentSearch('');
    setFormNote('');
  };

  const handleDownloadFullKpiReport = () => {
    let csv = '\uFEFF';
    csv += 'BẢNG ĐÁNH GIÁ VÀ XẾP LOẠI THI ĐUA NỀN NẾP TOÀN TRƯỜNG NĂM HỌC 2026 - 2027\n';
    csv += 'TRƯỜNG THPT CHUYÊN HÙNG VƯƠNG - PHÚ THỌ\n\n';
    csv += 'DANH SÁCH VI PHẠM KỶ LUẬT VÀ TRỪ ĐIỂM KPI NỘI VỤ\n';
    csv += 'STT,Ngay,Gio,Ho_Va_Ten,Lop,Noi_Tru_KTX,Phong,Toa,Ma_Loi,Tieu_De,Diem_Tru,Nguoi_Ghi_Nhan,Trang_Thai\n';
    
    violations.forEach((v, idx) => {
      csv += `${idx + 1},"${v.date}","${v.time}","${v.studentName}","${v.class}","${v.isBoarding ? 'Có' : 'Không'}","${v.room || ''}","${v.building || ''}","${v.code}","${v.title}",${v.penaltyPoints},"${v.recordedBy}","${v.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Bang_Danh_Gia_KPI_Toan_Truong_CHV_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-[#002B7F]/20 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-50 text-rose-700">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold uppercase text-slate-900 tracking-tight">
                  Hệ thống Kỷ luật & Sổ Đánh giá KPI Rèn luyện Toàn trường
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Tích hợp số hóa 10 mã lỗi (L01 - L10) & Chế tài xử lý kỷ luật tích lũy KTX (Điều 6 & 7 Quy chế)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleDownloadFullKpiReport}
              className="px-4 py-2 bg-[#002B7F] hover:bg-blue-900 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-900/20 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>Tải Bảng Đánh Giá KPI (CSV/Excel)</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/20 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ghi nhận Vi phạm Mới</span>
            </button>
          </div>
        </div>

        {/* 3 Discipline Levels Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {DORM_DISCIPLINE_LEVELS.map(lvl => (
            <div
              key={lvl.level}
              className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                lvl.level === 1
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : lvl.level === 2
                    ? 'bg-orange-50/70 border-orange-200 text-orange-950'
                    : 'bg-rose-50/80 border-rose-300 text-rose-950 ring-1 ring-rose-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] uppercase tracking-wider">
                  Mức {lvl.level}: {lvl.condition}
                </span>
                <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-white/80">
                  {lvl.kpiDeduction}
                </span>
              </div>
              <div className="font-bold text-sm">{lvl.sanction}</div>
              <div className="text-[11px] opacity-80">{lvl.actionRequired}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Cumulative Warning Box */}
      {criticalDormStudents.length > 0 && (
        <div className="bg-gradient-to-r from-rose-900 to-red-950 text-white p-5 rounded-3xl shadow-lg border border-rose-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300">
              Cảnh báo Học sinh Nội trú Tích lũy Vi phạm (Theo Điều 7 Quy chế KTX)
            </h3>
          </div>
          <p className="text-xs text-rose-200">
            Học sinh vi phạm từ lần 2 phải lập biên bản mời phụ huynh; vi phạm lần 3 hoặc lỗi nghiêm trọng L10 bị chấm dứt quyền lưu trú KTX.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {criticalDormStudents.map(({ student, count }) => (
              <div
                key={student.id}
                className="bg-black/30 border border-rose-400/30 p-3 rounded-2xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{student.name}</span>
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {count} lần
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px] mt-0.5">
                    Lớp {student.class} • P.{student.room} ({student.dormBuilding})
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    count >= 3 ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-400 text-black'
                  }`}>
                    {count >= 3 ? 'Đề xuất trả phòng' : 'Mời phụ huynh'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Codes Reference Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Khung 10 Mã lỗi vi phạm theo Văn bản Nhà trường</span>
          <span className="text-[11px] font-normal text-slate-500">Mức trừ điểm KPI</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {KPI_ERROR_DEFINITIONS.map(err => (
            <div
              key={err.code}
              onClick={() => setSelectedCodeFilter(selectedCodeFilter === err.code ? 'all' : err.code)}
              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                selectedCodeFilter === err.code
                  ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-200'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 font-mono">{err.code}</span>
                <span className="font-black text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded text-[11px]">
                  {err.penalty}đ
                </span>
              </div>
              <div className="font-bold text-slate-800 mt-1 truncate" title={err.name}>
                {err.name}
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">
                {err.category}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Violation Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-3 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Nhật ký Vi phạm Kỷ luật & Trừ điểm KPI ({filteredViolations.length} vụ việc)
            </h3>
            <p className="text-xs text-slate-500">
              Đồng bộ dữ liệu trực tiếp từ 37 GV Chi đoàn trực Tòa A và Cán bộ Quản sinh 02 tòa KTX
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm học sinh, lớp, nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-60 pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {selectedCodeFilter !== 'all' && (
              <button
                onClick={() => setSelectedCodeFilter('all')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Xóa lọc ({selectedCodeFilter})
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">Thời gian</th>
                <th className="py-3 px-3">Học sinh</th>
                <th className="py-3 px-3">Lớp / KTX</th>
                <th className="py-3 px-3">Mã lỗi</th>
                <th className="py-3 px-3">Điểm KPI</th>
                <th className="py-3 px-3">Nội dung vi phạm chi tiết</th>
                <th className="py-3 px-3">Người ghi nhận</th>
                <th className="py-3 px-3 text-right">In / Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredViolations.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-bold text-slate-800">{v.time}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{v.date}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{v.studentName}</div>
                    <div className="text-[10px] text-slate-400">
                      {v.isBoarding ? `KTX ${v.building} • P.${v.room}` : 'Ngoại trú'}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                      {v.class}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                      {v.code}
                    </span>
                    <div className="text-[10px] text-slate-600 mt-0.5 font-medium">{v.title}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded-lg text-xs">
                      {v.penaltyPoints} điểm
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 max-w-xs">
                    <p className="line-clamp-2" title={v.note}>{v.note}</p>
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                    {v.recordedBy}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedRecordForPrint(v)}
                        title="In biên bản kỷ luật"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteViolation(v.id)}
                        title="Xóa biên bản"
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredViolations.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-xs">
            Chưa có ghi nhận vi phạm nào phù hợp với bộ lọc hiện tại.
          </div>
        )}
      </div>

      {/* Modal: Ghi nhận Vi phạm mới */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-rose-900 to-red-950 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Lập Biên bản Ghi nhận Vi phạm KPI
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitViolation} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  1. Học sinh vi phạm:
                </label>
                {selectedStudent ? (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-indigo-950 text-sm">{selectedStudent.name}</div>
                      <div className="text-xs text-indigo-700 mt-0.5">
                        Lớp {selectedStudent.class} • {selectedStudent.isBoarding ? `KTX ${selectedStudent.dormBuilding} P.${selectedStudent.room}` : 'Ngoại trú'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedStudent(null); setFormStudentSearch(''); }}
                      className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer"
                    >
                      Đổi học sinh
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Gõ tên học sinh, lớp hoặc phòng KTX để tìm..."
                      value={formStudentSearch}
                      onChange={(e) => setFormStudentSearch(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    {studentSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden divide-y divide-slate-100">
                        {studentSuggestions.map(s => (
                          <div
                            key={s.id}
                            onClick={() => { setSelectedStudent(s); setFormStudentSearch(''); }}
                            className="p-2.5 hover:bg-indigo-50 cursor-pointer text-xs flex items-center justify-between"
                          >
                            <span className="font-bold text-slate-800">{s.name} ({s.class})</span>
                            <span className="text-slate-400 text-[11px]">
                              {s.isBoarding ? `P.${s.room}` : 'Ngoại trú'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  2. Khung mã lỗi vi phạm (L01 - L10):
                </label>
                <select
                  value={selectedCode}
                  onChange={(e) => setSelectedCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {KPI_ERROR_DEFINITIONS.map(err => (
                    <option key={err.code} value={err.code}>
                      {err.code} - {err.name} ({err.penalty} điểm)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  3. Mô tả hành vi & Diễn biến vi phạm:
                </label>
                <textarea
                  rows={3}
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Ví dụ: Chăn màn không gấp khi Trưởng tầng kiểm tra 06h00..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  4. Cán bộ / Giáo viên ghi nhận:
                </label>
                <input
                  type="text"
                  value={formRecordedBy}
                  onChange={(e) => setFormRecordedBy(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={!selectedStudent}
                  className="px-5 py-2 bg-rose-600 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-all shadow-md shadow-rose-600/20 cursor-pointer"
                >
                  Lưu & Trừ điểm KPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Notice Modal */}
      {selectedRecordForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full border border-slate-200 space-y-6 shadow-2xl">
            <div className="text-center space-y-1 border-b pb-4 border-slate-200">
              <div className="text-xs font-bold text-slate-600 uppercase">
                SỞ GIÁO DỤC VÀ ĐÀO TẠO PHÚ THỌ
              </div>
              <div className="text-sm font-black text-slate-900 uppercase">
                TRƯỜNG THPT CHUYÊN HÙNG VƯƠNG
              </div>
              <div className="text-xs italic text-slate-500">
                Phú Thọ, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </div>
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                BIÊN BẢN VI PHẠM KỶ LUẬT & NỀN NẾP
              </h4>
              <p className="text-xs text-slate-600">
                (Áp dụng theo Quy chế Quản lý KTX và Hướng dẫn điểm danh số 2026/CHV)
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-2 border border-slate-200">
              <div>• <strong>Học sinh:</strong> {selectedRecordForPrint.studentName}</div>
              <div>• <strong>Lớp:</strong> {selectedRecordForPrint.class}</div>
              <div>• <strong>Nội trú KTX:</strong> {selectedRecordForPrint.isBoarding ? `Phòng ${selectedRecordForPrint.room} (Tòa ${selectedRecordForPrint.building})` : 'Ngoại trú'}</div>
              <div>• <strong>Thời gian vi phạm:</strong> {selectedRecordForPrint.time} ngày {selectedRecordForPrint.date}</div>
              <div>• <strong>Hành vi vi phạm:</strong> {selectedRecordForPrint.code} - {selectedRecordForPrint.title}</div>
              <div>• <strong>Mô tả chi tiết:</strong> {selectedRecordForPrint.note}</div>
              <div>• <strong>Hình thức xử lý:</strong> Trừ {Math.abs(selectedRecordForPrint.penaltyPoints)} điểm KPI rèn luyện tuần</div>
            </div>

            <div className="grid grid-cols-2 text-center text-xs pt-4">
              <div>
                <div className="font-bold text-slate-700">HỌC SINH VI PHẠM</div>
                <div className="text-[10px] text-slate-400 italic">(Ký và ghi rõ họ tên)</div>
                <div className="h-16"></div>
                <div className="font-semibold text-slate-800">{selectedRecordForPrint.studentName}</div>
              </div>

              <div>
                <div className="font-bold text-slate-700">CÁN BỘ / GIÁO VIÊN LẬP BIÊN BẢN</div>
                <div className="text-[10px] text-slate-400 italic">(Ký và ghi rõ họ tên)</div>
                <div className="h-16"></div>
                <div className="font-semibold text-slate-800">{selectedRecordForPrint.recordedBy}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedRecordForPrint(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Đóng lại
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Biên bản</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
