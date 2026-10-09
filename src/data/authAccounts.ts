import { UserRoleType } from '../types';
import { CLASSES_LIST, CLASS_TEACHERS } from './schoolConfig';

export interface RoleAccount {
  id: string;
  role: UserRoleType;
  title: string;
  fullName: string;
  username: string;
  password: string;
  avatarEmoji: string;
  dutySummary: string;
  mandates: string[];
  allowedTabs: string[];
  restrictedNotice?: string;
  className?: string;
}

// Common password for all 54 homeroom teacher accounts
export const HOMEROOM_SHARED_PASSWORD = 'chv@gvcn54';

// Helper to create clean username from class name: "10 Toán A" -> "gvcn_10toana"
export function formatClassUsername(className: string): string {
  const normalized = className
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '');
  return `gvcn_${normalized}`;
}

// 54 Separate Homeroom Accounts with shared password
export const HOMEROOM_54_ACCOUNTS: RoleAccount[] = CLASSES_LIST.map((className, idx) => {
  const teacher = CLASS_TEACHERS[className] || 'GVCN';
  const username = formatClassUsername(className);
  
  return {
    id: `acc_gvcn_${idx + 1}`,
    role: 'homeroom' as UserRoleType,
    title: `GVCN Lớp ${className}`,
    fullName: `${teacher} (Chủ nhiệm lớp ${className})`,
    username,
    password: HOMEROOM_SHARED_PASSWORD,
    avatarEmoji: '👨‍🏫',
    dutySummary: `Phụ trách riêng Lớp ${className}. Chỉ hiển thị học sinh, nề nếp, điểm danh, phép và tải về bảng KPI rèn luyện của lớp ${className} theo Nghị định 30.`,
    mandates: [
      `Theo dõi học sinh và nề nếp chuyên cần lớp ${className}`,
      `Nhận cảnh báo vắng mặt đầu giờ Tòa A của học sinh lớp ${className}`,
      `Đánh giá và tải về Bảng điểm rèn luyện KPI lớp ${className} theo tháng và cả năm (chuẩn Nghị định 30)`,
      `Phối hợp Quản sinh KTX xử lý học sinh nội trú vi phạm`
    ],
    allowedTabs: ['school', 'analytics', 'discipline', 'dorm', 'leave'],
    restrictedNotice: `🔒 Chỉ hiển thị dữ liệu riêng của Lớp ${className}. Không truy cập dữ liệu các lớp khác.`,
    className
  };
});

// Base system roles
export const BASE_ROLE_ACCOUNTS: RoleAccount[] = [
  {
    id: 'acc_admin',
    role: 'admin',
    title: 'Ban Giám hiệu & Quản trị viên',
    fullName: 'Thầy Vũ Ngọc Minh (Phó Hiệu trưởng) & Ban Quản trị',
    username: 'admin.chv',
    password: 'chv@admin2026',
    avatarEmoji: '🏛️',
    dutySummary: 'Toàn quyền điều hành toàn trường: Hiển thị đầy đủ 54 lớp, 2 tòa KTX; chỉnh sửa toàn bộ nội dung hiển thị, thông tin học sinh, nội trú/ngoại trú, phân chia phòng thêm bớt, cấu hình hệ thống.',
    mandates: [
      'Hiển thị và quản lý 100% học sinh toàn trường (1.890 HS) và nội trú (699 HS)',
      'Chỉnh sửa nội dung học sinh, đổi phòng KTX, chuyển diện nội trú ↔ ngoại trú',
      'Cấu hình toàn bộ nội dung hiển thị, hình nền trường, logo, quy chế và mã lỗi KPI',
      'Ký ban hành và xuất báo cáo KPI toàn trường chuẩn Nghị định 30/2020/NĐ-CP'
    ],
    allowedTabs: ['dorm', 'regimes', 'school', 'self_governance', 'discipline', 'leave', 'analytics', 'manage_students', 'admin_config']
  },
  {
    id: 'acc_youth_union',
    role: 'youth_union',
    title: 'Giáo viên Chi đoàn (Trực Tòa A)',
    fullName: 'Đoàn Thanh niên & GV Chi đoàn Trực ban',
    username: 'tructoaa.chv',
    password: 'chv@doan2026',
    avatarEmoji: '📋',
    dutySummary: 'Trực ban kiểm tra nề nếp đầu giờ tại Tòa nhà A (06h55 - 07h15); hiển thị và theo dõi KPI thi đua học sinh toàn trường 54 lớp; đối soát sĩ số bảng lớp và ghi nhận mã lỗi.',
    mandates: [
      'Trực ban 54 phòng học tại Tòa nhà A từ 06h55 đến 07h15 hàng ngày',
      'Kiểm diện sĩ số góc bảng, thu gom hộp điện thoại 15 phút truy bài',
      'Trình chiếu và theo dõi Bảng KPI thi đua học sinh toàn trường 54 lớp',
      'Ghi nhận vi phạm đầu giờ và tự động gửi cảnh báo tới GVCN'
    ],
    allowedTabs: ['school', 'analytics', 'discipline', 'regimes'],
    restrictedNotice: 'ℹ️ GV Chi đoàn được phân quyền trình chiếu: Kiểm tra Tòa nhà A & Báo cáo thi đua KPI học sinh toàn trường.'
  },
  {
    id: 'acc_warden',
    role: 'warden',
    title: 'Cán bộ Quản sinh KTX',
    fullName: 'Thầy Nguyễn Hữu Dũng (Trưởng ban QL KTX)',
    username: 'quansinh.chv',
    password: 'chv@warden2026',
    avatarEmoji: '🔑',
    dutySummary: 'Quản lý toàn bộ 2 tòa KTX Nam/Nữ (699 HS nội trú, 120 phòng); thực hiện 03 chốt khóa cửa (07h15, 17h30, 22h30); tiếp nhận báo cáo điểm danh 22h15; duyệt đơn ra vào và kỷ luật KTX.',
    mandates: [
      'Quản lý 699 học sinh nội trú tại 02 tòa Nam (335 HS) và Nữ (364 HS)',
      'Thực hiện 3 chốt kiểm tra trực tiếp: 07h15 khóa KTX, 18h00 chốt cổng, 22h30 khóa tầng 1',
      'Tiếp nhận điểm danh đêm 22h15 từ các Trưởng tòa và Trưởng tầng',
      'Phê duyệt đơn xin về quê cuối tuần và học thêm tối'
    ],
    allowedTabs: ['dorm', 'regimes', 'self_governance', 'discipline', 'leave', 'analytics', 'school']
  },
  {
    id: 'acc_room_leader',
    role: 'room_leader',
    title: 'Trưởng phòng KTX (Học sinh)',
    fullName: 'Ban Tự Quản Phòng Ở KTX',
    username: 'truongphong.chv',
    password: 'chv@phong2026',
    avatarEmoji: '🛏️',
    dutySummary: 'Điểm danh quân số phòng lúc 06h00 sáng và 22h00 đêm; đôn đốc nội vụ vuông vắn; báo cáo 1-chạm gửi Trưởng tầng.',
    mandates: [
      'Điểm danh chính xác từng giường trong phòng lúc 06h00 và 22h00',
      'Đôn đốc gấp chăn màn vuông góc, dọn dẹp phòng ở và WC',
      'Gửi báo cáo Zalo quân số phòng lên Trưởng tầng'
    ],
    allowedTabs: ['self_governance', 'regimes'],
    restrictedNotice: '⚠️ Giới hạn chức năng: Trưởng phòng chỉ điểm danh và báo cáo quân số phòng ở của mình.'
  },
  {
    id: 'acc_floor_leader',
    role: 'floor_leader',
    title: 'Trưởng tầng KTX (Học sinh)',
    fullName: 'Ban Tự Quản Tầng KTX',
    username: 'truongtang.chv',
    password: 'chv@tang2026',
    avatarEmoji: '🏢',
    dutySummary: 'Kiểm tra xác suất nội vụ 06h00; tổng hợp quân số các phòng trên tầng lúc 22h15 và báo cáo Quản sinh.',
    mandates: [
      'Kiểm tra nề nếp nội vụ các phòng trên tầng lúc 06h00 sáng',
      'Đôn đốc trật tự giờ tự học 19h30 - 21h45',
      'Tổng hợp quân số tầng gửi Quản sinh lúc 22h15'
    ],
    allowedTabs: ['self_governance', 'regimes'],
    restrictedNotice: '⚠️ Giới hạn chức năng: Trưởng tầng quản lý tiến độ báo cáo và sĩ số các phòng trên tầng mình phụ trách.'
  }
];

export const ROLE_ACCOUNTS: RoleAccount[] = [
  ...BASE_ROLE_ACCOUNTS,
  ...HOMEROOM_54_ACCOUNTS
];
