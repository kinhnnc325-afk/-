import { Regime, KpiError } from '../types';
import { DORM_REGIMES } from './regimesData';
import { KPI_ERROR_DEFINITIONS } from './kpiRulesData';

export interface AppConfig {
  schoolDept: string;
  schoolName: string;
  schoolSubtitle: string;
  slogan?: string;
  academicYear: string;
  address: string;
  phoneHotline: string;
  phoneDormWarden: string;
  logoUrl?: string;
  backgroundImageUrl?: string;
  backgroundOverlayOpacity?: number;
  backgroundBrightness?: number;
  backgroundSaturation?: number;
  announcement: {
    enabled: boolean;
    text: string;
    type: 'info' | 'warning' | 'alert';
  };
  dormCurfew: {
    morningLockTime: string;
    eveningGateTime: string;
    studyTime: string;
    rollCallTime: string;
    reportZaloTime: string;
    nightLockTime: string;
  };
  regimes: Regime[];
  kpiErrors: KpiError[];
}

export const CAMPUS_BACKGROUND_PRESETS = [
  {
    id: 'chv_gate',
    name: 'Cổng chính & Giảng đường THPT Chuyên Hùng Vương',
    description: 'Khuôn viên bề thế, hiện đại tại đường Nguyễn Tất Thành, Việt Trì, Phú Thọ - Sắc nét nguyên bản',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=90'
  },
  {
    id: 'chv_building_a',
    name: 'Tòa nhà A - Giảng đường 54 Lớp Chuyên',
    description: 'Dãy giảng đường khang trang, nơi diễn ra 15 phút truy bài & trực ban đầu giờ nền nếp',
    imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=2000&q=90'
  },
  {
    id: 'chv_dorm',
    name: 'Tòa nhà Ký túc xá Nội trú 699 Học sinh',
    description: 'Khu nội trú cao tầng khang trang nơi lưu trú, tự quản của 335 nam & 364 nữ',
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=2000&q=90'
  },
  {
    id: 'chv_aerial_green',
    name: 'Khuôn viên Sân trường & Quảng trường Cờ đỏ CHV',
    description: 'Không gian sinh hoạt 11 chế độ, rèn luyện thể thao & phong trào thanh niên rực rỡ cờ hoa',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2000&q=90'
  },
  {
    id: 'chv_library_modern',
    name: 'Không gian Tự học KTX & Thư viện Hiện đại',
    description: 'Phòng học chuyên đề, không gian tự học ca tối 19h30 - 21h45 nghiêm túc chất lượng cao',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=2000&q=90'
  }
];

export const DEFAULT_APP_CONFIG: AppConfig = {
  schoolDept: 'SỞ GIÁO DỤC VÀ ĐÀO TẠO PHÚ THỌ',
  schoolName: 'TRƯỜNG THPT CHUYÊN HÙNG VƯƠNG',
  schoolSubtitle: 'HỆ THỐNG QUẢN LÝ HỌC SINH TÒA A & KÝ TÚC XÁ NỘI TRÚ',
  slogan: 'Đoàn kết • Kỷ cương • Đổi mới sáng tạo • Khát vọng vươn tầm cao mới',
  academicYear: 'Năm học 2026 - 2027',
  address: 'Đường Nguyễn Tất Thành, Xã Trưng Vương, TP. Việt Trì, Tỉnh Phú Thọ',
  phoneHotline: '0210.3846.578',
  phoneDormWarden: '0981.412.098 (Thầy Quản sinh KTX)',
  logoUrl: '',
  backgroundImageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=90',
  backgroundOverlayOpacity: 0.20,
  backgroundBrightness: 106,
  backgroundSaturation: 118,
  announcement: {
    enabled: true,
    text: '🔔 THÔNG BÁO: Thực hiện nghiêm ngặt 11 chế độ sinh hoạt KTX Quân đội. Đúng 07h15 niêm phong KTX, 18h00 chốt cổng trường, 22h30 khóa cửa tầng 1!',
    type: 'info'
  },
  dormCurfew: {
    morningLockTime: '07h15',
    eveningGateTime: '18h00',
    studyTime: '19h30 - 21h45',
    rollCallTime: '22h00',
    reportZaloTime: '22h15',
    nightLockTime: '22h30'
  },
  regimes: DORM_REGIMES,
  kpiErrors: KPI_ERROR_DEFINITIONS
};
