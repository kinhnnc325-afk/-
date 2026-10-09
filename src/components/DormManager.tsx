import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Phone, 
  Sparkles, 
  AlertTriangle, 
  Copy, 
  Check, 
  CheckCircle2, 
  FileText,
  MapPin,
  Calendar,
  ShieldAlert,
  X
} from 'lucide-react';
import { Student, RoomInfo } from '../types';

interface DormManagerProps {
  students: Student[];
  onUpdateStudentStatus: (studentId: string, status: Student['status']) => void;
  onRecordViolation: (student: Student, defaultCode?: string) => void;
  onRequestLeave: (student: Student) => void;
}

export const DormManager: React.FC<DormManagerProps> = ({
  students,
  onUpdateStudentStatus,
  onRecordViolation,
  onRequestLeave
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState<'Nam' | 'Nữ'>('Nam');
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent_excused' | 'absent_unexcused'>('all');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const dormStudents = useMemo(() => {
    return students.filter(s => s.isBoarding && s.dormBuilding === selectedBuilding);
  }, [students, selectedBuilding]);

  const roomsMap = useMemo(() => {
    const map = new Map<string, Student[]>();
    dormStudents.forEach(s => {
      const roomKey = s.room || 'Chưa xếp';
      if (!map.has(roomKey)) {
        map.set(roomKey, []);
      }
      map.get(roomKey)!.push(s);
    });
    return map;
  }, [dormStudents]);

  const roomsList: RoomInfo[] = useMemo(() => {
    const list: RoomInfo[] = [];
    roomsMap.forEach((roomStudents, roomNum) => {
      const floor = parseInt(roomNum.split('.')[0], 10) || 2;
      const leader = roomStudents.find(s => s.isRoomLeader) || roomStudents[0];
      const hasUnexcused = roomStudents.some(s => s.status === 'absent_unexcused');
      const hasViolations = roomStudents.some(s => (s.violationCount || 0) > 0);

      list.push({
        roomNumber: roomNum,
        building: selectedBuilding,
        floor,
        capacity: 6,
        students: roomStudents,
        roomLeader: leader,
        hygieneScore: hasViolations ? 80 : 95,
        status: hasUnexcused ? 'violation' : hasViolations ? 'warning' : 'clean'
      });
    });

    return list.sort((a, b) => {
      const [fA, rA] = a.roomNumber.split('.').map(n => parseInt(n, 10) || 0);
      const [fB, rB] = b.roomNumber.split('.').map(n => parseInt(n, 10) || 0);
      if (fA !== fB) return fA - fB;
      return rA - rB;
    });
  }, [roomsMap, selectedBuilding]);

  const availableFloors = useMemo(() => {
    const floorsSet = new Set<number>();
    roomsList.forEach(r => floorsSet.add(r.floor));
    return Array.from(floorsSet).sort((a, b) => a - b);
  }, [roomsList]);

  const filteredRooms = useMemo(() => {
    return roomsList.filter(room => {
      if (selectedFloor !== 'all' && room.floor !== selectedFloor) return false;
      if (statusFilter !== 'all') {
        const matchesStatus = room.students.some(s => s.status === statusFilter);
        if (!matchesStatus) return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesRoom = room.roomNumber.toLowerCase().includes(term);
        const matchesStudent = room.students.some(s => 
          s.name.toLowerCase().includes(term) ||
          s.class.toLowerCase().includes(term) ||
          s.address.toLowerCase().includes(term) ||
          s.studentPhone.includes(term) ||
          s.parentPhone.includes(term) ||
          s.cccd.includes(term)
        );
        if (!matchesRoom && !matchesStudent) return false;
      }
      return true;
    });
  }, [roomsList, selectedFloor, statusFilter, searchTerm]);

  const buildingSummary = useMemo(() => {
    let present = 0;
    let excused = 0;
    let unexcused = 0;
    let leadersCount = 0;

    dormStudents.forEach(s => {
      if (s.status === 'absent_excused') excused++;
      else if (s.status === 'absent_unexcused') unexcused++;
      else present++;
      if (s.isRoomLeader) leadersCount++;
    });

    return {
      totalStudents: dormStudents.length,
      totalRooms: roomsList.length,
      present,
      excused,
      unexcused,
      leadersCount
    };
  }, [dormStudents, roomsList]);

  const activeRoom = useMemo(() => {
    if (!selectedRoomNumber) return null;
    return roomsList.find(r => r.roomNumber === selectedRoomNumber) || null;
  }, [roomsList, selectedRoomNumber]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleQuickRollCallRoom = (room: RoomInfo, targetStatus: Student['status']) => {
    room.students.forEach(s => {
      onUpdateStudentStatus(s.id, targetStatus);
    });
  };

  const handleCopyZaloReport = (room: RoomInfo) => {
    const presentCount = room.students.filter(s => s.status === 'present' || !s.status).length;
    const absentExcused = room.students.filter(s => s.status === 'absent_excused');
    const absentUnexcused = room.students.filter(s => s.status === 'absent_unexcused');

    let text = `[BÁO CÁO QUÂN SỐ KTX ${room.building.toUpperCase()} - PHÒNG ${room.roomNumber}]\n`;
    text += `• Sĩ số phòng: ${room.students.length}/${room.capacity} HS\n`;
    text += `• Hiện diện: ${presentCount} HS\n`;
    if (absentExcused.length > 0) {
      text += `• Vắng có phép (${absentExcused.length}): ${absentExcused.map(s => s.name + ' - ' + s.class).join(', ')}\n`;
    }
    if (absentUnexcused.length > 0) {
      text += `• Vắng không phép (${absentUnexcused.length}): ${absentUnexcused.map(s => s.name + ' - ' + s.class).join(', ')}\n`;
    }
    text += `• Trưởng phòng: ${room.roomLeader?.name || 'Chưa phân công'}\n`;
    text += `• Thời điểm: ${new Date().toLocaleTimeString('vi-VN')} ngày ${new Date().toLocaleDateString('vi-VN')}`;

    handleCopy(text, `Báo cáo Zalo phòng ${room.roomNumber}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Selector Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <Building2 className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Sơ đồ Ký túc xá & Quản lý Phòng ở
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Theo dõi 699 học sinh nội trú, sơ đồ phòng, trưởng phòng, thông tin liên hệ và quân số điểm danh
                </p>
              </div>
            </div>
          </div>

          {/* Building Switcher */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => {
                setSelectedBuilding('Nam');
                setSelectedFloor('all');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedBuilding === 'Nam'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👨 Tòa KTX Nam</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                selectedBuilding === 'Nam' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                335 HS
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedBuilding('Nữ');
                setSelectedFloor('all');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedBuilding === 'Nữ'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👩 Tòa KTX Nữ</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                selectedBuilding === 'Nữ' ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                364 HS
              </span>
            </button>
          </div>
        </div>

        {/* Building stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[11px] font-medium text-slate-500">Tổng học sinh</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{buildingSummary.totalStudents} HS</div>
            <div className="text-[10px] text-slate-400">Tòa {selectedBuilding}</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[11px] font-medium text-slate-500">Tổng số phòng</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{buildingSummary.totalRooms} phòng</div>
            <div className="text-[10px] text-slate-400">Tầng 2 đến tầng {selectedBuilding === 'Nam' ? '6' : '5'}</div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3">
            <div className="text-[11px] font-medium text-emerald-700">Có mặt tại phòng</div>
            <div className="text-xl font-extrabold text-emerald-700 mt-0.5">{buildingSummary.present} HS</div>
            <div className="text-[10px] text-emerald-600">Đã chốt quân số</div>
          </div>

          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3">
            <div className="text-[11px] font-medium text-amber-700">Vắng có phép</div>
            <div className="text-xl font-extrabold text-amber-700 mt-0.5">{buildingSummary.excused} HS</div>
            <div className="text-[10px] text-amber-600">Về quê / Học thêm</div>
          </div>

          <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3">
            <div className="text-[11px] font-medium text-rose-700">Vắng không phép</div>
            <div className={`text-xl font-extrabold mt-0.5 ${buildingSummary.unexcused > 0 ? 'text-rose-700 animate-pulse' : 'text-slate-400'}`}>
              {buildingSummary.unexcused} HS
            </div>
            <div className="text-[10px] text-rose-600">Cần xác minh ngay</div>
          </div>

          <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3">
            <div className="text-[11px] font-medium text-indigo-700">Trưởng phòng (TP)</div>
            <div className="text-xl font-extrabold text-indigo-700 mt-0.5">{buildingSummary.leadersCount} em</div>
            <div className="text-[10px] text-indigo-600">Ban tự quản cơ sở</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Tầng:
            </span>
            <button
              onClick={() => setSelectedFloor('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFloor === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tất cả ({roomsList.length})
            </button>
            {availableFloors.map(floor => {
              const countOnFloor = roomsList.filter(r => r.floor === floor).length;
              return (
                <button
                  key={floor}
                  onClick={() => setSelectedFloor(floor)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedFloor === floor
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tầng {floor} ({countOnFloor} phòng)
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên, phòng, lớp, quê quán, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Mọi trạng thái phòng</option>
              <option value="present">Phòng có mặt đầy đủ</option>
              <option value="absent_excused">Có học sinh vắng có phép</option>
              <option value="absent_unexcused">Có học sinh vắng không phép</option>
            </select>
          </div>
        </div>
      </div>

      {copiedText && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Đã sao chép: {copiedText}</span>
        </div>
      )}

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map(room => {
          const presentCount = room.students.filter(s => s.status === 'present' || !s.status).length;
          const hasUnexcused = room.students.some(s => s.status === 'absent_unexcused');
          const hasExcused = room.students.some(s => s.status === 'absent_excused');

          return (
            <div
              key={room.roomNumber}
              className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between ${
                hasUnexcused 
                  ? 'border-rose-300 ring-2 ring-rose-100 shadow-rose-50' 
                  : hasExcused 
                    ? 'border-amber-200 hover:border-amber-400' 
                    : 'border-slate-200/80 hover:border-indigo-400'
              }`}
            >
              {/* Room Card Header */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg ${
                      room.building === 'Nam'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {room.roomNumber}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">
                          Tầng {room.floor} • KTX {room.building}
                        </span>
                        {hasUnexcused && (
                          <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Vắng KTX
                          </span>
                        )}
                        {!hasUnexcused && hasExcused && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            Có phép
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>Quân số:</span>
                        <span className={`font-bold ${presentCount === room.students.length ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {presentCount}/{room.students.length} có mặt
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-400">Tối đa {room.capacity}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    room.status === 'clean' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : room.status === 'warning'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {room.hygieneScore}đ nội vụ
                  </span>
                </div>

                {room.roomLeader && (
                  <div className="mt-2.5 bg-indigo-50/60 border border-indigo-100 rounded-lg px-2.5 py-1 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-indigo-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                      Trưởng phòng (TP):
                    </span>
                    <span className="font-bold text-indigo-950 truncate max-w-[130px]">
                      {room.roomLeader.name} ({room.roomLeader.class})
                    </span>
                  </div>
                )}
              </div>

              {/* Roommates mini list */}
              <div className="p-4 space-y-1.5 flex-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Thành viên ({room.students.length} HS)</span>
                  <span className="text-[10px] lowercase text-slate-400">click để xem SĐT</span>
                </div>

                <div className="space-y-1">
                  {room.students.map((student, idx) => (
                    <div
                      key={student.id}
                      onClick={() => setSelectedRoomNumber(room.roomNumber)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-all ${
                        student.status === 'absent_unexcused'
                          ? 'bg-rose-50 text-rose-900 border border-rose-200'
                          : student.status === 'absent_excused'
                            ? 'bg-amber-50 text-amber-900 border border-amber-200'
                            : 'bg-slate-50 text-slate-800 hover:bg-indigo-50 hover:text-indigo-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-medium truncate">{student.name}</span>
                        {student.isRoomLeader && (
                          <span className="bg-amber-500 text-white text-[9px] font-bold px-1 py-0.2 rounded flex-shrink-0">
                            TP
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] text-slate-500 font-mono">{student.class}</span>
                        <span className={`w-2 h-2 rounded-full ${
                          student.status === 'absent_unexcused'
                            ? 'bg-rose-500 animate-ping'
                            : student.status === 'absent_excused'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Card Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex items-center justify-between gap-1">
                <button
                  onClick={() => setSelectedRoomNumber(room.roomNumber)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100/60 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Chi tiết & SĐT</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyZaloReport(room)}
                    title="Sao chép báo cáo Zalo 22h15"
                    className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleQuickRollCallRoom(room, 'present')}
                    title="Đánh dấu cả phòng có mặt"
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Đủ mặt</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy phòng ở phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1">
            Vui lòng thử điều chỉnh lại từ khóa tìm kiếm hoặc chọn tầng khác
          </p>
        </div>
      )}

      {/* Room Details Modal */}
      {activeRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center font-black text-xl text-amber-300">
                  {activeRoom.roomNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">
                      Phòng {activeRoom.roomNumber} - Tòa KTX {activeRoom.building}
                    </h3>
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30">
                      Tầng {activeRoom.floor}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Sĩ số hiện tại: {activeRoom.students.length}/6 học sinh • Trưởng phòng: {activeRoom.roomLeader?.name || 'Chưa chỉ định'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyZaloReport(activeRoom)}
                  className="px-3 py-1.5 bg-blue-600/60 hover:bg-blue-600 border border-blue-400/40 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Xuất Zalo 22h15</span>
                </button>
                <button
                  onClick={() => setSelectedRoomNumber(null)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Đánh giá Nếp sống Nội vụ Phòng (Điều 3 Quy chế)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gấp chăn gối vuông vắn • Quần áo gọn gàng trong tủ • Không treo ri-đô • WC phòng sạch sẽ
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRecordViolation(activeRoom.students[0], 'L07')}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Ghi nhận lỗi L07 (-3đ)</span>
                  </button>

                  <button
                    onClick={() => handleQuickRollCallRoom(activeRoom, 'present')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Điểm danh Đủ Mặt 22h00</span>
                  </button>
                </div>
              </div>

              {/* Roommates Full Detailed Cards */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span>Danh sách Học sinh trong phòng ({activeRoom.students.length} em)</span>
                  <span className="text-xs font-normal text-slate-500">
                    Bấm SĐT để gọi trực tiếp cho HS hoặc Bố/Mẹ
                  </span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeRoom.students.map((student, idx) => (
                    <div
                      key={student.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-300 hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-bold text-slate-900 text-sm">{student.name}</h5>
                              {student.isRoomLeader && (
                                <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                                  Trưởng phòng
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="font-semibold text-indigo-700">Lớp {student.class}</span>
                              <span>•</span>
                              <span>GVCN: {student.teacher}</span>
                            </div>
                          </div>
                        </div>

                        <select
                          value={student.status || 'present'}
                          onChange={(e) => onUpdateStudentStatus(student.id, e.target.value as any)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border cursor-pointer focus:outline-none ${
                            student.status === 'absent_unexcused'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : student.status === 'absent_excused'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          <option value="present">✅ Có mặt</option>
                          <option value="absent_excused">📝 Vắng có phép</option>
                          <option value="absent_unexcused">🚨 Vắng không phép</option>
                        </select>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-2.5 text-xs space-y-1.5 border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Quê quán:
                          </span>
                          <span className="font-medium text-slate-800">{student.address}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Số CCCD / Mã ĐD:</span>
                          <span className="font-mono text-slate-700">{student.cccd}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-blue-500" /> SĐT Học sinh:
                          </span>
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${student.studentPhone}`}
                              className="font-bold text-blue-600 hover:underline font-mono"
                            >
                              {student.studentPhone}
                            </a>
                            <button
                              onClick={() => handleCopy(student.studentPhone, `SĐT ${student.name}`)}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer"
                              title="Sao chép"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-500" /> SĐT Bố/Mẹ:
                          </span>
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${student.parentPhone}`}
                              className="font-bold text-emerald-700 hover:underline font-mono"
                            >
                              {student.parentPhone}
                            </a>
                            <button
                              onClick={() => handleCopy(student.parentPhone, `SĐT Bố/Mẹ ${student.name}`)}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer"
                              title="Sao chép"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                        <button
                          onClick={() => onRequestLeave(student)}
                          className="px-2.5 py-1 text-indigo-700 hover:bg-indigo-50 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Lập đơn xin phép</span>
                        </button>

                        <button
                          onClick={() => onRecordViolation(student)}
                          className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <ShieldAlert className="w-3 h-3" />
                          <span>Ghi vi phạm KPI</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                THPT Chuyên Hùng Vương • KTX Nội trú Năm học 2026 - 2027
              </span>
              <button
                onClick={() => setSelectedRoomNumber(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
