import React, { useState } from 'react';
import { 
  Save, 
  RotateCcw, 
  Building2, 
  Clock, 
  ShieldCheck, 
  BellRing, 
  Image as ImageIcon, 
  CheckCircle2, 
  Sliders, 
  Upload, 
  Sparkles, 
  Check 
} from 'lucide-react';
import { AppConfig, DEFAULT_APP_CONFIG, CAMPUS_BACKGROUND_PRESETS } from '../data/appConfig';
import { SchoolLogo } from './SchoolLogo';

interface AdminConfigManagerProps {
  config: AppConfig;
  onSaveConfig: (newConfig: AppConfig) => void;
  onResetConfig: () => void;
}

export const AdminConfigManager: React.FC<AdminConfigManagerProps> = ({
  config,
  onSaveConfig,
  onResetConfig
}) => {
  const [formData, setFormData] = useState<AppConfig>(config);
  const [activeSection, setActiveSection] = useState<'general' | 'curfew' | 'regimes' | 'kpi' | 'banner'>('general');
  const [savedToast, setSavedToast] = useState(false);

  const handleTextChange = (field: keyof AppConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'backgroundImageUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleTextChange(field, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCurfewChange = (field: keyof AppConfig['dormCurfew'], value: string) => {
    setFormData(prev => ({
      ...prev,
      dormCurfew: {
        ...prev.dormCurfew,
        [field]: value
      }
    }));
  };

  const handleAnnouncementChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      announcement: {
        ...prev.announcement,
        [field]: value
      }
    }));
  };

  const handleRegimeChange = (index: number, field: string, value: any) => {
    const updated = [...formData.regimes];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, regimes: updated }));
  };

  const handleKpiErrorChange = (index: number, field: string, value: any) => {
    const updated = [...formData.kpiErrors];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, kpiErrors: updated }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục toàn bộ nội dung về mặc định của Trường THPT Chuyên Hùng Vương?')) {
      onResetConfig();
      setFormData(DEFAULT_APP_CONFIG);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <SchoolLogo size={48} customUrl={formData.logoUrl} />
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Quản trị & Cấu hình Nội dung Hiển thị
                <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Quyền Quản trị viên
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Cho phép tùy chỉnh tên trường, logo, hình nền khuôn viên, nội dung 11 chế độ, mốc thời gian giới nghiêm và mã lỗi KPI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục mặc định</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cấu Hình</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-4">
          <button
            onClick={() => setActiveSection('general')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'general' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Tên trường, Logo & Hình nền</span>
          </button>

          <button
            onClick={() => setActiveSection('banner')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'banner' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>2. Thông báo & Khẩu hiệu</span>
          </button>

          <button
            onClick={() => setActiveSection('curfew')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'curfew' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>3. Mốc giờ Giới nghiêm & Chốt KTX</span>
          </button>

          <button
            onClick={() => setActiveSection('regimes')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'regimes' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>4. Sửa 11 Chế độ sinh hoạt</span>
          </button>

          <button
            onClick={() => setActiveSection('kpi')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'kpi' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>5. Sửa Khung 10 Mã lỗi KPI</span>
          </button>
        </div>
      </div>

      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-emerald-100 px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Đã lưu toàn bộ cấu hình hiển thị thành công!</span>
        </div>
      )}

      {/* SECTION 1: GENERAL INFO, LOGO & BACKGROUND */}
      {activeSection === 'general' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Thông tin Nhận diện Nhà trường, Logo & Hình ảnh nền chủ đạo</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Cơ quan chủ quản:</label>
              <input
                type="text"
                value={formData.schoolDept}
                onChange={(e) => handleTextChange('schoolDept', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tên trường chính thức:</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => handleTextChange('schoolName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tiêu đề phụ hệ thống:</label>
              <input
                type="text"
                value={formData.schoolSubtitle}
                onChange={(e) => handleTextChange('schoolSubtitle', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Khẩu hiệu / Slogan:</label>
              <input
                type="text"
                value={formData.slogan || ''}
                onChange={(e) => handleTextChange('slogan', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-amber-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Niên khóa / Năm học:</label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => handleTextChange('academicYear', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Địa chỉ trường:</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleTextChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Hotline Nhà trường:</label>
              <input
                type="text"
                value={formData.phoneHotline}
                onChange={(e) => handleTextChange('phoneHotline', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Số ĐT Cán bộ Quản sinh KTX:</label>
              <input
                type="text"
                value={formData.phoneDormWarden}
                onChange={(e) => handleTextChange('phoneDormWarden', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2 bg-blue-50/70 p-4 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#002B7F]" />
                  <span>Độ đậm lớp phủ nền Logo & Độ rõ nét ảnh trường:</span>
                </label>
                <span className="font-mono font-bold text-[#002B7F] bg-white px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-sm">
                  {Math.round((formData.backgroundOverlayOpacity ?? 0.28) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.85"
                step="0.01"
                value={formData.backgroundOverlayOpacity ?? 0.28}
                onChange={(e) => handleTextChange('backgroundOverlayOpacity', parseFloat(e.target.value))}
                className="w-full accent-[#002B7F] cursor-pointer"
              />
            </div>
          </div>

          {/* Campus Background Presets */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4 text-xs">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              Hình ảnh Nền Khuôn viên Trường THPT Chuyên Hùng Vương
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {CAMPUS_BACKGROUND_PRESETS.map((preset) => {
                const isSelected = formData.backgroundImageUrl === preset.imageUrl;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleTextChange('backgroundImageUrl', preset.imageUrl)}
                    className={`relative rounded-xl overflow-hidden border-2 text-left group transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'border-indigo-600 ring-2 ring-indigo-400/50 shadow-md' 
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="h-28 w-full relative overflow-hidden bg-slate-900">
                      <img 
                        src={preset.imageUrl} 
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 bg-white">
                      <div className="font-bold text-slate-800 text-[11px] truncate">{preset.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nhập link ảnh nền tùy chọn (URL):
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.backgroundImageUrl || ''}
                  onChange={(e) => handleTextChange('backgroundImageUrl', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Hoặc tải ảnh từ máy tính (JPG, PNG):
                </label>
                <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 border-dashed rounded-xl cursor-pointer text-indigo-600 font-semibold transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Chọn tệp ảnh nền từ máy tính...</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, 'backgroundImageUrl')} 
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Logo Customizer */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4 text-xs">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Tùy biến Logo Trường & Huy hiệu Nhận diện
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nhập URL ảnh Logo (hoặc để trống để dùng Logo Vector chuẩn CHV):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Để trống để dùng Logo chuẩn CHV..."
                      value={formData.logoUrl || ''}
                      onChange={(e) => handleTextChange('logoUrl', e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                    />
                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => handleTextChange('logoUrl', '')}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold whitespace-nowrap cursor-pointer"
                      >
                        Dùng Logo CHV
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Hoặc tải tệp Logo từ máy tính:
                  </label>
                  <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 border-dashed rounded-xl cursor-pointer text-indigo-600 font-semibold transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Tải tệp Logo (PNG, SVG, JPG)...</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, 'logoUrl')} 
                    />
                  </label>
                </div>
              </div>

              {/* Live Preview */}
              <div className="bg-gradient-to-br from-indigo-950 to-slate-950 p-4 rounded-2xl border border-indigo-700/40 text-white flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                  <div className="p-2 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/20 mb-2">
                    <SchoolLogo size={56} customUrl={formData.logoUrl} />
                  </div>
                  <div className="font-bold text-xs uppercase tracking-wider text-amber-300">
                    {formData.schoolName}
                  </div>
                  <div className="text-[10px] text-slate-300 mt-0.5">
                    {formData.academicYear}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: ANNOUNCEMENT BANNER */}
      {activeSection === 'banner' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
            <BellRing className="w-4 h-4 text-indigo-600" />
            <span>Cấu hình Banner Thông báo Toàn trường & Ký túc xá</span>
          </h3>

          <div className="space-y-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-sm">
              <input
                type="checkbox"
                checked={formData.announcement.enabled}
                onChange={(e) => handleAnnouncementChange('enabled', e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span>Hiển thị Banner Thông báo ở đầu trang</span>
            </label>

            {formData.announcement.enabled && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nội dung thông báo:</label>
                  <textarea
                    rows={3}
                    value={formData.announcement.text}
                    onChange={(e) => handleAnnouncementChange('text', e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mức độ hiển thị:</label>
                  <select
                    value={formData.announcement.type}
                    onChange={(e) => handleAnnouncementChange('type', e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-xl font-bold bg-white cursor-pointer"
                  >
                    <option value="info">🔵 Thông tin chung</option>
                    <option value="warning">🟡 Lưu ý / Nhắc nhở</option>
                    <option value="alert">🔴 Khẩn cấp / Báo động</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: CURFEW SETTINGS */}
      {activeSection === 'curfew' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Mốc Thời gian Giới nghiêm, Niêm phong KTX & Chốt cổng trường</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="font-bold text-slate-700 block mb-1">
                Giờ khóa niêm phong KTX buổi sáng:
              </label>
              <input
                type="text"
                value={formData.dormCurfew.morningLockTime}
                onChange={(e) => handleCurfewChange('morningLockTime', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-indigo-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Điều 3 & 4: Đúng 07h15 khóa cửa KTX</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="font-bold text-slate-700 block mb-1">
                Giờ chốt cổng trường buổi chiều tối:
              </label>
              <input
                type="text"
                value={formData.dormCurfew.eveningGateTime}
                onChange={(e) => handleCurfewChange('eveningGateTime', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-amber-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Sau 18h00 học sinh KTX không ra ngoài</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="font-bold text-slate-700 block mb-1">
                Khung giờ tự học tại phòng:
              </label>
              <input
                type="text"
                value={formData.dormCurfew.studyTime}
                onChange={(e) => handleCurfewChange('studyTime', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">19h30 - 21h45 tự học</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="font-bold text-slate-700 block mb-1">
                Giờ Trưởng phòng điểm danh đêm:
              </label>
              <input
                type="text"
                value={formData.dormCurfew.rollCallTime}
                onChange={(e) => handleCurfewChange('rollCallTime', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-blue-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">22h00 kiểm diện từng giường</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="font-bold text-slate-700 block mb-1">
                Giờ Trưởng tầng báo cáo Zalo Quản sinh:
              </label>
              <input
                type="text"
                value={formData.dormCurfew.reportZaloTime}
                onChange={(e) => handleCurfewChange('reportZaloTime', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-indigo-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">22h15 tổng hợp xong toàn tầng</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="font-bold text-slate-700 block mb-1">
                Giờ khóa cửa chính tầng 1 & tắt đèn:
              </label>
              <input
                type="text"
                value={formData.dormCurfew.nightLockTime}
                onChange={(e) => handleCurfewChange('nightLockTime', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-rose-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">22h30 khóa cửa tầng 1 của 02 tòa Nam/Nữ</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: EDIT 11 REGIMES */}
      {activeSection === 'regimes' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Chỉnh sửa Nội dung 11 Chế độ Sinh hoạt KTX Nội trú</span>
            </h3>
            <span className="text-xs text-slate-400">Điều 3 Quy chế 2026-2027</span>
          </div>

          <div className="space-y-3">
            {formData.regimes.map((regime, idx) => (
              <div key={regime.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px] flex-shrink-0">
                      {regime.id}
                    </span>
                    <input
                      type="text"
                      value={regime.name}
                      onChange={(e) => handleRegimeChange(idx, 'name', e.target.value)}
                      className="font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">Khung giờ:</span>
                    <input
                      type="text"
                      value={regime.timeRange}
                      onChange={(e) => handleRegimeChange(idx, 'timeRange', e.target.value)}
                      className="font-mono text-indigo-700 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs w-36 text-center font-bold"
                    />
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={regime.description}
                    onChange={(e) => handleRegimeChange(idx, 'description', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: EDIT 10 KPI ERRORS */}
      {activeSection === 'kpi' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Chỉnh sửa Khung 10 Mã Lỗi Vi phạm KPI & Mức Trừ Điểm</span>
            </h3>
            <span className="text-xs text-slate-400">Điều 6 Quy chế & Hướng dẫn Tòa A</span>
          </div>

          <div className="space-y-3">
            {formData.kpiErrors.map((err, idx) => (
              <div key={err.code} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-mono font-black bg-rose-100 text-rose-800 px-2 py-1 rounded text-xs">
                      {err.code}
                    </span>
                    <input
                      type="text"
                      value={err.name}
                      onChange={(e) => handleKpiErrorChange(idx, 'name', e.target.value)}
                      className="font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">Mức phạt điểm:</span>
                    <input
                      type="number"
                      value={err.penalty}
                      onChange={(e) => handleKpiErrorChange(idx, 'penalty', parseInt(e.target.value, 10) || 0)}
                      className="font-black text-rose-600 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs w-20 text-center"
                    />
                    <span className="text-slate-400">điểm</span>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={err.description}
                    onChange={(e) => handleKpiErrorChange(idx, 'description', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button bottom */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Mọi thay đổi cấu hình sẽ được lưu vào bộ nhớ trình duyệt và áp dụng đồng bộ toàn hệ thống.
        </span>
        <button
          onClick={handleSubmit}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Lưu Tất Cả Thay Đổi</span>
        </button>
      </div>
    </div>
  );
};
