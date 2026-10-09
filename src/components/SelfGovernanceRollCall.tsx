import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  DoorClosed, 
  CheckCircle2, 
  Send, 
  Copy, 
  Users, 
  Sparkles
} from 'lucide-react';
import { Student, RoomReport, FloorReport, UserSession } from '../types';

interface SelfGovernanceRollCallProps {
  students: Student[];
  onUpdateStudentStatus: (studentId: string, status: Student['status']) => void;
  onRecordViolation: (student: Student, defaultCode?: string) => void;
  roomReports: RoomReport[];
  onAddRoomReport: (report: RoomReport) => void;
  floorReports: FloorReport[];
  onAddFloorReport: (report: FloorReport) => void;
  userSession?: UserSession;
}

export const SelfGovernanceRollCall: React.FC<SelfGovernanceRollCallProps> = ({
  students,
  onUpdateStudentStatus,
  roomReports,
  onAddRoomReport,
  floorReports,
  onAddFloorReport,
  userSession
}) => {
  const isRoomLeader = userSession?.role === 'room_leader';
  const isFloorLeader = userSession?.role === 'floor_leader';

  const [activePortal, setActivePortal] = useState<'room_leader' | 'floor_leader'>(() => {
    if (isFloorLeader) return 'floor_leader';
    return 'room_leader';
  });

  const [selectedBuilding, setSelectedBuilding] = useState<'Nam' | 'Nữ'>(
    (userSession?.building as 'Nam' | 'Nữ') || 'Nam'
  );
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>(
    userSession?.roomNumber || '2.1'
  );

  React.useEffect(() => {
    if (userSession?.role === 'room_leader' && userSession.roomNumber) {
      if (userSession.building) setSelectedBuilding(userSession.building);
      setSelectedRoomNumber(userSession.roomNumber);
      setActivePortal('room_leader');
    } else if (userSession?.role === 'floor_leader' && userSession.floor) {
      if (userSession.building) setSelectedFloorBuilding(userSession.building);
      setSelectedFloor(userSession.floor);
      setActivePortal('floor_leader');
    }
  }, [userSession]);

  const [hygieneStatus, setHygieneStatus] = useState<'Tốt' | 'Khá' | 'Cần khắc phục'>('Tốt');
  const [roomNote, setRoomNote] = useState('');
  const [copiedZaloMsg, setCopiedZaloMsg] = useState(false);
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);

  const [selectedFloorBuilding, setSelectedFloorBuilding] = useState<'Nam' | 'Nữ'>(
    (userSession?.building as 'Nam' | 'Nữ') || 'Nam'
  );
  const [selectedFloor, setSelectedFloor] = useState<number>(userSession?.floor || 2);
  const [floorNote, setFloorNote] = useState('');
  const [copiedFloorZalo, setCopiedFloorZalo] = useState(false);
  const [showFloorSuccess, setShowFloorSuccess] = useState(false);

  const roomStudents = useMemo(() => {
    return students.filter(s => 
      s.isBoarding && 
      s.dormBuilding === selectedBuilding && 
      s.room === selectedRoomNumber &&
      (s.academicStatus || 'studying') === 'studying'
    );
  }, [students, selectedBuilding, selectedRoomNumber]);

  const availableRoomNumbers = useMemo(() => {
    const set = new Set<string>();
    students.filter(s => s.isBoarding && s.dormBuilding === selectedBuilding && s.room).forEach(s => {
      set.add(s.room!);
    });
    return Array.from(set).sort((a, b) => {
      const [fA, rA] = a.split('.').map(n => parseInt(n, 10) || 0);
      const [fB, rB] = b.split('.').map(n => parseInt(n, 10) || 0);
      if (fA !== fB) return fA - fB;
      return rA - rB;
    });
  }, [students, selectedBuilding]);

  const roomLeader = useMemo(() => {
    return roomStudents.find(s => s.isRoomLeader) || roomStudents[0] || null;
  }, [roomStudents]);

  const existingRoomReport = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return roomReports.find(r => 
      r.building === selectedBuilding && 
      r.roomNumber === selectedRoomNumber && 
      r.reportedAt.startsWith(today)
    );
  }, [roomReports, selectedBuilding, selectedRoomNumber]);

  const floorRooms = useMemo(() => {
    const map = new Map<string, Student[]>();
    students.filter(s => 
      s.isBoarding && 
      s.dormBuilding === selectedFloorBuilding && 
      s.floor === selectedFloor && 
      s.room &&
      (s.academicStatus || 'studying') === 'studying'
    ).forEach(s => {
      if (!map.has(s.room!)) map.set(s.room!, []);
      map.get(s.room!)!.push(s);
    });

    const list: Array<{ roomNumber: string; students: Student[]; isReported: boolean; report?: RoomReport }> = [];
    const today = new Date().toISOString().split('T')[0];

    map.forEach((studs, rNum) => {
      const rep = roomReports.find(r => 
        r.building === selectedFloorBuilding && 
        r.roomNumber === rNum && 
        r.reportedAt.startsWith(today)
      );
      list.push({
        roomNumber: rNum,
        students: studs,
        isReported: !!rep,
        report: rep
      });
    });

    return list.sort((a, b) => {
      const rA = parseInt(a.roomNumber.split('.')[1], 10) || 0;
      const rB = parseInt(b.roomNumber.split('.')[1], 10) || 0;
      return rA - rB;
    });
  }, [students, selectedFloorBuilding, selectedFloor, roomReports]);

  const floorStats = useMemo(() => {
    let totalStudents = 0;
    let presentTotal = 0;
    let absentExcused = 0;
    let absentUnexcused = 0;
    const absentList: Array<{ student: Student; reason?: string }> = [];

    floorRooms.forEach(fr => {
      totalStudents += fr.students.length;
      fr.students.forEach(s => {
        if (s.status === 'absent_excused') {
          absentExcused++;
          absentList.push({ student: s, reason: 'Có phép' });
        } else if (s.status === 'absent_unexcused') {
          absentUnexcused++;
          absentList.push({ student: s, reason: 'Không phép' });
        } else {
          presentTotal++;
        }
      });
    });

    const reportedRoomsCount = floorRooms.filter(r => r.isReported).length;

    return {
      totalRooms: floorRooms.length,
      reportedRoomsCount,
      totalStudents,
      presentTotal,
      absentExcused,
      absentUnexcused,
      absentList
    };
  }, [floorRooms]);

  const handleSetAllPresent = () => {
    roomStudents.forEach(s => {
      onUpdateStudentStatus(s.id, 'present');
    });
  };

  const handleRoomSubmitReport = () => {
    const present = roomStudents.filter(s => s.status === 'present' || !s.status).length;
    const excused = roomStudents.filter(s => s.status === 'absent_excused').length;
    const unexcused = roomStudents.filter(s => s.status === 'absent_unexcused').length;
    const now = new Date();

    const report: RoomReport = {
      id: `RR_${Date.now()}`,
      roomNumber: selectedRoomNumber,
      building: selectedBuilding,
      floor: parseInt(selectedRoomNumber.split('.')[0], 10) || 2,
      reportedAt: now.toISOString(),
      reportedBy: roomLeader ? `${roomLeader.name} (${roomLeader.class})` : 'Trưởng phòng',
      totalStudents: roomStudents.length,
      presentCount: present,
      absentExcusedCount: excused,
      absentUnexcusedCount: unexcused,
      hygieneStatus,
      note: roomNote.trim(),
      details: roomStudents.map(s => ({
        studentId: s.id,
        studentName: s.name,
        status: (s.status === 'absent_excused' || s.status === 'absent_unexcused') ? s.status : 'present',
        reason: s.status === 'absent_excused' ? 'Có phép (về quê/học thêm)' : undefined
      }))
    };

    onAddRoomReport(report);
    setShowSubmitSuccess(true);
    setTimeout(() => setShowSubmitSuccess(false), 3000);
  };

  const generateRoomZaloText = () => {
    const present = roomStudents.filter(s => s.status === 'present' || !s.status).length;
    const excused = roomStudents.filter(s => s.status === 'absent_excused');
    const unexcused = roomStudents.filter(s => s.status === 'absent_unexcused');
    const now = new Date();

    let text = `[BÁO CÁO ĐIỂM DANH 22H00 - PHÒNG ${selectedRoomNumber} KTX ${selectedBuilding.toUpperCase()}]\n`;
    text += `• Trưởng phòng: ${roomLeader ? roomLeader.name : 'TP'}\n`;
    text += `• Sĩ số phòng: ${roomStudents.length}/6 HS\n`;
    text += `• Có mặt: ${present}/${roomStudents.length} HS\n`;
    if (excused.length > 0) {
      text += `• Vắng có phép: ${excused.map(s => s.name + ' (' + s.class + ')').join(', ')}\n`;
    }
    if (unexcused.length > 0) {
      text += `• Vắng không phép: ${unexcused.map(s => s.name + ' (' + s.class + ')').join(', ')}\n`;
    }
    text += `• Nội vụ phòng: ${hygieneStatus}\n`;
    if (roomNote.trim()) {
      text += `• Ghi chú: ${roomNote.trim()}\n`;
    }
    text += `• Thời điểm gửi: ${now.toLocaleTimeString('vi-VN')} ngày ${now.toLocaleDateString('vi-VN')}`;

    return text;
  };

  const handleCopyRoomZalo = () => {
    navigator.clipboard.writeText(generateRoomZaloText());
    setCopiedZaloMsg(true);
    setTimeout(() => setCopiedZaloMsg(false), 2500);
  };

  const handleFloorSubmitReport = () => {
    const now = new Date();
    const rep: FloorReport = {
      id: `FR_${Date.now()}`,
      floor: selectedFloor,
      building: selectedFloorBuilding,
      reportedAt: now.toISOString(),
      reportedBy: `Trưởng tầng ${selectedFloor} (KTX ${selectedFloorBuilding})`,
      totalRooms: floorStats.totalRooms,
      reportedRoomsCount: floorStats.reportedRoomsCount,
      totalStudents: floorStats.totalStudents,
      presentTotal: floorStats.presentTotal,
      absentExcusedTotal: floorStats.absentExcused,
      absentUnexcusedTotal: floorStats.absentUnexcused,
      note: floorNote.trim()
    };

    onAddFloorReport(rep);
    setShowFloorSuccess(true);
    setTimeout(() => setShowFloorSuccess(false), 3000);
  };

  const generateFloorZaloText = () => {
    const now = new Date();
    let text = `[BÁO CÁO QUÂN SỐ TẦNG ${selectedFloor} - KTX ${selectedFloorBuilding.toUpperCase()} - 22H15]\n`;
    text += `Kính gửi: Thầy/Cô Cán bộ Quản sinh KTX\n`;
    text += `Người báo cáo: Trưởng tầng ${selectedFloor}\n`;
    text += `• Tổng số phòng: ${floorStats.totalRooms} phòng\n`;
    text += `• Tiến độ báo cáo: ${floorStats.reportedRoomsCount}/${floorStats.totalRooms} phòng đã gửi\n`;
    text += `• Tổng quân số tầng: ${floorStats.totalStudents} HS\n`;
    text += `• Có mặt: ${floorStats.presentTotal} HS\n`;
    text += `• Vắng có phép: ${floorStats.absentExcused} HS\n`;
    text += `• Vắng không phép: ${floorStats.absentUnexcused} HS\n`;
    if (floorStats.absentList.length > 0) {
      text += `• Danh sách vắng: ${floorStats.absentList.map(a => `${a.student.name} (P.${a.student.room} - ${a.reason})`).join(', ')}\n`;
    }
    if (floorNote.trim()) {
      text += `• Ghi chú: ${floorNote.trim()}\n`;
    }
    text += `• Thời điểm: ${now.toLocaleTimeString('vi-VN')} ngày ${now.toLocaleDateString('vi-VN')}`;
    return text;
  };

  const handleCopyFloorZalo = () => {
    navigator.clipboard.writeText(generateFloorZaloText());
    setCopiedFloorZalo(true);
    setTimeout(() => setCopiedFloorZalo(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Users className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Cổng Điểm danh Ban Tự Quản KTX (Trưởng Phòng & Trưởng Tầng)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Phân quyền điểm danh nhanh 1-chạm theo Điều 5 Quy chế: Trưởng phòng báo cáo lúc 22h00, Trưởng tầng tổng hợp lúc 22h15
                </p>
              </div>
            </div>
          </div>

          {/* Role Access Banner */}
          {(isRoomLeader || isFloorLeader) && (
            <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between text-xs font-semibold text-amber-900">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <span>
                  {isRoomLeader ? (
                    <>🔒 <strong>Quyền Trưởng phòng:</strong> Bạn có quyền điểm danh và <strong>ĐĂNG BÁO CÁO NỀN NẾP PHÒNG {userSession?.roomNumber}</strong>. Hệ thống bảo vệ nghiêm ngặt: không thể sửa đổi danh sách học sinh, không sửa phòng khác hay cấu hình chung.</>
                  ) : (
                    <>🔒 <strong>Quyền Trưởng tầng:</strong> Bạn có quyền kiểm tra và <strong>ĐĂNG BÁO CÁO TỔNG HỢP TẦNG {userSession?.floor}</strong>. Hệ thống bảo vệ nghiêm ngặt: không thể sửa đổi học sinh, phòng hay can thiệp tầng khác.</>
                  )}
                </span>
              </div>
              <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-bold">
                Chỉ được đăng báo cáo
              </span>
            </div>
          )}

          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto mt-2 md:mt-0">
            <button
              onClick={() => {
                if (!isFloorLeader) setActivePortal('room_leader');
              }}
              disabled={isFloorLeader}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                isFloorLeader ? 'opacity-50 cursor-not-allowed text-slate-400' : 'cursor-pointer'
              } ${
                activePortal === 'room_leader'
                  ? 'bg-gradient-to-r from-[#002B7F] to-[#003899] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DoorClosed className="w-4 h-4" />
              <span>🚪 Cổng Trưởng Phòng (22h00)</span>
            </button>

            <button
              onClick={() => {
                if (!isRoomLeader) setActivePortal('floor_leader');
              }}
              disabled={isRoomLeader}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                isRoomLeader ? 'opacity-50 cursor-not-allowed text-slate-400' : 'cursor-pointer'
              } ${
                activePortal === 'floor_leader'
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>🏢 Cổng Trưởng Tầng (22h15)</span>
            </button>
          </div>
        </div>
      </div>

      {/* PORTAL 1: ROOM LEADER */}
      {activePortal === 'room_leader' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => !isRoomLeader && setSelectedBuilding('Nam')}
                  disabled={isRoomLeader && userSession?.building !== 'Nam'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isRoomLeader && userSession?.building !== 'Nam' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                  } ${
                    selectedBuilding === 'Nam' ? 'bg-[#002B7F] text-white' : 'text-slate-600'
                  }`}
                >
                  Tòa Nam (335 HS)
                </button>
                <button
                  onClick={() => !isRoomLeader && setSelectedBuilding('Nữ')}
                  disabled={isRoomLeader && userSession?.building !== 'Nữ'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isRoomLeader && userSession?.building !== 'Nữ' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                  } ${
                    selectedBuilding === 'Nữ' ? 'bg-[#ED1C24] text-white' : 'text-slate-600'
                  }`}
                >
                  Tòa Nữ (364 HS)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  {isRoomLeader ? 'Phòng được phân quyền:' : 'Chọn phòng kiểm tra:'}
                </span>
                {isRoomLeader ? (
                  <span className="px-3 py-1.5 text-sm font-black bg-amber-100 text-amber-950 border border-amber-300 rounded-xl">
                    Phòng {selectedRoomNumber} (Khóa quyền phòng mình)
                  </span>
                ) : (
                  <select
                    value={selectedRoomNumber}
                    onChange={(e) => setSelectedRoomNumber(e.target.value)}
                    className="px-3 py-1.5 text-sm font-extrabold bg-indigo-50 text-indigo-900 border border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {availableRoomNumbers.map(r => (
                      <option key={r} value={r}>Phòng {r}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="text-xs text-right bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 self-start md:self-auto">
              <span className="text-slate-400 block">Trưởng phòng phụ trách:</span>
              <span className="font-bold text-slate-900">
                {roomLeader ? `${roomLeader.name} (${roomLeader.class})` : 'Chưa phân công TP'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                    {selectedRoomNumber}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Điểm danh Quân số Phòng {selectedRoomNumber} (KTX {selectedBuilding})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Sĩ số: {roomStudents.length}/6 học sinh • Thực hiện lúc 06h00 sáng & 22h00 đêm
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSetAllPresent}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1-Chạm: Tất cả có mặt</span>
                </button>
              </div>
            </div>

            {/* Room Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {roomStudents.map((s, idx) => (
                <div
                  key={s.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    s.status === 'absent_unexcused'
                      ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                      : s.status === 'absent_excused'
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-200 font-bold text-slate-800 text-xs flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                          <span>{s.name}</span>
                          {s.isRoomLeader && (
                            <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                              TP
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Lớp {s.class}
                        </div>
                      </div>
                    </div>

                    <span className={`w-2.5 h-2.5 rounded-full ${
                      s.status === 'absent_unexcused'
                        ? 'bg-rose-600 animate-ping'
                        : s.status === 'absent_excused'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`} />
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-1">
                    <button
                      onClick={() => onUpdateStudentStatus(s.id, 'present')}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        s.status === 'present' || !s.status
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-emerald-50'
                      }`}
                    >
                      Có mặt
                    </button>
                    <button
                      onClick={() => onUpdateStudentStatus(s.id, 'absent_excused')}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        s.status === 'absent_excused'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-amber-50'
                      }`}
                    >
                      Có phép
                    </button>
                    <button
                      onClick={() => onUpdateStudentStatus(s.id, 'absent_unexcused')}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        s.status === 'absent_unexcused'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-rose-50'
                      }`}
                    >
                      Không phép
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Hygiene evaluation & Notes */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-slate-800">Đánh giá Nếp sống Nội vụ Phòng:</span>
                </div>

                <div className="flex items-center gap-2">
                  {(['Tốt', 'Khá', 'Cần khắc phục'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setHygieneStatus(status)}
                      className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                        hygieneStatus === status
                          ? status === 'Tốt' 
                            ? 'bg-emerald-600 text-white' 
                            : status === 'Khá' 
                              ? 'bg-amber-600 text-white' 
                              : 'bg-rose-600 text-white'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Ghi chú của Trưởng phòng..."
                  value={roomNote}
                  onChange={(e) => setRoomNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Submit Bar & Zalo copy */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs">
                {existingRoomReport ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    Đã nộp báo cáo lúc {new Date(existingRoomReport.reportedAt).toLocaleTimeString('vi-VN')}
                  </span>
                ) : (
                  <span className="text-slate-400 italic">
                    Chưa nộp báo cáo ca hôm nay
                  </span>
                )}
                {showSubmitSuccess && (
                  <span className="text-emerald-600 font-bold animate-bounce">
                    Đã gửi báo cáo thành công!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyRoomZalo}
                  className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedZaloMsg ? 'Đã copy tin Zalo!' : 'Copy Tin Zalo gửi Tầng'}</span>
                </button>

                <button
                  onClick={handleRoomSubmitReport}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Báo Cáo Sĩ Số Phòng</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PORTAL 2: FLOOR LEADER */}
      {activePortal === 'floor_leader' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => !isFloorLeader && setSelectedFloorBuilding('Nam')}
                  disabled={isFloorLeader && userSession?.building !== 'Nam'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isFloorLeader && userSession?.building !== 'Nam' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                  } ${
                    selectedFloorBuilding === 'Nam' ? 'bg-[#002B7F] text-white' : 'text-slate-600'
                  }`}
                >
                  Tòa Nam
                </button>
                <button
                  onClick={() => !isFloorLeader && setSelectedFloorBuilding('Nữ')}
                  disabled={isFloorLeader && userSession?.building !== 'Nữ'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isFloorLeader && userSession?.building !== 'Nữ' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                  } ${
                    selectedFloorBuilding === 'Nữ' ? 'bg-[#ED1C24] text-white' : 'text-slate-600'
                  }`}
                >
                  Tòa Nữ
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700">
                  {isFloorLeader ? 'Tầng được phân quyền:' : 'Tầng phụ trách:'}
                </span>
                {isFloorLeader ? (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-100 text-amber-950 border border-amber-300">
                    Tầng {selectedFloor} (Khóa quyền tầng mình)
                  </span>
                ) : (
                  [2, 3, 4, 5, 6].filter(f => selectedFloorBuilding === 'Nam' || f <= 5).map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFloor(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedFloor === f ? 'bg-[#002B7F] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Tầng {f}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="text-xs text-right bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Thời gian nộp tổng hợp:</span>
              <span className="font-bold text-slate-900">22h15 - 22h30 hàng ngày (Điều 4)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">Tiến độ Báo cáo Phòng</div>
              <div className="text-xl font-black text-indigo-700 mt-1">
                {floorStats.reportedRoomsCount} / {floorStats.totalRooms} phòng
              </div>
              <div className="text-[10px] text-slate-400">
                {floorStats.reportedRoomsCount === floorStats.totalRooms ? '100% đã báo cáo' : 'Còn phòng chưa nộp'}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">Tổng quân số Tầng {selectedFloor}</div>
              <div className="text-xl font-black text-slate-900 mt-1">
                {floorStats.totalStudents} học sinh
              </div>
              <div className="text-[10px] text-slate-400">KTX {selectedFloorBuilding}</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] text-emerald-700 font-medium">Đang có mặt</div>
              <div className="text-xl font-black text-emerald-600 mt-1">
                {floorStats.presentTotal} HS
              </div>
              <div className="text-[10px] text-emerald-600">Đã kiểm diện</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] text-rose-700 font-medium">Vắng mặt (Phép / Không phép)</div>
              <div className={`text-xl font-black mt-1 ${floorStats.absentUnexcused > 0 ? 'text-rose-600 animate-pulse' : 'text-amber-600'}`}>
                {floorStats.absentExcused + floorStats.absentUnexcused} HS
              </div>
              <div className="text-[10px] text-slate-400">
                {floorStats.absentExcused} phép • {floorStats.absentUnexcused} không phép
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Trạng thái từng phòng trên Tầng {selectedFloor} ({floorRooms.length} phòng)</span>
              <span className="text-xs font-normal text-slate-500">Bấm phòng để xem chi tiết</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {floorRooms.map(fr => (
                <div
                  key={fr.roomNumber}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                    fr.isReported
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-amber-50/60 border-amber-300 animate-pulse'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-sm">
                      Phòng {fr.roomNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      fr.isReported ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                    }`}>
                      {fr.isReported ? 'Đã báo cáo' : 'Chưa nộp'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex justify-between">
                    <span>Sĩ số: {fr.students.length} HS</span>
                    <span className="font-mono text-slate-500">
                      {fr.students.filter(s => s.status === 'present' || !s.status).length} có mặt
                    </span>
                  </div>

                  {fr.report && (
                    <div className="text-[10px] text-slate-400 border-t border-emerald-200 pt-1 flex justify-between">
                      <span>Nội vụ: {fr.report.hygieneStatus}</span>
                      <span>{new Date(fr.report.reportedAt).toLocaleTimeString('vi-VN')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 pt-3">
              <label className="text-xs font-bold text-slate-700 block">
                Ghi chú tình hình toàn tầng gửi Cán bộ Quản sinh:
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Tầng trật tự tốt, các phòng tự học nghiêm túc..."
                value={floorNote}
                onChange={(e) => setFloorNote(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs">
                  {showFloorSuccess && (
                    <span className="text-emerald-600 font-bold">
                      Đã gửi báo cáo Tầng {selectedFloor} thành công lên Quản sinh!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyFloorZalo}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedFloorZalo ? 'Đã copy tin Zalo!' : 'Copy Tin Zalo 22h15'}</span>
                  </button>

                  <button
                    onClick={handleFloorSubmitReport}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Báo Cáo Quân Số Lên Quản Sinh</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: LIST OF POSTED REPORTS (BÁO CÁO ĐÃ ĐĂNG THEO CHỨC NĂNG NHIỆM VỤ) */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Danh Sách Thống Kê Báo Cáo Nền Nếp & Quân Số Đã Đăng</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isRoomLeader 
                ? `Hiển thị lịch sử báo cáo của Phòng ${selectedRoomNumber} KTX` 
                : isFloorLeader 
                  ? `Hiển thị lịch sử báo cáo của Tầng ${selectedFloor} KTX` 
                  : 'Toàn bộ báo cáo điểm danh 22h00 của các phòng và báo cáo tổng hợp 22h15 của các tầng'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-50 text-[#002B7F] border border-indigo-200 px-3 py-1 rounded-xl font-bold">
              {roomReports.length} báo cáo phòng • {floorReports.length} báo cáo tầng
            </span>
          </div>
        </div>

        {/* Room Reports Table */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <DoorClosed className="w-4 h-4 text-amber-600" />
            <span>1. Báo cáo nề nếp & điểm danh cấp Phòng:</span>
          </div>
          {roomReports.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 italic">
              Chưa có báo cáo phòng nào được lưu trong hệ thống. Hãy gửi báo cáo ở cổng trên.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-800 border-y border-slate-200">
                    <th className="py-2 px-3 font-bold">Thời gian</th>
                    <th className="py-2 px-3 font-bold">Phòng / Tòa</th>
                    <th className="py-2 px-3 font-bold">Người nộp (TP)</th>
                    <th className="py-2 px-3 font-bold text-center">Quân số quản lý</th>
                    <th className="py-2 px-3 font-bold text-center">Có mặt</th>
                    <th className="py-2 px-3 font-bold text-center">Vắng phép</th>
                    <th className="py-2 px-3 font-bold text-center">Vắng không phép</th>
                    <th className="py-2 px-3 font-bold text-center">Nội vụ</th>
                    <th className="py-2 px-3 font-bold">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roomReports
                    .filter(r => !isRoomLeader || r.roomNumber === selectedRoomNumber)
                    .map(rep => (
                      <tr key={rep.id} className="hover:bg-indigo-50/30">
                        <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                          {new Date(rep.reportedAt).toLocaleTimeString('vi-VN')} {new Date(rep.reportedAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-2 px-3 font-bold text-[#002B7F]">
                          Phòng {rep.roomNumber} ({rep.building})
                        </td>
                        <td className="py-2 px-3 text-slate-800">{rep.reportedBy}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold">{rep.totalStudents} HS</td>
                        <td className="py-2 px-3 text-center font-mono text-emerald-700 font-bold">{rep.presentCount}</td>
                        <td className="py-2 px-3 text-center font-mono text-amber-700">{rep.absentExcusedCount}</td>
                        <td className="py-2 px-3 text-center font-mono text-rose-700 font-bold">{rep.absentUnexcusedCount}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rep.hygieneStatus === 'Tốt' ? 'bg-emerald-100 text-emerald-800' :
                            rep.hygieneStatus === 'Khá' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {rep.hygieneStatus}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600 max-w-[200px] truncate">
                          {rep.note || <span className="text-slate-400 italic">Không có ghi chú</span>}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Floor Reports Table */}
        <div className="space-y-2 pt-2">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-700" />
            <span>2. Báo cáo tổng hợp quân số cấp Tầng:</span>
          </div>
          {floorReports.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 italic">
              Chưa có báo cáo tầng nào được lưu trong hệ thống.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-800 border-y border-slate-200">
                    <th className="py-2 px-3 font-bold">Thời gian</th>
                    <th className="py-2 px-3 font-bold">Tầng / Tòa</th>
                    <th className="py-2 px-3 font-bold">Người nộp (TT)</th>
                    <th className="py-2 px-3 font-bold text-center">Phòng nộp</th>
                    <th className="py-2 px-3 font-bold text-center">Tổng quân số</th>
                    <th className="py-2 px-3 font-bold text-center">Có mặt</th>
                    <th className="py-2 px-3 font-bold text-center">Vắng phép</th>
                    <th className="py-2 px-3 font-bold text-center">Vắng không phép</th>
                    <th className="py-2 px-3 font-bold">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {floorReports
                    .filter(f => !isFloorLeader || f.floor === selectedFloor)
                    .map(rep => (
                      <tr key={rep.id} className="hover:bg-blue-50/30">
                        <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                          {new Date(rep.reportedAt).toLocaleTimeString('vi-VN')} {new Date(rep.reportedAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-2 px-3 font-bold text-blue-800">
                          Tầng {rep.floor} ({rep.building})
                        </td>
                        <td className="py-2 px-3 text-slate-800">{rep.reportedBy}</td>
                        <td className="py-2 px-3 text-center font-mono">
                          {rep.reportedRoomsCount} / {rep.totalRooms}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold">{rep.totalStudents} HS</td>
                        <td className="py-2 px-3 text-center font-mono text-emerald-700 font-bold">{rep.presentTotal}</td>
                        <td className="py-2 px-3 text-center font-mono text-amber-700">{rep.absentExcusedTotal}</td>
                        <td className="py-2 px-3 text-center font-mono text-rose-700 font-bold">{rep.absentUnexcusedTotal}</td>
                        <td className="py-2 px-3 text-slate-600 max-w-[200px] truncate">
                          {rep.note || <span className="text-slate-400 italic">Không có</span>}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
