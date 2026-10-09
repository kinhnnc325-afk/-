import { Regime } from '../types';

export const DORM_REGIMES: Regime[] = [
  {
    id: 1,
    name: 'Báo thức đầu giờ',
    startHour: 5,
    startMin: 15,
    endHour: 5,
    endMin: 30,
    timeRange: '05h15 - 05h30',
    description: 'Thức dậy đúng giờ theo tiếng chuông/loa KTX, mở cửa phòng thoáng mát, không ngủ nướng.',
    supervisors: 'Trưởng phòng ở, Trưởng tầng',
    kpiCodeAffected: 'L01',
    detailedTasks: [
      'Thức dậy ngay khi chuông/loa báo thức KTX phát lúc 05h15',
      'Mở toang cửa sổ và cửa ra vào cho phòng thông thoáng',
      'Vệ sinh cá nhân nhanh chóng, mặc trang phục thể thao',
      'Trưởng phòng kiểm diện thành viên, tuyệt đối không cho phép ngủ nướng'
    ]
  },
  {
    id: 2,
    name: 'Thể dục sáng',
    startHour: 5,
    startMin: 30,
    endHour: 5,
    endMin: 50,
    timeRange: '05h30 - 05h50',
    description: 'Tập trung tại sân KTX/sân trường theo từng tòa, thực hiện bài tập thể dục 15 phút phát triển thể lực.',
    supervisors: '02 Trưởng tòa, Trưởng tầng',
    detailedTasks: [
      'Di chuyển trật tự xuống sân KTX/sân trường đúng 05h30',
      'Xếp hàng theo khối và phòng dưới sự điều hành của Trưởng tòa',
      'Thực hiện bài thể dục 15 phút rèn luyện sức bền và tỉnh táo',
      'Giữ trật tự, tác phong nhanh nhẹn, khẩn trương'
    ]
  },
  {
    id: 3,
    name: 'Sắp xếp nội vụ',
    startHour: 5,
    startMin: 50,
    endHour: 6,
    endMin: 0,
    timeRange: '05h50 - 06h00',
    description: 'Gấp chăn gối vuông vắn để đầu giường; đồ đạc cất gọn trong tủ/vali; tuyệt đối không treo ri-đô; vệ sinh phòng/WC.',
    supervisors: 'Trưởng phòng, Ban tự quản',
    kpiCodeAffected: 'L07',
    detailedTasks: [
      'Gấp chăn màn nội vụ vuông vắn đặt ngay ngắn ở đầu giường',
      'Sắp xếp sách vở, đồ dùng cá nhân gọn gàng trong tủ và vali',
      'Tuyệt đối không mắc ri-đô, không căng dây phơi trong phòng ngủ',
      'Quét dọn sàn nhà phòng ở và chà rửa khu vệ sinh WC sạch sẽ'
    ]
  },
  {
    id: 4,
    name: 'Kiểm tra nội vụ',
    startHour: 6,
    startMin: 0,
    endHour: 6,
    endMin: 15,
    timeRange: '06h00 - 06h15',
    description: 'Trưởng tầng kiểm tra xác suất nội vụ các phòng, chụp ảnh phòng vi phạm gửi nhóm KTX. Chỉnh đốn đồng phục, thẻ học sinh.',
    supervisors: 'Trưởng tầng, Quản sinh KTX',
    kpiCodeAffected: 'L02, L07',
    detailedTasks: [
      'Trưởng tầng đi kiểm tra xác suất nội vụ từng phòng trên tầng phụ trách',
      'Chụp ảnh các góc vi phạm (chăn màn bừa bãi, đồ đạc lộn xộn) gửi nhóm Zalo quản lý KTX',
      'Nhắc nhở học sinh chỉnh đốn đồng phục trường và đeo thẻ học sinh',
      'Trưởng phòng ghi nhận biên bản nhắc nhở thành viên phòng'
    ]
  },
  {
    id: 5,
    name: 'Ăn sáng & Niêm phong KTX',
    startHour: 6,
    startMin: 15,
    endHour: 6,
    endMin: 30,
    timeRange: '06h15 - 06h30',
    description: 'Ăn sáng tại Canteen / di chuyển sang lớp học Tòa A. Đúng 07h15: Quản sinh khóa cửa KTX niêm phong trong giờ học.',
    supervisors: '01 Quản sinh KTX, Bộ phận Bảo vệ',
    kpiCodeAffected: 'L01',
    detailedTasks: [
      'Ăn sáng tại Canteen trường hoặc di chuyển sang khu vực phòng học',
      'Kiểm tra sách vở, đồ dùng học tập trước khi rời KTX',
      'Tắt toàn bộ đèn, quạt, khóa vòi nước và khóa cửa phòng',
      'Đúng 07h15: Cán bộ Quản sinh khóa cửa chính KTX niêm phong'
    ]
  },
  {
    id: 6,
    name: 'Học tập tại Tòa A',
    startHour: 7,
    startMin: 0,
    endHour: 11,
    endMin: 30,
    timeRange: '07h00 - 11h30 & 13h30 - 17h00',
    description: '07h00 - 07h15: Điểm danh đầu giờ tại các phòng học. Học tập chính khóa và chuyên đề tại Tòa nhà A.',
    supervisors: '37 GV Chi đoàn, Ban Nền nếp',
    kpiCodeAffected: 'L01, L02, L04, L05, L08',
    detailedTasks: [
      'Có mặt tại phòng học trước 07h00, lớp trưởng ghi sĩ số lên góc bảng lớp',
      'Thực hiện 15 phút truy bài đầu giờ nghiêm túc',
      'Thu hồi điện thoại di động vào hộp quản lý tập trung của lớp',
      'GV Chi đoàn trực ban kiểm tra đối soát thực tế tại 54 phòng học'
    ]
  },
  {
    id: 7,
    name: 'Ăn trưa & Nghỉ trưa',
    startHour: 11,
    startMin: 30,
    endHour: 13,
    endMin: 15,
    timeRange: '11h30 - 13h15',
    description: '11h30 mở cửa KTX. Ăn trưa Canteen. Ngủ trưa tập trung từ 12h00 - 13h00 giữ yên tĩnh tuyệt đối.',
    supervisors: 'Quản sinh, Trưởng tầng',
    detailedTasks: [
      '11h30 Quản sinh mở cửa KTX đón học sinh về nghỉ',
      'Ăn trưa tại Canteen trường đảm bảo an toàn vệ sinh thực phẩm',
      'Từ 12h00 đến 13h00: Toàn bộ học sinh về giường nghỉ trưa, giữ yên tĩnh tuyệt đối',
      'Cấm chơi game, nghe nhạc, đi lại gây ồn ào ảnh hưởng phòng khác'
    ]
  },
  {
    id: 8,
    name: 'Thể thao & Vệ sinh cá nhân',
    startHour: 17,
    startMin: 0,
    endHour: 18,
    endMin: 30,
    timeRange: '17h00 - 18h30',
    description: 'Rèn luyện thể thao sân KTX. Tắm rửa, giặt đồ, đổ rác tập trung từ 17h00 - 18h30. Gửi xe đúng sân KTX.',
    supervisors: 'Trưởng tòa, Quản sinh KTX',
    kpiCodeAffected: 'L03, L07',
    detailedTasks: [
      'Tham gia hoạt động thể thao (bóng rổ, bóng chuyền, cầu lông, chạy bộ)',
      'Tắm rửa, giặt giũ và phơi đồ đúng khu vực quy định',
      'Thu gom rác phòng ở đổ tại thùng rác tập trung ngoài hành lang',
      'Để xe đạp/xe máy điện đúng vị trí nhà xe sân KTX'
    ]
  },
  {
    id: 9,
    name: 'Ăn tối & Chốt sĩ số KTX',
    startHour: 18,
    startMin: 30,
    endHour: 19,
    endMin: 30,
    timeRange: '18h30 - 19h30',
    description: 'Ăn tối Canteen. Sau 17h30/18h00 chốt cổng trường, học sinh KTX không ra ngoài (trừ học thêm có báo cáo hoặc có đơn xin phép).',
    supervisors: 'Quản sinh KTX',
    kpiCodeAffected: 'L07',
    detailedTasks: [
      'Ăn tối Canteen trường đúng giờ quy định',
      'Chốt cổng trường lúc 18h00: Tuyệt đối không tự ý ra ngoài khuôn viên trường',
      'Trường hợp đi học thêm phải có đơn xin phép phụ huynh và được duyệt trước',
      'Chuẩn bị sách vở và tài liệu phục vụ ca tự học tối'
    ]
  },
  {
    id: 10,
    name: 'Tự học & Sinh hoạt phòng',
    startHour: 19,
    startMin: 30,
    endHour: 22,
    endMin: 0,
    timeRange: '19h30 - 22h00',
    description: '19h30 - 21h45: Tự học tại phòng ở (mở cửa phòng, không gây ồn). 21h45 - 22h00: Sinh hoạt phòng 15 phút.',
    supervisors: 'Trưởng tầng, Quản sinh KTX',
    kpiCodeAffected: 'L05, L08',
    detailedTasks: [
      '19h30 - 21h45: Ngồi vào bàn tự học nghiêm túc tại phòng ở',
      'Mở cửa phòng trong suốt giờ tự học, giữ yên lặng tuyệt đối',
      'Không dùng điện thoại cho việc riêng, không tụ tập chơi game',
      '21h45 - 22h00: Sinh hoạt phòng 15 phút, rút kinh nghiệm nề nếp trong ngày'
    ]
  },
  {
    id: 11,
    name: 'Điểm danh & Tắt đèn giới nghiêm',
    startHour: 22,
    startMin: 0,
    endHour: 22,
    endMin: 30,
    timeRange: '22h00 - 22h30',
    description: '22h00: Điểm danh quân số phòng. 22h15: Trưởng tòa báo cáo Quản sinh. 22h30: Khóa cửa tầng 1 và tắt đèn chính.',
    supervisors: '01 Quản sinh, Trưởng tòa',
    kpiCodeAffected: 'L07',
    detailedTasks: [
      '22h00: Trưởng phòng kiểm diện quân số từng giường trong phòng ở',
      'Ghi nhận học sinh có mặt, vắng mặt có phép / không phép',
      '22h15: Trưởng tầng/Trưởng tòa tổng hợp báo cáo Quản sinh qua nhóm Zalo',
      '22h30: Quản sinh khóa cửa chính tầng 1 cả 2 tòa Nam/Nữ, tắt đèn chiếu sáng chính'
    ]
  }
];
