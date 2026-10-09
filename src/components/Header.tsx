import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  ShieldCheck, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  Calendar, 
  Layers, 
  UserPlus, 
  DoorClosed,
  Settings,
  BellRing,
  KeyRound,
  Image as ImageIcon,
  Upload,
  Check,
  Sliders
} from 'lucide-react';
import { DORM_REGIMES } from '../data/regimesData';
import { AppConfig, CAMPUS_BACKGROUND_PRESETS } from '../data/appConfig';
import { SchoolLogo } from './SchoolLogo';

interface HeaderProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  onQuickAction?: (action: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  config: AppConfig;
  boardingStats: {
    total: number;
    present: number;
    excused: number;
    unexcused: number;
    violationsCount: number;
  };
  userSession?: {
    role: string;
    displayName: string;
    roomNumber?: string;
    building?: string;
    floor?: number;
  };
  onOpenRoleLoginModal?: () => void;
  onUpdateBackground?: (imageUrl: string, opacity?: number, brightness?: number, saturation?: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  config,
  boardingStats,
  userSession,
  onOpenRoleLoginModal,
  onUpdateBackground
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [accessDeniedNotice, setAccessDeniedNotice] = useState<string | null>(null);
  const [showBgModal, setShowBgModal] = useState(false);
  const [tempBgUrl, setTempBgUrl] = useState(config.backgroundImageUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80');
  const [tempOpacity, setTempOpacity] = useState(config.backgroundOverlayOpacity ?? 0.28);
  const [tempBrightness, setTempBrightness] = useState(config.backgroundBrightness ?? 102);
  const [tempSaturation, setTempSaturation] = useState(config.backgroundSaturation ?? 110);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);

  useEffect(() => {
    if (config.backgroundImageUrl) setTempBgUrl(config.backgroundImageUrl);
    if (typeof config.backgroundOverlayOpacity === 'number') setTempOpacity(config.backgroundOverlayOpacity);
    if (typeof config.backgroundBrightness === 'number') setTempBrightness(config.backgroundBrightness);
    if (typeof config.backgroundSaturation === 'number') setTempSaturation(config.backgroundSaturation);
  }, [config.backgroundImageUrl, config.backgroundOverlayOpacity, config.backgroundBrightness, config.backgroundSaturation]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setTempBgUrl(reader.result);
        if (onUpdateBackground) {
          onUpdateBackground(reader.result, tempOpacity, tempBrightness, tempSaturation);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (url: string) => {
    setTempBgUrl(url);
    if (onUpdateBackground) {
      onUpdateBackground(url, tempOpacity, tempBrightness, tempSaturation);
    }
  };

  const handleApplyClarityPreset = (opacity: number, brightness: number, saturation: number) => {
    setTempOpacity(opacity);
    setTempBrightness(brightness);
    setTempSaturation(saturation);
    if (onUpdateBackground) {
      onUpdateBackground(tempBgUrl, opacity, brightness, saturation);
    }
  };

  const handleSaveBackground = () => {
    if (onUpdateBackground) {
      onUpdateBackground(tempBgUrl, tempOpacity, tempBrightness, tempSaturation);
    }
    setSavedSuccessMsg(true);
    setTimeout(() => {
      setSavedSuccessMsg(false);
      setShowBgModal(false);
    }, 800);
  };

  const isRestrictedRole = currentRole === 'room_leader' || currentRole === 'floor_leader';

  const handleTabClick = (tabName: string) => {
    if (isRestrictedRole) {
      if (tabName !== 'self_governance' && tabName !== 'regimes') {
        const msg = currentRole === 'room_leader'
          ? `🔒 Quyền Trưởng phòng KTX: Bạn chỉ có quyền điểm danh phòng ${userSession?.roomNumber || 'mình'}. Các mục quản trị khác đã được bảo vệ.`
          : `🔒 Quyền Trưởng tầng KTX: Bạn chỉ có quyền kiểm tra và báo cáo Tầng ${userSession?.floor || 'mình'}. Các mục quản trị khác đã được bảo vệ.`;
        setAccessDeniedNotice(msg);
        setTimeout(() => setAccessDeniedNotice(null), 4000);
        return;
      }
    }
    onTabChange(tabName);
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = time.getHours();
  const currentMinute = time.getMinutes();
  const currentTimeVal = currentHour * 60 + currentMinute;

  const currentRegime = config.regimes.find(r => {
    const s = r.startHour * 60 + r.startMin;
    const e = r.endHour * 60 + r.endMin;
    return currentTimeVal >= s && currentTimeVal <= e;
  }) || (currentTimeVal >= 22 * 60 + 30 || currentTimeVal < 5 * 60 + 15 
    ? { id: 11, name: 'Giờ giới nghiêm - Khóa cửa & Nghỉ ngơi', timeRange: '22h30 - 05h15' } 
    : config.regimes[5] || DORM_REGIMES[5]);

  const isGateLocked = currentTimeVal >= 18 * 60 || currentTimeVal < 6 * 60;

  return (
    <header className="relative bg-gradient-to-r from-[#001744] via-[#002B7F] to-[#00143a] backdrop-blur-md text-white shadow-2xl border-b-2 border-amber-400/50 sticky top-0 z-40 overflow-hidden font-admin">
      {/* Top Administrative Document Banner (Nghị định 30/2020/NĐ-CP chuẩn thể thức văn bản hành chính) */}
      <div className="relative z-10 bg-[#00102e]/98 border-b border-amber-400/20 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Cơ quan cấp trên & Cơ quan ban hành (Decree 30) */}
          <div className="text-center sm:text-left">
            <div className="font-bold text-[11px] sm:text-xs uppercase tracking-wider text-slate-300">
              {config.schoolDept}
            </div>
            <div className="font-black text-xs sm:text-sm text-amber-300 uppercase tracking-wide flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {config.schoolName}
            </div>
            <div className="w-24 h-0.5 bg-amber-400 mx-auto sm:mx-0 mt-0.5"></div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Số: 30/QĐ-THPTCHV • Ban hành theo Nghị định số 30/2020/NĐ-CP
            </div>
          </div>

          {/* Quốc hiệu & Tiêu ngữ chuẩn thể thức hành chính */}
          <div className="text-center sm:text-right">
            <div className="font-black text-[11px] sm:text-xs uppercase tracking-wider text-white">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="font-bold text-[11px] sm:text-xs text-amber-300 tracking-wide mt-0.5">
              Độc lập - Tự do - Hạnh phúc
            </div>
            <div className="w-32 h-0.5 bg-amber-400 mx-auto sm:ml-auto sm:mr-0 mt-0.5"></div>
            <div className="text-[10px] text-slate-300 italic mt-0.5">
              Phú Thọ, {config.academicYear}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Announcement Banner */}
      {config.announcement.enabled && config.announcement.text && (
        <div className={`relative z-10 px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 border-b ${
          config.announcement.type === 'alert'
            ? 'bg-rose-900/90 text-rose-100 border-rose-700'
            : config.announcement.type === 'warning'
              ? 'bg-amber-900/90 text-amber-100 border-amber-700'
              : 'bg-blue-900/90 text-blue-100 border-blue-700'
        }`}>
          <BellRing className="w-3.5 h-3.5 animate-pulse flex-shrink-0" />
          <span className="text-center truncate">{config.announcement.text}</span>
        </div>
      )}

      {/* Main branding & control bar */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo & Administrative Title */}
          <div 
            onClick={() => onTabChange('dorm')} 
            className="flex items-center gap-3.5 cursor-pointer group"
            title="Về trang tổng quan Ký túc xá"
          >
            <div className="p-1.5 rounded-2xl bg-white/10 group-hover:bg-white/20 transition-all border border-amber-400/40 shadow-lg">
              <SchoolLogo size={54} customUrl={config.logoUrl} className="drop-shadow-md group-hover:scale-105 transition-transform" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white uppercase group-hover:text-amber-300 transition-colors">
                  {config.schoolSubtitle}
                </h1>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
                  {config.academicYear}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-200/90 font-bold mt-0.5">
                {config.schoolName} • TỈNH PHÚ THỌ
              </p>
              {config.slogan && (
                <div className="text-[11px] text-amber-300 font-medium hidden md:block mt-0.5 tracking-wide">
                  ⭐ {config.slogan}
                </div>
              )}
            </div>
          </div>

          {/* Regime Status & Role Selector */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Current Military Regime Box */}
            <div className="bg-[#001744]/80 border border-amber-400/40 rounded-xl px-3 py-2 flex items-center gap-3 shadow-inner">
              <div className="w-9 h-9 rounded-lg bg-blue-600/40 border border-blue-400/50 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  11 Chế độ KTX Quân đội:
                </div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate max-w-[210px] sm:max-w-[260px]">
                  <span>{currentRegime.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 border border-amber-400/30">
                    {currentRegime.timeRange}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Role Switch */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBgModal(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 border border-amber-300 text-xs font-black rounded-xl shadow-lg hover:shadow-amber-500/40 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Thay đổi phông nền trường học & chỉnh sửa ảnh thật rõ nét, đẹp sinh động"
              >
                <ImageIcon className="w-4 h-4 text-slate-950" />
                <span>Ảnh nền trường</span>
                <span className="hidden sm:inline text-[10px] bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded-full font-bold">
                  Sắc nét
                </span>
              </button>

              <div className="flex items-center gap-1.5 bg-[#00143a]/90 border border-amber-400/40 p-1 rounded-xl">
                <span className="text-[11px] font-bold text-amber-300 px-2 hidden sm:inline">
                  {userSession?.displayName ? userSession.displayName : 'Vai trò:'}
                </span>
                <select
                  value={currentRole}
                  onChange={(e) => onRoleChange(e.target.value)}
                  className="bg-[#002B7F] text-amber-200 border border-amber-400/40 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                >
                  <option value="admin">🏛️ Ban Giám hiệu / Quản trị</option>
                  <option value="homeroom">👨‍🏫 GVCN 54 lớp (Tài khoản riêng)</option>
                  <option value="youth_union">📋 GV Chi đoàn (Trực Tòa A)</option>
                  <option value="warden">🔑 Cán bộ Quản sinh KTX</option>
                  <option value="room_leader">🛏️ Trưởng phòng KTX (Chỉ phòng mình)</option>
                  <option value="floor_leader">🏢 Trưởng tầng KTX (Chỉ tầng mình)</option>
                </select>
              </div>

              {onOpenRoleLoginModal && (
                <button
                  type="button"
                  onClick={onOpenRoleLoginModal}
                  className="px-3 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
                  title="Đăng nhập phân quyền theo chức năng nhiệm vụ"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Đăng nhập phân quyền</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 mt-3 pt-3 border-t border-indigo-700/30">
          <div className="bg-slate-900/60 border border-white/10 rounded-lg px-3 py-1.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400">KTX Nội trú</div>
              <div className="text-sm font-bold text-white">{boardingStats.total} học sinh</div>
            </div>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-lg px-3 py-1.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400">Quân số hiện diện</div>
              <div className="text-sm font-bold text-emerald-400">{boardingStats.present} HS</div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-lg px-3 py-1.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400">Vắng có phép</div>
              <div className="text-sm font-bold text-amber-400">{boardingStats.excused} HS</div>
            </div>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-lg px-3 py-1.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400">Vắng không phép</div>
              <div className={`text-sm font-bold ${boardingStats.unexcused > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
                {boardingStats.unexcused} HS
              </div>
            </div>
            <AlertCircle className={`w-4 h-4 ${boardingStats.unexcused > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-slate-900/60 border border-white/10 rounded-lg px-3 py-1.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400">Vi phạm KPI ghi nhận</div>
              <div className="text-sm font-bold text-rose-300">{boardingStats.violationsCount} vụ việc</div>
            </div>
            <ShieldCheck className="w-4 h-4 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Access Denied notice banner */}
      {accessDeniedNotice && (
        <div className="bg-amber-950/95 border-b border-amber-500/60 px-4 py-2 text-xs font-bold text-amber-200 flex items-center justify-center gap-2">
          <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
          <span>{accessDeniedNotice}</span>
        </div>
      )}

      {/* Navigation Tabs (Logo Palette: Royal Blue #002B7F, Amber #F59E0B, Crimson #ED1C24) */}
      <div className="bg-[#001233]/95 border-t border-amber-400/30 px-4 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 py-1.5 min-w-max">
          <button
            onClick={() => handleTabClick('dorm')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dorm'
                ? 'bg-gradient-to-r from-[#002B7F] to-[#003899] text-amber-300 border border-amber-400/60 shadow-md ring-1 ring-amber-400/40 font-bold'
                : isRestrictedRole
                  ? 'text-slate-500 opacity-60 hover:opacity-100 hover:text-amber-200'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            {isRestrictedRole ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Building2 className="w-4 h-4 text-amber-300" />}
            <span>Ký túc xá & Phòng ở</span>
            <span className="text-[10px] bg-[#001744] text-amber-200 px-1.5 py-0.5 rounded-full border border-amber-400/40 font-bold">
              {boardingStats.total} HS
            </span>
          </button>

          <button
            onClick={() => handleTabClick('regimes')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'regimes'
                ? 'bg-gradient-to-r from-[#002B7F] to-[#003899] text-amber-300 border border-amber-400/60 shadow-md ring-1 ring-amber-400/40 font-bold'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-300" />
            <span>11 Chế độ sinh hoạt KTX</span>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-400/40 font-bold">
              Chuẩn Quân Đội
            </span>
          </button>

          <button
            onClick={() => handleTabClick('school')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'school'
                ? 'bg-gradient-to-r from-[#002B7F] to-[#003899] text-amber-300 border border-amber-400/60 shadow-md ring-1 ring-amber-400/40 font-bold'
                : isRestrictedRole
                  ? 'text-slate-500 opacity-60 hover:opacity-100 hover:text-amber-200'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            {isRestrictedRole ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Users className="w-4 h-4 text-amber-300" />}
            <span>Học sinh Toàn trường & Tòa A</span>
            <span className="text-[10px] bg-[#001744] text-slate-200 px-1.5 py-0.5 rounded-full border border-white/20">
              54 Lớp
            </span>
          </button>

          <button
            onClick={() => handleTabClick('manage_students')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'manage_students'
                ? 'bg-gradient-to-r from-[#002B7F] to-[#003899] text-amber-300 border border-amber-400/60 shadow-md ring-1 ring-amber-400/40 font-bold'
                : isRestrictedRole
                  ? 'text-slate-500 opacity-60 hover:opacity-100 hover:text-amber-200'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            {isRestrictedRole ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <UserPlus className="w-4 h-4 text-amber-300" />}
            <span>Thêm/Xóa & Lên lớp</span>
            <span className="text-[10px] bg-red-950/80 text-rose-200 px-1.5 py-0.5 rounded-full border border-rose-400/30">
              Ra trường
            </span>
          </button>

          <button
            onClick={() => handleTabClick('self_governance')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'self_governance'
                ? 'bg-gradient-to-r from-[#B91C1C] to-[#ED1C24] text-white shadow-md ring-2 ring-amber-400 font-bold'
                : 'text-amber-300 hover:text-white hover:bg-amber-400/10 font-bold'
            }`}
          >
            <DoorClosed className="w-4 h-4 text-amber-300" />
            <span>Trưởng phòng & Trưởng tầng</span>
            <span className="text-[10px] bg-amber-400/20 text-amber-200 px-1.5 py-0.5 rounded-full border border-amber-400/40">
              {isRestrictedRole ? '⭐ Đang mở' : 'Đăng báo cáo'}
            </span>
          </button>

          <button
            onClick={() => handleTabClick('discipline')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'discipline'
                ? 'bg-gradient-to-r from-[#002B7F] to-[#003899] text-amber-300 border border-amber-400/60 shadow-md ring-1 ring-amber-400/40 font-bold'
                : isRestrictedRole
                  ? 'text-slate-500 opacity-60 hover:opacity-100 hover:text-amber-200'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            {isRestrictedRole ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <ShieldCheck className="w-4 h-4 text-rose-400" />}
            <span>Kỷ luật & Sổ KPI (L01-L10)</span>
            {boardingStats.violationsCount > 0 && (
              <span className="text-[10px] bg-[#ED1C24] text-white px-1.5 py-0.5 rounded-full font-bold">
                {boardingStats.violationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabClick('leave')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'leave'
                ? 'bg-gradient-to-r from-[#002B7F] to-[#003899] text-amber-300 border border-amber-400/60 shadow-md ring-1 ring-amber-400/40 font-bold'
                : isRestrictedRole
                  ? 'text-slate-500 opacity-60 hover:opacity-100 hover:text-amber-200'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            {isRestrictedRole ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Calendar className="w-4 h-4 text-amber-300" />}
            <span>Đơn xin phép & Ra/Vào</span>
            <span className="text-[10px] bg-[#001744] text-slate-300 px-1.5 py-0.5 rounded-full border border-white/20">
              Về quê/Học thêm
            </span>
          </button>

          <button
            onClick={() => handleTabClick('analytics')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-[#002B7F] via-[#003899] to-[#002060] text-amber-300 border-2 border-amber-400 shadow-xl ring-2 ring-amber-400/50 font-black'
                : isRestrictedRole
                  ? 'text-slate-500 opacity-60 hover:opacity-100 hover:text-amber-200'
                  : 'text-amber-200 hover:text-white hover:bg-white/10 font-bold'
            }`}
          >
            {isRestrictedRole ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Layers className="w-4 h-4 text-amber-300" />}
            <span>Thống kê & KPI Nghị Định 30</span>
            <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-full font-black">
              Lớp • Khối • Trường
            </span>
          </button>

          <button
            onClick={() => handleTabClick('admin_config')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'admin_config'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                : isRestrictedRole
                  ? 'text-slate-500 opacity-60 hover:opacity-100 hover:text-amber-200'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {isRestrictedRole ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Settings className="w-4 h-4 text-pink-300" />}
            <span>Quản trị & Cấu hình</span>
          </button>
        </div>
      </div>

      {/* QUICK BACKGROUND CHANGER MODAL */}
      {showBgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 text-slate-900 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-[#002B7F] border border-blue-100">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg uppercase text-slate-900 flex items-center gap-2">
                    <span>Thay Đổi Phông Nền & Độ Rõ Nét Sinh Động</span>
                    <span className="text-[11px] bg-amber-100 text-amber-800 font-sans font-bold px-2 py-0.5 rounded-full border border-amber-300">
                      Chuẩn HD/4K
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Khuôn viên trường THPT Chuyên Hùng Vương hiển thị rõ nét, tươi sáng, mang sắc xanh chủ đạo của Logo
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBgModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>1. Chọn nhanh ảnh khuôn viên trường THPT Chuyên Hùng Vương:</span>
                </label>
                <span className="text-[11px] text-indigo-700 font-semibold">Bấm ảnh để xem trước trực tiếp</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CAMPUS_BACKGROUND_PRESETS.map((preset) => {
                  const isSelected = tempBgUrl === preset.imageUrl;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset.imageUrl)}
                      className={`relative rounded-xl overflow-hidden border-2 text-left group transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'border-[#002B7F] ring-2 ring-blue-400 shadow-md scale-[1.02]' 
                          : 'border-slate-200 hover:border-blue-400 hover:shadow-sm'
                      }`}
                    >
                      <div className="h-28 w-full relative overflow-hidden bg-slate-900">
                        <img 
                          src={preset.imageUrl} 
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-[#002B7F] text-amber-300 rounded-full p-1 shadow-md border border-amber-300">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                        <div className="absolute bottom-1.5 left-2 right-2 text-[10px] text-white font-bold leading-tight drop-shadow-md">
                          {preset.id === 'chv_gate' ? '⭐ Nổi bật nhất' : preset.id === 'chv_dorm' ? '🏢 KTX Hiện đại' : '🏫 Khuôn viên'}
                        </div>
                      </div>
                      <div className="p-2 bg-white">
                        <div className="font-bold text-slate-800 text-[11px] truncate">{preset.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Sharpness & Clarity Presets */}
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50/70 rounded-2xl border border-blue-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-700" />
                  <span>2. Chế độ hiển thị độ nét & sinh động:</span>
                </span>
                <span className="text-[11px] font-semibold text-blue-800 font-mono">
                  Lớp phủ: {Math.round(tempOpacity * 100)}% • Sáng: {tempBrightness}% • Rực rỡ: {tempSaturation}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyClarityPreset(0.20, 104, 115)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    tempOpacity <= 0.25 
                      ? 'bg-[#002B7F] text-white border-[#002B7F] shadow-md ring-2 ring-amber-400' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1">
                    <span>✨ Siêu rõ nét & Sinh động</span>
                  </div>
                  <div className={`text-[10px] mt-0.5 ${tempOpacity <= 0.25 ? 'text-amber-200' : 'text-slate-500'}`}>
                    Lớp phủ 20% • Màu sắc tươi sáng, khuôn viên rực rỡ
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyClarityPreset(0.35, 100, 105)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    tempOpacity > 0.25 && tempOpacity <= 0.45 
                      ? 'bg-[#002B7F] text-white border-[#002B7F] shadow-md ring-2 ring-amber-400' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1">
                    <span>⚖️ Cân bằng Logo chuẩn</span>
                  </div>
                  <div className={`text-[10px] mt-0.5 ${tempOpacity > 0.25 && tempOpacity <= 0.45 ? 'text-amber-200' : 'text-slate-500'}`}>
                    Lớp phủ 35% • Hài hòa sắc xanh trường học & độ tương phản đọc bảng
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyClarityPreset(0.55, 96, 100)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    tempOpacity > 0.45 
                      ? 'bg-[#002B7F] text-white border-[#002B7F] shadow-md ring-2 ring-amber-400' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1">
                    <span>🌙 Dịu mắt tập trung</span>
                  </div>
                  <div className={`text-[10px] mt-0.5 ${tempOpacity > 0.45 ? 'text-amber-200' : 'text-slate-500'}`}>
                    Lớp phủ 55% • Nền tối êm mắt khi làm việc ban đêm
                  </div>
                </button>
              </div>

              {/* Granular Sliders */}
              <div className="space-y-2 pt-2 border-t border-blue-200/60 text-xs">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                    <span>Độ phủ xanh Logo (Kéo sang trái để ảnh trường rõ nét hơn):</span>
                    <span className="font-mono font-bold text-[#002B7F]">{Math.round(tempOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.80"
                    step="0.01"
                    value={tempOpacity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setTempOpacity(val);
                      if (onUpdateBackground) {
                        onUpdateBackground(tempBgUrl, val, tempBrightness, tempSaturation);
                      }
                    }}
                    className="w-full accent-[#002B7F] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Upload or Custom URL */}
            <div className="pt-1 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  3. Tải ảnh trường học từ máy tính (JPG, PNG):
                </label>
                <label className="flex items-center justify-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 border-dashed rounded-xl cursor-pointer text-[#002B7F] font-semibold transition-all">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Chọn tệp ảnh từ máy tính...</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />
                </label>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  4. Hoặc dán đường dẫn URL ảnh bất kỳ:
                </label>
                <input
                  type="text"
                  placeholder="https://... link ảnh trường học của bạn"
                  value={tempBgUrl}
                  onChange={(e) => {
                    setTempBgUrl(e.target.value);
                    if (onUpdateBackground) {
                      onUpdateBackground(e.target.value, tempOpacity, tempBrightness, tempSaturation);
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            {/* Feedback & Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                {savedSuccessMsg ? (
                  <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã lưu phông nền thành công!
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleApplyPreset('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80');
                      handleApplyClarityPreset(0.20, 104, 115);
                    }}
                    className="text-xs text-blue-700 hover:underline font-semibold cursor-pointer"
                  >
                    ↺ Khôi phục ảnh Chuyên Hùng Vương siêu nét
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBgModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={handleSaveBackground}
                  className="px-5 py-2 bg-[#002B7F] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-amber-300 stroke-[3]" />
                  <span>Hoàn tất & Lưu phông nền</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
