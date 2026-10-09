import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Shield, 
  Copy, 
  ChevronRight, 
  Lock, 
  Send, 
  Award,
  Check
} from 'lucide-react';
import { DORM_REGIMES } from '../data/regimesData';
import { Regime } from '../types';

interface RegimesTimelineProps {
  regimes?: Regime[];
}

export const RegimesTimeline: React.FC<RegimesTimelineProps> = ({ regimes = DORM_REGIMES }) => {
  const currentRegimesList = regimes.length > 0 ? regimes : DORM_REGIMES;
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedRegime, setSelectedRegime] = useState<Regime>(currentRegimesList[0]);
  const [copied, setCopied] = useState(false);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimeVal = currentHour * 60 + currentMinute;

  const activeRegimeIndex = currentRegimesList.findIndex(r => {
    const s = r.startHour * 60 + r.startMin;
    const e = r.endHour * 60 + r.endMin;
    return currentTimeVal >= s && currentTimeVal <= e;
  });

  const activeRegime = activeRegimeIndex !== -1 ? currentRegimesList[activeRegimeIndex] : (currentRegimesList[9] || currentRegimesList[0]);

  const toggleChecklist = (taskKey: string) => {
    setChecklistState(prev => ({
      ...prev,
      [taskKey]: !prev[taskKey]
    }));
  };

  const generateZaloTemplate = () => {
    return `[BÁO CÁO BAN QUẢN SINH KTX CHV - ĐIỂM DANH 22H15]
Kính gửi: Thầy/Cô Cán bộ Quản sinh KTX
Người báo cáo: Trưởng tòa KTX
Thời gian: ${currentTime.toLocaleTimeString('vi-VN')} ngày ${currentTime.toLocaleDateString('vi-VN')}

1. TÒA KTX NAM (335 HS):
• Hiện diện tại phòng: 332 HS
• Vắng có phép (đã duyệt): 03 HS (về quê ôn thi HSG / gia đình có việc)
• Vắng không phép: 00 HS
• Tình hình trật tự: Nghiêm túc, các phòng đã tự học xong lúc 21h45.

2. TÒA KTX NỮ (364 HS):
• Hiện diện tại phòng: 360 HS
• Vắng có phép: 04 HS (học thêm và có đơn)
• Vắng không phép: 00 HS
• Tình hình trật tự: Ổn định, không phát hiện vi phạm.

3. ĐỀ XUẤT:
• Đúng 22h30 tiến hành khóa cửa chính tầng 1 cả 02 tòa Nam/Nữ và tắt đèn chiếu sáng chính theo Điều 4 Quy chế.`;
  };

  const handleCopyZalo = () => {
    navigator.clipboard.writeText(generateZaloTemplate());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/20">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5" /> Chuyển hóa 11 chế độ sinh hoạt Quân đội Nhân dân Việt Nam
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Khung 11 Chế độ Sinh hoạt KTX Nội trú Hàng ngày
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Quy định chuẩn hóa từ Thứ Hai đến Chủ Nhật áp dụng cho toàn bộ 699 học sinh nội trú Trường THPT Chuyên Hùng Vương.
            Rèn luyện tính tự giác, kỷ luật, nếp sống khoa học và môi trường an toàn văn minh.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/10 text-xs">
            <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Chế độ đang diễn ra: <strong>{activeRegime.name}</strong></span>
              <span className="text-amber-300 font-mono">({activeRegime.timeRange})</span>
            </div>

            <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-slate-700">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Chốt 07h15: Niêm phong KTX • Chốt 18h00: Đóng cổng trường • Chốt 22h30: Khóa tầng 1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 11 Regimes Cards */}
        <div className="lg:col-span-5 space-y-2.5">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider px-1 flex items-center justify-between">
            <span>Danh mục 11 Chế độ (Điều 3 Quy chế)</span>
            <span className="text-xs font-medium text-slate-500">Bấm để xem thao tác</span>
          </h3>

          <div className="space-y-2">
            {currentRegimesList.map((regime, index) => {
              const isCurrent = activeRegime.id === regime.id;
              const isSelected = selectedRegime.id === regime.id;

              return (
                <div
                  key={regime.id}
                  onClick={() => setSelectedRegime(regime)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-500 shadow-md ring-2 ring-indigo-200'
                      : isCurrent
                        ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : isCurrent
                          ? 'bg-amber-500 text-white animate-bounce'
                          : 'bg-slate-100 text-slate-700'
                    }`}>
                      {index + 1}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {regime.name}
                        </span>
                        {isCurrent && (
                          <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase flex-shrink-0">
                            Đang chạy
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{regime.timeRange}</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ${
                    isSelected ? 'text-indigo-600' : 'text-slate-300'
                  }`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Regime Details & Daily Checklist */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-600/20">
                  {selectedRegime.id}
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Chế độ {selectedRegime.id} / 11
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">
                    {selectedRegime.name}
                  </h4>
                  <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Khung giờ quy chuẩn: <strong>{selectedRegime.timeRange}</strong></span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-400 block">Lực lượng giám sát:</span>
                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg mt-0.5 inline-block">
                  {selectedRegime.supervisors}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Nội dung quy định & thao tác bắt buộc:
              </span>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {selectedRegime.description}
              </p>
              {selectedRegime.kpiCodeAffected && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center gap-2 text-xs">
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Mã lỗi KPI liên quan:
                  </span>
                  <span className="bg-rose-100 text-rose-800 font-mono font-bold px-2 py-0.5 rounded">
                    {selectedRegime.kpiCodeAffected} (Trừ từ -1đ đến -5đ)
                  </span>
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Quy trình thao tác chi tiết (Checklist tự kiểm tra)</span>
                <span className="text-[11px] font-normal text-slate-500">Tích chọn để theo dõi hoàn thành</span>
              </h5>

              <div className="space-y-2">
                {selectedRegime.detailedTasks.map((task, idx) => {
                  const taskKey = `${selectedRegime.id}_${idx}`;
                  const isChecked = !!checklistState[taskKey];

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleChecklist(taskKey)}
                      className={`p-3 rounded-xl border text-xs flex items-center gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className={`flex-1 ${isChecked ? 'line-through text-slate-500' : 'font-medium'}`}>
                        {task}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Zalo Report Tool */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-3xl border border-blue-200/80 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-600 text-white">
                    <Send className="w-4 h-4" />
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    Mẫu Báo cáo Zalo Điểm danh 22h15 gửi Quản sinh
                  </h4>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Định dạng chuẩn theo Điều 4 & 5 Quy chế KTX để Trưởng tòa / Trưởng tầng copy gửi nhóm Zalo
                </p>
              </div>

              <button
                onClick={handleCopyZalo}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Đã sao chép!' : 'Sao chép nội dung'}</span>
              </button>
            </div>

            <pre className="p-3.5 bg-slate-900 text-slate-200 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-52 border border-slate-800">
              {generateZaloTemplate()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
