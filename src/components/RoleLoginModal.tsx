import React, { useState, useMemo } from 'react';
import { 
  KeyRound, 
  Unlock, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  Eye, 
  EyeOff, 
  UserCheck, 
  FileText,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Student, UserRoleType, UserSession } from '../types';
import { 
  ROLE_ACCOUNTS, 
  BASE_ROLE_ACCOUNTS, 
  HOMEROOM_54_ACCOUNTS, 
  RoleAccount, 
  HOMEROOM_SHARED_PASSWORD, 
  formatClassUsername 
} from '../data/authAccounts';
import { CLASSES_LIST, CLASS_TEACHERS } from '../data/schoolConfig';

interface RoleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: UserSession;
  onLoginSession: (session: UserSession) => void;
  students: Student[];
}

export const RoleLoginModal: React.FC<RoleLoginModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onLoginSession,
  students
}) => {
  if (!isOpen) return null;

  // Selected category: 'base_roles' | 'homeroom_54'
  const [roleCategory, setRoleCategory] = useState<'base_roles' | 'homeroom_54'>(() => {
    return currentSession.role === 'homeroom' ? 'homeroom_54' : 'base_roles';
  });

  const [selectedAccountId, setSelectedAccountId] = useState<string>(() => {
    if (currentSession.role === 'homeroom' && currentSession.className) {
      const match = HOMEROOM_54_ACCOUNTS.find(a => a.className === currentSession.className);
      if (match) return match.id;
    }
    const found = BASE_ROLE_ACCOUNTS.find(a => a.role === currentSession.role);
    return found ? found.id : 'acc_admin';
  });

  const selectedAccount = useMemo(() => {
    return ROLE_ACCOUNTS.find(a => a.id === selectedAccountId) || BASE_ROLE_ACCOUNTS[0];
  }, [selectedAccountId]);

  const [usernameInput, setUsernameInput] = useState(selectedAccount.username);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search filter for 54 homeroom classes
  const [classSearch, setClassSearch] = useState('');

  // Selected context for dormitory
  const [roomBuilding, setRoomBuilding] = useState<'Nam' | 'Nữ'>(currentSession.building || 'Nam');
  const [roomNumber, setRoomNumber] = useState<string>(currentSession.roomNumber || '2.1');
  const [floorBuilding, setFloorBuilding] = useState<'Nam' | 'Nữ'>(currentSession.building || 'Nam');
  const [floorNumber, setFloorNumber] = useState<number>(currentSession.floor || 2);

  const [modalTab, setModalTab] = useState<'login' | 'duties_table'>('login');

  const availableRooms = useMemo(() => {
    const set = new Set<string>();
    students.filter(s => s.isBoarding && s.dormBuilding === roomBuilding && s.room).forEach(s => {
      set.add(s.room!);
    });
    return Array.from(set).sort((a, b) => {
      const [fA, rA] = a.split('.').map(n => parseInt(n, 10) || 0);
      const [fB, rB] = b.split('.').map(n => parseInt(n, 10) || 0);
      if (fA !== fB) return fA - fB;
      return rA - rB;
    });
  }, [students, roomBuilding]);

  const detectedRoomLeader = useMemo(() => {
    return students.find(s => 
      s.isBoarding && 
      s.dormBuilding === roomBuilding && 
      s.room === roomNumber && 
      s.isRoomLeader
    ) || students.find(s => 
      s.isBoarding && 
      s.dormBuilding === roomBuilding && 
      s.room === roomNumber
    ) || null;
  }, [students, roomBuilding, roomNumber]);

  // Filtered 54 classes list
  const filteredHomeroomAccounts = useMemo(() => {
    if (!classSearch.trim()) return HOMEROOM_54_ACCOUNTS;
    const term = classSearch.toLowerCase();
    return HOMEROOM_54_ACCOUNTS.filter(a => 
      a.className?.toLowerCase().includes(term) ||
      a.fullName.toLowerCase().includes(term) ||
      a.username.toLowerCase().includes(term)
    );
  }, [classSearch]);

  const handleSelectAccount = (acc: RoleAccount) => {
    setSelectedAccountId(acc.id);
    setUsernameInput(acc.username);
    setPasswordInput('');
    setErrorMessage(null);
  };

  const handleQuickFillPassword = (acc: RoleAccount) => {
    setSelectedAccountId(acc.id);
    setUsernameInput(acc.username);
    setPasswordInput(acc.password);
    setErrorMessage(null);
  };

  const handleSubmitLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    // Validate account
    const targetAccount = ROLE_ACCOUNTS.find(a => a.username.toLowerCase() === usernameInput.trim().toLowerCase());
    if (!targetAccount) {
      setErrorMessage(`Tên đăng nhập "${usernameInput}" không tồn tại trong hệ thống trường.`);
      return;
    }

    if (passwordInput !== targetAccount.password) {
      setErrorMessage(`Mật khẩu không chính xác cho "${targetAccount.title}". Vui lòng thử lại!`);
      return;
    }

    let finalDisplayName = targetAccount.fullName;
    if (targetAccount.role === 'homeroom' && targetAccount.className) {
      const gvcn = CLASS_TEACHERS[targetAccount.className] || 'GVCN';
      finalDisplayName = `${gvcn} (GVCN ${targetAccount.className})`;
    } else if (targetAccount.role === 'room_leader') {
      finalDisplayName = detectedRoomLeader 
        ? `Trưởng phòng ${roomNumber} (${detectedRoomLeader.name})` 
        : `Trưởng phòng ${roomNumber} (${roomBuilding})`;
    } else if (targetAccount.role === 'floor_leader') {
      finalDisplayName = `Trưởng tầng ${floorNumber} (KTX ${floorBuilding})`;
    }

    const session: UserSession = {
      role: targetAccount.role,
      username: targetAccount.username,
      displayName: finalDisplayName,
      dutyTitle: targetAccount.title,
      dutySummary: targetAccount.dutySummary,
      mandates: targetAccount.mandates,
      allowedTabs: targetAccount.allowedTabs,
      className: targetAccount.role === 'homeroom' ? targetAccount.className : undefined,
      building: targetAccount.role === 'room_leader' ? roomBuilding : targetAccount.role === 'floor_leader' ? floorBuilding : undefined,
      roomNumber: targetAccount.role === 'room_leader' ? roomNumber : undefined,
      floor: targetAccount.role === 'floor_leader' ? floorNumber : targetAccount.role === 'room_leader' ? (parseInt(roomNumber.split('.')[0], 10) || 2) : undefined
    };

    onLoginSession(session);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 text-slate-900 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[94vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-[#002B7F] border border-blue-100 shadow-xs">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg uppercase text-slate-900 flex items-center gap-2">
                <span>Phân Quyền Đăng Nhập & Mật Khẩu Riêng</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-sans font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  54 Lớp & Các Bộ Phận
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                • GVCN 54 lớp: 54 tài khoản riêng (lớp nào chỉ thấy lớp đó) • GV Chi đoàn: Trực Tòa A & KPI toàn trường • Chỉ BGH/Quản trị mới thấy hết
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setModalTab('login')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              modalTab === 'login'
                ? 'bg-white text-[#002B7F] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Đăng Nhập Theo Chức Năng Nhiệm Vụ</span>
          </button>

          <button
            type="button"
            onClick={() => setModalTab('duties_table')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              modalTab === 'duties_table'
                ? 'bg-white text-[#002B7F] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Danh Sách 54 Tài Khoản GVCN & Các Ban</span>
          </button>
        </div>

        {/* TAB 1: LOGIN FORM */}
        {modalTab === 'login' && (
          <div className="space-y-4">
            
            {/* Category toggle */}
            <div className="flex items-center gap-2 pb-1">
              <span className="text-xs font-bold text-slate-700">Chọn nhóm đối tượng:</span>
              <button
                type="button"
                onClick={() => {
                  setRoleCategory('homeroom_54');
                  const firstClass = HOMEROOM_54_ACCOUNTS[0];
                  handleSelectAccount(firstClass);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  roleCategory === 'homeroom_54'
                    ? 'bg-[#002B7F] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                👨‍🏫 Giáo viên Chủ nhiệm (54 Lớp Chuyên)
              </button>

              <button
                type="button"
                onClick={() => {
                  setRoleCategory('base_roles');
                  handleSelectAccount(BASE_ROLE_ACCOUNTS[0]);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  roleCategory === 'base_roles'
                    ? 'bg-[#002B7F] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🏛️ Ban Giám hiệu, Quản sinh, GV Chi đoàn, Tự quản KTX
              </button>
            </div>

            {/* SELECTION FOR 54 HOMEROOM TEACHERS */}
            {roleCategory === 'homeroom_54' && (
              <div className="space-y-2 p-3 bg-blue-50/60 rounded-2xl border border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-[#002B7F] flex items-center gap-1.5">
                    <span>Chọn lớp chủ nhiệm (54 tài khoản riêng, mật khẩu chung <strong>{HOMEROOM_SHARED_PASSWORD}</strong>):</span>
                  </label>
                  <div className="relative w-full sm:w-60">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm tên lớp hoặc GVCN..."
                      value={classSearch}
                      onChange={(e) => setClassSearch(e.target.value)}
                      className="w-full pl-8 pr-2 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto p-1 bg-white rounded-xl border border-blue-100">
                  {filteredHomeroomAccounts.map(acc => {
                    const isSelected = selectedAccountId === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleSelectAccount(acc)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#002B7F] text-white border-[#002B7F] shadow-xs'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-bold text-xs truncate">{acc.className}</div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-amber-200' : 'text-slate-500'}`}>
                          {CLASS_TEACHERS[acc.className!] || 'GVCN'}
                        </div>
                        <div className={`text-[9px] font-mono truncate mt-0.5 ${isSelected ? 'text-blue-200' : 'text-blue-600 font-semibold'}`}>
                          {acc.username}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SELECTION FOR BASE ROLES */}
            {roleCategory === 'base_roles' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Chọn ban chức năng nhiệm vụ:
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BASE_ROLE_ACCOUNTS.map((acc) => {
                    const isSelected = selectedAccountId === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleSelectAccount(acc)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#002B7F] bg-blue-50/70 ring-2 ring-blue-300 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{acc.avatarEmoji}</span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          )}
                        </div>
                        <div className="font-bold text-xs text-slate-900 mt-1 truncate">
                          {acc.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          User: <span className="text-blue-700 font-bold">{acc.username}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dorm parameters for Room Leader & Floor Leader */}
            {selectedAccount.role === 'room_leader' && (
              <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-200/80 space-y-2 text-xs">
                <div className="font-bold text-indigo-950">
                  Chọn Tòa nhà và Số phòng KTX bạn làm Trưởng phòng:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-600 block mb-0.5">Tòa KTX:</span>
                    <select
                      value={roomBuilding}
                      onChange={(e) => setRoomBuilding(e.target.value as 'Nam' | 'Nữ')}
                      className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-bold cursor-pointer"
                    >
                      <option value="Nam">KTX Nam</option>
                      <option value="Nữ">KTX Nữ</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-600 block mb-0.5">Số phòng:</span>
                    <select
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-bold text-[#002B7F] cursor-pointer"
                    >
                      {availableRooms.map((r) => (
                        <option key={r} value={r}>Phòng {r}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {selectedAccount.role === 'floor_leader' && (
              <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-200/80 space-y-2 text-xs">
                <div className="font-bold text-indigo-950">
                  Chọn Tòa nhà và Tầng phụ trách:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-600 block mb-0.5">Tòa KTX:</span>
                    <select
                      value={floorBuilding}
                      onChange={(e) => setFloorBuilding(e.target.value as 'Nam' | 'Nữ')}
                      className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-bold cursor-pointer"
                    >
                      <option value="Nam">KTX Nam</option>
                      <option value="Nữ">KTX Nữ</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-600 block mb-0.5">Tầng quản lý:</span>
                    <select
                      value={floorNumber}
                      onChange={(e) => setFloorNumber(parseInt(e.target.value, 10))}
                      className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-bold text-[#002B7F] cursor-pointer"
                    >
                      {[2, 3, 4, 5, 6].map((fl) => (
                        <option key={fl} value={fl}>Tầng {fl}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Credentials Input Form */}
            <form onSubmit={handleSubmitLogin} className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tên đăng nhập (Username):
                  </label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#002B7F]"
                    placeholder="Tên tài khoản..."
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">
                      Mật khẩu riêng:
                    </label>
                    <button
                      type="button"
                      onClick={() => handleQuickFillPassword(selectedAccount)}
                      className="text-[10px] text-blue-700 hover:underline font-semibold cursor-pointer"
                    >
                      Điền mật khẩu mẫu
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs pr-9 focus:ring-2 focus:ring-[#002B7F]"
                      placeholder="Nhập mật khẩu..."
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Chức năng nhiệm vụ thẻ tóm tắt */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Quyền hạn & Hiển thị của {selectedAccount.title}:</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {selectedAccount.dutySummary}
                </p>
                {selectedAccount.restrictedNotice && (
                  <div className="text-[11px] text-amber-800 font-semibold mt-1">
                    {selectedAccount.restrictedNotice}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleQuickFillPassword(selectedAccount)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Mật khẩu tài khoản này: <span className="font-mono text-blue-800 font-bold">{selectedAccount.password}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#002B7F] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5 text-amber-300" />
                    <span>Xác nhận Đăng nhập</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: DUTIES TABLE & ALL PASSWORDS */}
        {modalTab === 'duties_table' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Quy tắc phân quyền hiển thị:
              <br />• <strong>GV Chi đoàn:</strong> Hiển thị Trực Tòa A & Bảng xếp hạng KPI học sinh toàn trường 54 lớp.
              <br />• <strong>GVCN 54 lớp:</strong> 54 tài khoản riêng (chỉ hiển thị đúng học sinh và bảng KPI của lớp mình), mật khẩu chung <code>{HOMEROOM_SHARED_PASSWORD}</code>.
              <br />• <strong>Chỉ Ban Giám hiệu & Quản trị:</strong> Hiển thị toàn bộ 54 lớp, toàn bộ 699 học sinh nội trú và chỉnh sửa toàn bộ cấu hình.
            </p>

            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1 text-xs">
              {BASE_ROLE_ACCOUNTS.map((acc) => (
                <div
                  key={acc.id}
                  className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{acc.avatarEmoji}</span>
                      <span>{acc.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                        User: <strong>{acc.username}</strong>
                      </span>
                      <span className="font-mono text-[10px] bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                        Pass: <strong>{acc.password}</strong>
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600">{acc.dutySummary}</p>
                </div>
              ))}

              <div className="pt-2 font-bold text-slate-800 text-xs">
                Danh sách 54 tài khoản riêng của Giáo viên Chủ nhiệm (Mật khẩu chung: <code className="text-blue-700">{HOMEROOM_SHARED_PASSWORD}</code>):
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HOMEROOM_54_ACCOUNTS.map(acc => (
                  <div
                    key={acc.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{acc.className}</div>
                      <div className="text-[10px] text-slate-500">{CLASS_TEACHERS[acc.className!] || 'GVCN'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[10px] text-blue-800 font-bold">{acc.username}</div>
                      <button
                        type="button"
                        onClick={() => {
                          handleQuickFillPassword(acc);
                          setModalTab('login');
                        }}
                        className="text-[10px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                      >
                        Đăng nhập lớp này →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalTab('login')}
                className="px-4 py-2 bg-[#002B7F] text-white rounded-xl text-xs font-bold hover:bg-blue-900 transition-all cursor-pointer"
              >
                Quay lại khung Đăng nhập →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
