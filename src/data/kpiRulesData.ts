import { KpiError } from '../types';

export const KPI_ERROR_DEFINITIONS: KpiError[] = [
  {
    code: 'L01',
    name: 'Đi học muộn (sau 07h00)',
    penalty: -1,
    category: 'Nhóm I: Kỷ cương',
    description: 'Vào phòng học sau 07h00 sáng trong các ngày học chính khóa hoặc chuyên đề.'
  },
  {
    code: 'L02',
    name: 'Sai đồng phục / Không đeo thẻ',
    penalty: -3,
    category: 'Nhóm I: Kỷ cương',
    description: 'Mặc sai đồng phục quy định của trường, đi dép lê, không đeo thẻ học sinh khi vào cổng và trong giờ học.'
  },
  {
    code: 'L03',
    name: 'Để xe sai vị trí quy định',
    penalty: -3,
    category: 'Nhóm I: Kỷ cương',
    description: 'Để xe đạp, xe máy điện sai vị trí quy định tại nhà xe học sinh hoặc khu vực sân KTX.'
  },
  {
    code: 'L04',
    name: 'Ăn vặt trong lớp học',
    penalty: -3,
    category: 'Nhóm I: Kỷ cương',
    description: 'Ăn vặt trong lớp học, mang đồ ăn có mùi vào phòng học hoặc vừa đi vừa ăn trong khuôn viên trường.'
  },
  {
    code: 'L05',
    name: 'Sử dụng điện thoại trái phép',
    penalty: -5,
    category: 'Nhóm III: Kỹ năng',
    description: 'Sử dụng điện thoại di động trong giờ học khi chưa có sự cho phép của giáo viên bộ môn.'
  },
  {
    code: 'L06',
    name: 'Không tắt thiết bị điện khi ra về',
    penalty: -5,
    category: 'Nhóm III: Điện nước',
    description: 'Không tắt đèn, quạt, máy điều hòa, máy chiếu hoặc bảng tương tác thông minh khi cả lớp ra về.'
  },
  {
    code: 'L07',
    name: 'Vi phạm quy định nề nếp KTX',
    penalty: -3,
    category: 'Nhóm III: KTX Nội trú',
    description: 'Không gấp chăn màn nội vụ vuông vắn, treo ri-đô, để đồ bừa bãi, không đổ rác, về phòng muộn sau giới nghiêm.'
  },
  {
    code: 'L08',
    name: 'Mất trật tự / Vi phạm ứng xử',
    penalty: -3,
    category: 'Nhóm II & IV: Ứng xử',
    description: 'Mất trật tự trong giờ tự học hoặc giờ chính khóa; nói tục chửi bậy, vi phạm văn hóa ứng xử học đường.'
  },
  {
    code: 'L09',
    name: 'Gian lận thi cử / Lạm dụng AI',
    penalty: -10,
    category: 'Nhóm II: Liêm chính',
    description: 'Gian lận trong kiểm tra đánh giá, sao chép bài hoặc lạm dụng công cụ trí tuệ nhân tạo (AI) làm bài thay.'
  },
  {
    code: 'L10',
    name: 'Hành vi nghiêm trọng (Thuốc lá/Bạo lực)',
    penalty: -20,
    category: 'Vi phạm nghiêm trọng',
    description: 'Hút thuốc lá, thuốc lá điện tử, tàng trữ chất cấm, mang bếp điện vào KTX, trèo rào KTX hoặc bạo lực học đường (Hạ loại Chưa đạt).'
  }
];

export interface DisciplineLevel {
  level: number;
  condition: string;
  sanction: string;
  actionRequired: string;
  kpiDeduction: string;
}

export const DORM_DISCIPLINE_LEVELS: DisciplineLevel[] = [
  {
    level: 1,
    condition: 'Vi phạm lần 01',
    sanction: 'Nhắc nhở toàn tòa KTX',
    actionRequired: 'Trưởng phòng lập biên bản nội bộ, nhắc nhở trước toàn phòng trong ca sinh hoạt 21h45.',
    kpiDeduction: 'Trừ 03 điểm KPI rèn luyện tuần'
  },
  {
    level: 2,
    condition: 'Vi phạm lần 02',
    sanction: 'Lập biên bản mời phụ huynh',
    actionRequired: 'Cán bộ Quản sinh lập biên bản kỷ luật chính thức, gửi thông báo mời cha mẹ học sinh đến làm việc trực tiếp tại trường.',
    kpiDeduction: 'Trừ điểm KPI và gửi cảnh báo GVCN'
  },
  {
    level: 3,
    condition: 'Vi phạm lần 03 / Lỗi nghiêm trọng L10',
    sanction: 'Chấm dứt quyền ở KTX nội trú',
    actionRequired: 'Buộc trả phòng KTX, chuyển về diện ngoại trú, hạ xếp loại rèn luyện học kỳ xuống mức Chưa đạt và gửi văn bản về gia đình.',
    kpiDeduction: 'Trừ 20 điểm KPI & Buộc trả phòng KTX'
  }
];

export const DUTY_TEACHERS_INFO = {
  totalYouthUnionTeachers: 37,
  coreLeaders: [
    'Nguyễn Hoàng Anh (BCH Đoàn trường)',
    'Lê Thị Thảo Linh (BCH Đoàn trường)',
    'Nguyễn Thị Ngọc Huyền (BCH Đoàn trường)',
    'Nguyễn Như Kính (BCH Đoàn trường)'
  ],
  dutyTimeFrame: '06h55 - 07h15 hàng ngày (Thứ 2 đến Chủ nhật)',
  scope: '54 lớp khối chuyên (1.880 học sinh) tại Tòa nhà A'
};
