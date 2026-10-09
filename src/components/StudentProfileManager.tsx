import React, { useState, useMemo } from 'react';
import { 
  UserPlus, 
  Trash2, 
  GraduationCap, 
  Search, 
  Filter, 
  Users, 
  AlertTriangle, 
  FileSpreadsheet, 
  History, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Student } from '../types';
import { CLASSES_LIST, CLASS_TEACHERS } from '../data/schoolConfig';

interface StudentProfileManagerProps {
  students: Student[];
  onAddStudent: (newStudent: Student) => void;
  onBatchAddStudents: (newStudents: Student[]) => void;
  onDeleteStudent: (studentId: string) => void;
  onBatchDeleteStudents: (studentIds: string[]) => void;
  onPromoteByGrade: (fromGrade: number, toGrade: number | 'graduate') => void;
  onPromoteByClass: (fromClass: string, toClass: string | 'graduate') => void;
  onPromoteIndividual: (studentId: string, newClass: string | 'graduate') => void;
  onRestoreStudent?: (studentId: string) => void;
}

export const StudentProfileManager: React.FC<StudentProfileManagerProps> = ({
  students,
  onAddStudent,
  onBatchAddStudents,
  onDeleteStudent,
  onBatchDeleteStudents,
  onPromoteByGrade,
  onPromoteByClass,
  onPromoteIndividual,
  onRestoreStudent
}) => {
  const [subTab, setSubTab] = useState<'roster' | 'add_single' | 'batch_import' | 'promotion' | 'graduated'>('roster');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number | 'all'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'studying' | 'graduated' | 'all'>('studying');

  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Single Add Form
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [birthDate, setBirthDate] = useState('15/08/2011');
  const [className, setClassName] = useState('10 Toán A');
  const [address, setAddress] = useState('Cẩm Khê - Phú Thọ');
  const [cccd, setCccd] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [isBoarding, setIsBoarding] = useState(true);
  const [dormBuilding, setDormBuilding] = useState<'Nam' | 'Nữ'>('Nam');
  const [room, setRoom] = useState('2.1');
  const [isRoomLeader, setIsRoomLeader] = useState(false);

  // Batch import
  const [batchCsvText, setBatchCsvText] = useState('');
  const [batchParsePreview, setBatchParsePreview] = useState<Student[]>([]);
  const [batchError, setBatchError] = useState('');

  // Promotion
  const [promotionMode, setPromotionMode] = useState<'grade' | 'class' | 'individual'>('grade');
  const [selectedFromClass, setSelectedFromClass] = useState<string>('12 Toán A');
  const [selectedTargetClassAction, setSelectedTargetClassAction] = useState<string>('graduate');
  const [selectedIndividualId, setSelectedIndividualId] = useState<string>('');
  const [individualTargetAction, setIndividualTargetAction] = useState<string>('graduate');

  const activeStudentsList = useMemo(() => {
    return students.filter(s => {
      const status = s.academicStatus || 'studying';
      if (selectedStatusFilter !== 'all' && status !== selectedStatusFilter) return false;

      const grade = parseInt(s.class.substring(0, 2), 10);
      if (selectedGradeFilter !== 'all' && grade !== selectedGradeFilter) return false;

      if (selectedClassFilter !== 'all' && s.class !== selectedClassFilter) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          s.name.toLowerCase().includes(term) ||
          s.class.toLowerCase().includes(term) ||
          s.address.toLowerCase().includes(term) ||
          s.cccd.includes(term) ||
          (s.room && s.room.includes(term))
        );
      }
      return true;
    });
  }, [students, selectedStatusFilter, selectedGradeFilter, selectedClassFilter, searchTerm]);

  const graduatedCount = useMemo(() => {
    return students.filter(s => s.academicStatus === 'graduated').length;
  }, [students]);

  const handleSingleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const teacher = CLASS_TEACHERS[className] || 'GVCN';
    const floor = isBoarding && room ? parseInt(room.split('.')[0], 10) || 2 : undefined;
    const newId = `STU_${Date.now()}`;

    const newStudent: Student = {
      id: newId,
      name: name.trim(),
      gender,
      birthDate: birthDate.trim(),
      class: className,
      teacher,
      address: address.trim(),
      cccd: cccd.trim() || `025${gender === 'Nam' ? '2' : '3'}1100${Math.floor(100000 + Math.random() * 900000)}`,
      studentPhone: studentPhone.trim() || '0981234567',
      parentPhone: parentPhone.trim() || '0381234567',
      isBoarding,
      dormBuilding: isBoarding ? dormBuilding : undefined,
      room: isBoarding ? room.trim() : undefined,
      floor,
      isRoomLeader,
      status: 'present',
      kpiScore: 100,
      violationCount: 0,
      academicStatus: 'studying',
      academicYear: '2026-2027'
    };

    onAddStudent(newStudent);
    setName('');
    setCccd('');
    setStudentPhone('');
    setParentPhone('');
    setSubTab('roster');
  };

  const handleParseBatchCsv = () => {
    setBatchError('');
    if (!batchCsvText.trim()) {
      setBatchError('Vui lòng dán dữ liệu danh sách học sinh vào ô văn bản.');
      return;
    }

    try {
      const lines = batchCsvText.trim().split('\n');
      const parsed: Student[] = [];

      lines.forEach((line, index) => {
        if (!line.trim()) return;
        const delimiter = line.includes(';') ? ';' : line.includes('\t') ? '\t' : ',';
        const cols = line.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
        
        if (index === 0 && (cols[0].toLowerCase().includes('stt') || cols[0].toLowerCase().includes('họ'))) {
          return;
        }

        const sName = cols[0] || `Học sinh ${index}`;
        const sClass = cols[1] || '10 Toán A';
        const sGender: 'Nam' | 'Nữ' = (cols[2] && cols[2].toLowerCase() === 'nữ') ? 'Nữ' : 'Nam';
        const sBirth = cols[3] || '01/01/2011';
        const sAddress = cols[4] || 'Phú Thọ';
        const sPhone = cols[5] || '0981000000';
        const pPhone = cols[6] || '0381000000';
        const sRoom = cols[7] || '';
        const isB = !!sRoom;
        const bld = isB ? (sGender === 'Nam' ? 'Nam' : 'Nữ') : undefined;

        parsed.push({
          id: `BATCH_${Date.now()}_${index}`,
          name: sName,
          class: sClass,
          gender: sGender,
          birthDate: sBirth,
          address: sAddress,
          teacher: CLASS_TEACHERS[sClass] || 'GVCN',
          cccd: `025${sGender === 'Nam' ? '2' : '3'}1100${Math.floor(100000 + Math.random() * 900000)}`,
          studentPhone: sPhone,
          parentPhone: pPhone,
          isBoarding: isB,
          room: sRoom || undefined,
          dormBuilding: bld,
          floor: sRoom ? parseInt(sRoom.split('.')[0], 10) || 2 : undefined,
          isRoomLeader: false,
          status: 'present',
          kpiScore: 100,
          violationCount: 0,
          academicStatus: 'studying',
          academicYear: '2026-2027'
        });
      });

      if (parsed.length === 0) {
        setBatchError('Không tìm thấy dòng học sinh hợp lệ nào.');
        return;
      }

      setBatchParsePreview(parsed);
    } catch (err: any) {
      setBatchError('Lỗi xử lý dữ liệu: ' + err.message);
    }
  };

  const handleConfirmBatchAdd = () => {
    if (batchParsePreview.length === 0) return;
    onBatchAddStudents(batchParsePreview);
    setBatchParsePreview([]);
    setBatchCsvText('');
    setSubTab('roster');
  };

  const toggleSelectStudent = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudentIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.size === activeStudentsList.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(activeStudentsList.map(s => s.id)));
    }
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      onDeleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  const handleConfirmBulkDelete = () => {
    if (selectedStudentIds.size > 0) {
      onBatchDeleteStudents(Array.from(selectedStudentIds));
      setSelectedStudentIds(new Set());
      setShowBulkDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <Users className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Quản lý Hồ sơ Học sinh & Lên lớp / Ra trường
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Thêm học sinh mới, xóa học sinh, thuyên chuyển lớp, xử lý tốt nghiệp ra trường theo Khối, Lớp hoặc Cá nhân
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1">
            <button
              onClick={() => { setSubTab('roster'); setSelectedStatusFilter('studying'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                subTab === 'roster' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Danh sách ({students.filter(s => (s.academicStatus || 'studying') === 'studying').length})</span>
            </button>

            <button
              onClick={() => setSubTab('add_single')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                subTab === 'add_single' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Thêm mới</span>
            </button>

            <button
              onClick={() => setSubTab('batch_import')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                subTab === 'batch_import' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Nhập hàng loạt (CSV)</span>
            </button>

            <button
              onClick={() => setSubTab('promotion')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                subTab === 'promotion' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Lên lớp / Ra trường</span>
            </button>

            <button
              onClick={() => { setSubTab('graduated'); setSelectedStatusFilter('graduated'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                subTab === 'graduated' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Đã tốt nghiệp ({graduatedCount})</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
            <div className="text-[11px] text-slate-500 font-medium">Học sinh đang học</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {students.filter(s => (s.academicStatus || 'studying') === 'studying').length} HS
            </div>
            <div className="text-[10px] text-slate-400">54 Lớp Chuyên</div>
          </div>

          <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-3">
            <div className="text-[11px] text-blue-700 font-medium">Đang ở KTX Nội trú</div>
            <div className="text-xl font-black text-blue-700 mt-0.5">
              {students.filter(s => s.isBoarding && (s.academicStatus || 'studying') === 'studying').length} HS
            </div>
            <div className="text-[10px] text-blue-600">335 Nam • 364 Nữ</div>
          </div>

          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3">
            <div className="text-[11px] text-amber-700 font-medium">Đã tốt nghiệp ra trường</div>
            <div className="text-xl font-black text-amber-700 mt-0.5">{graduatedCount} HS</div>
            <div className="text-[10px] text-amber-600">Lưu trữ niên khóa cũ</div>
          </div>

          <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-3">
            <div className="text-[11px] text-indigo-700 font-medium">Đã chọn để thao tác</div>
            <div className="text-xl font-black text-indigo-700 mt-0.5">{selectedStudentIds.size} HS</div>
            <div className="text-[10px] text-indigo-600">Chọn qua checkbox</div>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: ROSTER VIEW & BULK DELETE */}
      {(subTab === 'roster' || subTab === 'graduated') && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Khối:
                </span>
                <button
                  onClick={() => { setSelectedGradeFilter('all'); setSelectedClassFilter('all'); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    selectedGradeFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => { setSelectedGradeFilter(10); setSelectedClassFilter('all'); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    selectedGradeFilter === 10 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Khối 10
                </button>
                <button
                  onClick={() => { setSelectedGradeFilter(11); setSelectedClassFilter('all'); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    selectedGradeFilter === 11 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Khối 11
                </button>
                <button
                  onClick={() => { setSelectedGradeFilter(12); setSelectedClassFilter('all'); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    selectedGradeFilter === 12 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Khối 12
                </button>

                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 focus:outline-none ml-2 cursor-pointer"
                >
                  <option value="all">Lọc theo 54 lớp chuyên</option>
                  {CLASSES_LIST.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {selectedStudentIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBulkDeleteConfirm(true)}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa hàng loạt ({selectedStudentIds.size} HS)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="relative pt-2 border-t border-slate-100">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm nhanh học sinh theo tên, lớp, phòng KTX, số CCCD..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.size > 0 && selectedStudentIds.size === activeStudentsList.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3">Họ và tên</th>
                    <th className="py-3 px-3">Lớp & GVCN</th>
                    <th className="py-3 px-3">Loại hình</th>
                    <th className="py-3 px-3">Phòng KTX</th>
                    <th className="py-3 px-3">Quê quán</th>
                    <th className="py-3 px-3">SĐT Phụ huynh</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeStudentsList.slice(0, 100).map(s => {
                    const isSelected = selectedStudentIds.has(s.id);

                    return (
                      <tr key={s.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-indigo-50/50' : ''}`}>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectStudent(s.id)}
                            className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{s.name}</span>
                            {s.isRoomLeader && (
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                                TP
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {s.birthDate} • {s.gender} • CCCD: {s.cccd}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                            {s.class}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">{s.teacher}</div>
                        </td>
                        <td className="py-3 px-3">
                          {s.isBoarding ? (
                            <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px] px-2 py-0.5 rounded-full">
                              🏢 KTX Nội trú
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 font-bold text-[10px] px-2 py-0.5 rounded-full">
                              Ngoại trú
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {s.isBoarding && s.room ? (
                            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg">
                              P.{s.room} ({s.dormBuilding})
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600 truncate max-w-[150px]">
                          {s.address}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">
                          {s.parentPhone}
                        </td>
                        <td className="py-3 px-3">
                          {s.academicStatus === 'graduated' ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Đã tốt nghiệp
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Đang học
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {s.academicStatus === 'graduated' && onRestoreStudent ? (
                              <button
                                onClick={() => onRestoreStudent(s.id)}
                                title="Khôi phục trạng thái đang học"
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                              >
                                Khôi phục
                              </button>
                            ) : (
                              <button
                                onClick={() => onPromoteIndividual(s.id, 'graduate')}
                                title="Ra trường tốt nghiệp"
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                              >
                                Ra trường
                              </button>
                            )}

                            <button
                              onClick={() => setStudentToDelete(s)}
                              title="Xóa học sinh này"
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {activeStudentsList.length > 100 && (
              <div className="p-3 bg-slate-50 text-center text-xs text-slate-500 border-t border-slate-200">
                Đang hiển thị 100 / {activeStudentsList.length} học sinh. Dùng bộ lọc để thu hẹp phạm vi.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: ADD SINGLE STUDENT */}
      {subTab === 'add_single' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-3xl mx-auto shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Thêm Học sinh Mới vào Hệ thống
            </h3>
          </div>

          <form onSubmit={handleSingleAddSubmit} className="space-y-4 pt-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và tên học sinh *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Giới tính *</label>
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === 'Nam'}
                      onChange={() => { setGender('Nam'); setDormBuilding('Nam'); }}
                      className="text-indigo-600"
                    />
                    <span>Nam</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === 'Nữ'}
                      onChange={() => { setGender('Nữ'); setDormBuilding('Nữ'); }}
                      className="text-indigo-600"
                    />
                    <span>Nữ</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ngày sinh</label>
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lớp chuyên *</label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {CLASSES_LIST.map(c => (
                    <option key={c} value={c}>{c} ({CLASS_TEACHERS[c] || 'GVCN'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số CCCD / Mã định danh</label>
                <input
                  type="text"
                  placeholder="02521100xxxx"
                  value={cccd}
                  onChange={(e) => setCccd(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Quê quán</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Cẩm Khê - Phú Thọ"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">SĐT Học sinh</label>
                <input
                  type="text"
                  placeholder="098xxxxxxx"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">SĐT Phụ huynh</label>
                <input
                  type="text"
                  placeholder="038xxxxxxx"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Boarding Section */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-sm">
                <input
                  type="checkbox"
                  checked={isBoarding}
                  onChange={(e) => setIsBoarding(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span>Học sinh ở Ký túc xá (Nội trú KTX CHV)</span>
              </label>

              {isBoarding && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Tòa KTX</label>
                    <select
                      value={dormBuilding}
                      onChange={(e) => setDormBuilding(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold cursor-pointer"
                    >
                      <option value="Nam">Tòa Nam</option>
                      <option value="Nữ">Tòa Nữ</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Phòng ở</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 2.1 hoặc 3.4"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                    />
                  </div>

                  <div className="flex items-end pb-1.5">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-800">
                      <input
                        type="checkbox"
                        checked={isRoomLeader}
                        onChange={(e) => setIsRoomLeader(e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded"
                      />
                      <span>Là Trưởng phòng (TP)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSubTab('roster')}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Lưu Học Sinh Mới
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB 3: BATCH CSV IMPORT */}
      {subTab === 'batch_import' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-3xl mx-auto shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Nhập Danh Sách Học Sinh Hàng Loạt (Paste CSV / Excel)
            </h3>
          </div>

          <p className="text-xs text-slate-600">
            Dán dữ liệu các cột từ Excel: Họ tên, Lớp, Giới tính (Nam/Nữ), Ngày sinh, Quê quán, SĐT HS, SĐT Phụ huynh, Số phòng KTX.
          </p>

          <textarea
            rows={8}
            placeholder={`Nguyễn Văn An, 10 Toán A, Nam, 15/08/2011, Cẩm Khê-Phú Thọ, 0981234567, 0381234567, 2.1\nTrần Thị Mai, 10 Hóa A, Nữ, 20/09/2011, Thanh Ba-Phú Thọ, 0971234567, 0391234567, 2.5`}
            value={batchCsvText}
            onChange={(e) => setBatchCsvText(e.target.value)}
            className="w-full p-3 font-mono text-xs border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {batchError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{batchError}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={handleParseBatchCsv}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Phân tích dữ liệu & Xem trước
            </button>

            {batchParsePreview.length > 0 && (
              <button
                onClick={handleConfirmBatchAdd}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                Xác nhận Nhập {batchParsePreview.length} Học Sinh
              </button>
            )}
          </div>

          {batchParsePreview.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="text-xs font-bold text-slate-800">
                Xem trước {batchParsePreview.length} học sinh sẵn sàng nhập:
              </div>
              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 text-xs">
                {batchParsePreview.slice(0, 20).map((s, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{s.name}</span>
                      <span className="text-slate-400 ml-2">({s.gender} • {s.birthDate})</span>
                    </div>
                    <div>
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold mr-2">
                        {s.class}
                      </span>
                      {s.isBoarding ? (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                          P.{s.room}
                        </span>
                      ) : (
                        <span className="text-slate-400">Ngoại trú</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: PROMOTION WIZARD */}
      {subTab === 'promotion' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-4xl mx-auto shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Chuyển Niên Khóa: Lên Lớp & Tốt Nghiệp Ra Trường
                </h3>
                <p className="text-xs text-slate-500">
                  Tự động chuyển lớp theo Khối, theo từng Lớp chuyên hoặc theo từng Cá nhân học sinh
                </p>
              </div>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setPromotionMode('grade')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  promotionMode === 'grade' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                }`}
              >
                1. Theo Khối
              </button>
              <button
                onClick={() => setPromotionMode('class')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  promotionMode === 'class' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                }`}
              >
                2. Theo Lớp
              </button>
              <button
                onClick={() => setPromotionMode('individual')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  promotionMode === 'individual' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                }`}
              >
                3. Theo Cá nhân
              </button>
            </div>
          </div>

          {promotionMode === 'grade' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">A</span>
                <h4 className="font-bold text-slate-900 text-sm">Lên lớp hoặc Ra trường cho TOÀN BỘ KHỐI</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">Khối 12 (20 lớp)</span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Tốt nghiệp
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Chuyển toàn bộ học sinh Khối 12 thành Đã ra trường tốt nghiệp; tự động giải phóng phòng KTX.
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn chuyển toàn bộ học sinh Khối 12 thành ĐÃ TỐT NGHIỆP RA TRƯỜNG?')) {
                        onPromoteByGrade(12, 'graduate');
                      }
                    }}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Tốt nghiệp Ra trường Khối 12
                  </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">Khối 11 (17 lớp)</span>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Lên Khối 12
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Tất cả học sinh 11 sẽ tự động nâng lên lớp 12 tương ứng (11 Toán A → 12 Toán A...).
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn nâng toàn bộ học sinh Khối 11 lên KHỐI 12?')) {
                        onPromoteByGrade(11, 12);
                      }
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Nâng Khối 11 lên Khối 12
                  </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">Khối 10 (17 lớp)</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Lên Khối 11
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Tất cả học sinh 10 sẽ tự động nâng lên lớp 11 tương ứng (10 Toán A → 11 Toán A...).
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn nâng toàn bộ học sinh Khối 10 lên KHỐI 11?')) {
                        onPromoteByGrade(10, 11);
                      }
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Nâng Khối 10 lên Khối 11
                  </button>
                </div>
              </div>
            </div>
          )}

          {promotionMode === 'class' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">B</span>
                <h4 className="font-bold text-slate-900 text-sm">Lên lớp hoặc Ra trường theo TỪNG LỚP</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">1. Chọn lớp nguồn:</label>
                  <select
                    value={selectedFromClass}
                    onChange={(e) => setSelectedFromClass(e.target.value)}
                    className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white cursor-pointer"
                  >
                    {CLASSES_LIST.map(c => (
                      <option key={c} value={c}>
                        Lớp {c} ({students.filter(s => s.class === c && (s.academicStatus || 'studying') === 'studying').length} HS)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">2. Thao tác tiếp theo:</label>
                  <select
                    value={selectedTargetClassAction}
                    onChange={(e) => setSelectedTargetClassAction(e.target.value)}
                    className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white cursor-pointer"
                  >
                    <option value="graduate">🎓 Tốt nghiệp Ra trường</option>
                    {CLASSES_LIST.map(c => (
                      <option key={c} value={c}>Chuyển thành lớp {c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  if (window.confirm(`Xác nhận thực hiện chuyển lớp cho toàn bộ học sinh lớp ${selectedFromClass}?`)) {
                    onPromoteByClass(selectedFromClass, selectedTargetClassAction);
                  }
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Thực hiện cho lớp {selectedFromClass}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {promotionMode === 'individual' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">C</span>
                <h4 className="font-bold text-slate-900 text-sm">Lên lớp hoặc Ra trường cho TỪNG CÁ NHÂN</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chọn học sinh:</label>
                  <select
                    value={selectedIndividualId}
                    onChange={(e) => setSelectedIndividualId(e.target.value)}
                    className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white cursor-pointer"
                  >
                    <option value="">-- Chọn học sinh từ danh sách --</option>
                    {students.filter(s => (s.academicStatus || 'studying') === 'studying').slice(0, 100).map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.class}) - {s.isBoarding ? `P.${s.room}` : 'Ngoại trú'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hành động áp dụng:</label>
                  <select
                    value={individualTargetAction}
                    onChange={(e) => setIndividualTargetAction(e.target.value)}
                    className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl bg-white cursor-pointer"
                  >
                    <option value="graduate">🎓 Tốt nghiệp ra trường</option>
                    {CLASSES_LIST.map(c => (
                      <option key={c} value={c}>Chuyển sang lớp {c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                disabled={!selectedIndividualId}
                onClick={() => {
                  if (selectedIndividualId) {
                    onPromoteIndividual(selectedIndividualId, individualTargetAction);
                    setSelectedIndividualId('');
                  }
                }}
                className="px-5 py-2.5 bg-indigo-600 disabled:bg-slate-300 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Xác nhận cập nhật cho học sinh</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Single Confirm Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="p-2 rounded-2xl bg-rose-50">
                <AlertTriangle className="w-6 h-6" />
              </span>
              <h4 className="font-bold text-slate-900 text-base">Xác nhận xóa học sinh</h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa học sinh <strong>{studentToDelete.name}</strong> (Lớp {studentToDelete.class}
              {studentToDelete.isBoarding ? `, Phòng ${studentToDelete.room}` : ''}) khỏi hệ thống không?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Xác nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirm Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="p-2 rounded-2xl bg-rose-50">
                <ShieldAlert className="w-6 h-6" />
              </span>
              <h4 className="font-bold text-slate-900 text-base">Xác nhận xóa hàng loạt</h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn đang chọn xóa <strong>{selectedStudentIds.size} học sinh</strong> cùng lúc khỏi danh sách trường và phòng KTX nội trú.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Xóa {selectedStudentIds.size} học sinh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
