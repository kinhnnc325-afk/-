import { Student, ViolationRecord, LeaveRequest } from '../types';
import { CLASSES_LIST, CLASS_TEACHERS } from './schoolConfig';

// Raw representation of boarding students extracted from official 2026-2027 KTX list
interface BoardingRaw {
  stt: number;
  room: string;
  name: string;
  birthDate: string;
  class: string;
  teacher: string;
  address: string;
  cccd: string;
  studentPhone: string;
  parentPhone: string;
  building: 'Nam' | 'Nữ';
  isLeader?: boolean;
}

const RAW_MALE_BOARDING: BoardingRaw[] = [
  // Tầng 2
  { stt: 1, room: '2.1', name: 'Lê Quang Minh', birthDate: '17/06/2009', class: '12 Lý B', teacher: 'Cô Tạ Lan', address: 'Thanh Ba - Phú Thọ', cccd: '025209020902', studentPhone: '0981412098', parentPhone: '0388862772', building: 'Nam', isLeader: true },
  { stt: 2, room: '2.1', name: 'Nguyễn Hữu Bảo', birthDate: '04/04/2009', class: '12 Toán C', teacher: 'Cô Thu', address: 'TX Phú Thọ - Phú Thọ', cccd: '025209009349', studentPhone: '0395975526', parentPhone: '0984075435', building: 'Nam' },
  { stt: 3, room: '2.1', name: 'Đoàn Đại Việt', birthDate: '07/06/2009', class: '12 Sử', teacher: 'Cô Hằng', address: 'TX Phú Thọ - Phú Thọ', cccd: '025209000108', studentPhone: '0862632188', parentPhone: '0961596158', building: 'Nam' },
  { stt: 4, room: '2.1', name: 'Nguyễn Nhật Hoàng', birthDate: '23/01/2009', class: '12 Hóa B', teacher: 'Cô P.Hương', address: 'Cẩm Khê - Phú Thọ', cccd: '025209014718', studentPhone: '0389877154', parentPhone: '0973927582', building: 'Nam' },
  { stt: 5, room: '2.1', name: 'Lê Duy Tuấn', birthDate: '17/01/2009', class: '12 Hóa A', teacher: 'Cô Điêu Hoa', address: 'TX Phú Thọ - Phú Thọ', cccd: '025209011927', studentPhone: '0326338560', parentPhone: '0346146680', building: 'Nam' },
  { stt: 6, room: '2.1', name: 'Lương Trần Hải', birthDate: '21/08/2009', class: '12 Toán C', teacher: 'Cô Thu', address: 'Cẩm Khê - Phú Thọ', cccd: '025209011087', studentPhone: '0984651912', parentPhone: '0396854576', building: 'Nam' },

  { stt: 7, room: '2.2', name: 'Nguyễn Hoàng Long', birthDate: '21/07/2010', class: '11 Tin', teacher: 'Cô Hà', address: 'Sơn Đông - Phú Thọ', cccd: '002210011128', studentPhone: '0386754997', parentPhone: '0868343856', building: 'Nam', isLeader: true },
  { stt: 8, room: '2.2', name: 'Trương Thái Dương', birthDate: '05/12/2010', class: '11 Tin', teacher: 'Cô Hà', address: 'Lập Thạch - Vĩnh Phúc', cccd: '026210020310', studentPhone: '0975798221', parentPhone: '0978696809', building: 'Nam' },
  { stt: 9, room: '2.2', name: 'Hoàng Trọng Tú', birthDate: '21/01/2010', class: '11 Tin', teacher: 'Cô Hà', address: 'Hy Cương - Phú Thọ', cccd: '025210012701', studentPhone: '0968670281', parentPhone: '0388919388', building: 'Nam' },
  { stt: 10, room: '2.2', name: 'Nguyễn Tiến Đạt', birthDate: '17/05/2010', class: '11 Tin', teacher: 'Cô Hà', address: 'Thanh Sơn - Phú Thọ', cccd: '025210004238', studentPhone: '0336596484', parentPhone: '0366584486', building: 'Nam' },
  { stt: 11, room: '2.2', name: 'Nguyễn Hà Thiện Phước', birthDate: '23/03/2010', class: '11 Tin', teacher: 'Cô Hà', address: 'Thanh Sơn - Phú Thọ', cccd: '025210014209', studentPhone: '0332368233', parentPhone: '0356593925', building: 'Nam' },
  { stt: 12, room: '2.2', name: 'Nguyễn Chí Dương', birthDate: '12/03/2010', class: '11 Tin', teacher: 'Cô Hà', address: 'Tam Nông - Phú Thọ', cccd: '025210010176', studentPhone: '0337830596', parentPhone: '0333073217', building: 'Nam' },

  { stt: 13, room: '2.3', name: 'Nguyễn Trung Sơn', birthDate: '29/04/2010', class: '11 Toán B', teacher: 'Cô Hiền', address: 'Phù Ninh - Phú Thọ', cccd: '025210012358', studentPhone: '0943598210', parentPhone: '0973830707', building: 'Nam', isLeader: true },
  { stt: 14, room: '2.3', name: 'Quản Đức Anh', birthDate: '13/03/2010', class: '11 Lí B', teacher: 'Cô P.Phương', address: 'Hải Lựu - Phú Thọ', cccd: '026210008247', studentPhone: '0386258933', parentPhone: '0972572489', building: 'Nam' },
  { stt: 15, room: '2.3', name: 'Đào Duy Anh', birthDate: '11/06/2010', class: '11 Hóa B', teacher: 'Cô L.Hằng', address: 'Tam Nông - Phú Thọ', cccd: '025210016605', studentPhone: '0966415808', parentPhone: '0369564585', building: 'Nam' },
  { stt: 16, room: '2.3', name: 'Dương Xuân Quý', birthDate: '01/06/2010', class: '11 Hóa B', teacher: 'Cô L.Hằng', address: 'Hiền Lương - Phú Thọ', cccd: '025210012535', studentPhone: '0376523093', parentPhone: '0984645728', building: 'Nam' },
  { stt: 17, room: '2.3', name: 'Nguyễn Trung Lâm', birthDate: '08/04/2010', class: '11 Anh B', teacher: 'Cô Đ.Hoa', address: 'Cẩm Khê - Phú Thọ', cccd: '025210007164', studentPhone: '0335047960', parentPhone: '0989926508', building: 'Nam' },
  { stt: 18, room: '2.3', name: 'Đặng Hải Đăng', birthDate: '04/08/2010', class: '11 Toán A', teacher: 'Thầy Sơn', address: 'Cẩm Khê - Phú Thọ', cccd: '001210025248', studentPhone: '0344082010', parentPhone: '0965620579', building: 'Nam' },

  { stt: 19, room: '2.4', name: 'Nguyễn Minh Quân', birthDate: '29/10/2009', class: '12 Toán C', teacher: 'Cô Thu', address: 'Thanh Sơn - Phú Thọ', cccd: '025209002798', studentPhone: '0373791906', parentPhone: '0974582563', building: 'Nam', isLeader: true },
  { stt: 20, room: '2.4', name: 'Nguyễn Tuấn Minh', birthDate: '23/11/2009', class: '12 Anh B', teacher: 'Cô Trang', address: 'Thanh Sơn - Phú Thọ', cccd: '025209005024', studentPhone: '0986752370', parentPhone: '0989621486', building: 'Nam' },
  { stt: 21, room: '2.4', name: 'Nguyễn Khoa Đăng', birthDate: '12/10/2009', class: '12 Toán B', teacher: 'Thầy X.Việt', address: 'Thanh Sơn - Phú Thọ', cccd: '025209005452', studentPhone: '0337235595', parentPhone: '0984572908', building: 'Nam' },
  { stt: 22, room: '2.4', name: 'Trần Duy Sơn', birthDate: '09/09/2009', class: '12 Anh E', teacher: 'Cô Thọ Anh', address: 'Tân Sơn - Phú Thọ', cccd: '025209015542', studentPhone: '0392266831', parentPhone: '0962309009', building: 'Nam' },
  { stt: 23, room: '2.4', name: 'Nguyễn Trường Minh', birthDate: '18/08/2009', class: '12 Lí B', teacher: 'Cô Tạ Lan', address: 'Thanh Sơn - Phú Thọ', cccd: '025209013220', studentPhone: '0364586209', parentPhone: '0363135933', building: 'Nam' },
  { stt: 24, room: '2.4', name: 'Đinh Thanh Tùng', birthDate: '24/09/2009', class: '12 Anh D', teacher: 'Cô Oanh', address: 'Thanh Sơn - Phú Thọ', cccd: '008209005895', studentPhone: '0867268809', parentPhone: '0977353916', building: 'Nam' },

  { stt: 25, room: '2.5', name: 'Phạm Đức Hoàng', birthDate: '13/06/2011', class: '10 Lí A', teacher: 'Thầy Giang', address: 'Hiền Quan - Phú Thọ', cccd: '002211005380', studentPhone: '0833022369', parentPhone: '0376597048', building: 'Nam', isLeader: true },
  { stt: 26, room: '2.5', name: 'Nguyễn Trường Giang', birthDate: '20/01/2011', class: '10 Lí A', teacher: 'Thầy Giang', address: 'Đoan Hùng - Phú Thọ', cccd: '025211003008', studentPhone: '0942498740', parentPhone: '0989387339', building: 'Nam' },
  { stt: 27, room: '2.5', name: 'Lê Ngọc Khánh', birthDate: '01/05/2011', class: '10 Lí A', teacher: 'Thầy Giang', address: 'Cẩm Khê - Phú Thọ', cccd: '025211015269', studentPhone: '0971476033', parentPhone: '0984201970', building: 'Nam' },
  { stt: 28, room: '2.5', name: 'Nguyễn Bình Minh', birthDate: '19/08/2011', class: '10 Lí A', teacher: 'Thầy Giang', address: 'Cẩm Khê - Phú Thọ', cccd: '025211011016', studentPhone: '0964089637', parentPhone: '0962646417', building: 'Nam' },
  { stt: 29, room: '2.5', name: 'Lê Quốc Cường', birthDate: '19/09/2011', class: '10 Lí A', teacher: 'Thầy Giang', address: 'Phù Ninh - Phú Thọ', cccd: '025211014013', studentPhone: '0335190911', parentPhone: '0373081186', building: 'Nam' },
  { stt: 30, room: '2.5', name: 'Nguyễn Tuấn Huy', birthDate: '08/05/2011', class: '10 Lí A', teacher: 'Thầy Giang', address: 'Phong Châu - Phú Thọ', cccd: '025211014274', studentPhone: '0388283484', parentPhone: '0949302666', building: 'Nam' },

  { stt: 31, room: '2.6', name: 'Trần Quý Khang', birthDate: '01/07/2011', class: '10 Tin B', teacher: 'Thầy Cường', address: 'Tam Sơn - Phú Thọ', cccd: '026211006415', studentPhone: '0848062011', parentPhone: '0942002449', building: 'Nam', isLeader: true },
  { stt: 32, room: '2.6', name: 'Nguyễn Tiến Dũng', birthDate: '05/01/2011', class: '10 Tin B', teacher: 'Thầy Cường', address: 'Phù Ninh - Phú Thọ', cccd: '025211012635', studentPhone: '0392083689', parentPhone: '0982241304', building: 'Nam' },
  { stt: 33, room: '2.6', name: 'Khuất Thanh Lâm', birthDate: '07/09/2011', class: '10 Tin B', teacher: 'Thầy Cường', address: 'Tu Vũ - Phú Thọ', cccd: '025711009090', studentPhone: '0358483483', parentPhone: '0965616568', building: 'Nam' },
  { stt: 34, room: '2.6', name: 'Hoàng Anh Đức', birthDate: '07/03/2011', class: '10 Tin B', teacher: 'Thầy Cường', address: 'Phù Ninh - Phú Thọ', cccd: '025211005547', studentPhone: '0982976843', parentPhone: '0947293185', building: 'Nam' },
  { stt: 35, room: '2.6', name: 'Phan Đức Huy', birthDate: '18/09/2011', class: '10 Địa', teacher: 'Cô Phượng', address: 'Vĩnh Phúc - Phú Thọ', cccd: '026211002913', studentPhone: '0985611669', parentPhone: '0912599139', building: 'Nam' },
  { stt: 36, room: '2.6', name: 'Bùi Ngọc Huy', birthDate: '20/02/2011', class: '10 Hàn', teacher: 'Cô Diên', address: 'Đồng Lương - Phú Thọ', cccd: '025211016795', studentPhone: '0865216841', parentPhone: '0975841408', building: 'Nam' },

  // Tầng 3
  { stt: 70, room: '3.3', name: 'Nguyễn Nam Anh', birthDate: '28/11/2011', class: '10 Lí A', teacher: 'Thầy Giang', address: 'Phú Thọ', cccd: '025211006814', studentPhone: '0835372468', parentPhone: '0976005179', building: 'Nam', isLeader: true },
  { stt: 71, room: '3.3', name: 'Lê Thanh Bình', birthDate: '11/08/2011', class: '10 Lí B', teacher: 'Cô Minh', address: 'Hùng Vương - Phú Thọ', cccd: '025211005543', studentPhone: '0336268311', parentPhone: '0343715825', building: 'Nam' },
  { stt: 72, room: '3.3', name: 'Dương Tiến Thành', birthDate: '09/01/2011', class: '10 Lí B', teacher: 'Cô Minh', address: 'Trạm Thản - Phú Thọ', cccd: '025211013176', studentPhone: '0979543461', parentPhone: '0975678245', building: 'Nam' },
  { stt: 73, room: '3.3', name: 'Trần Bảo Lâm', birthDate: '23/03/2011', class: '10 Lí B', teacher: 'Cô Minh', address: 'Vạn Xuân - Phú Thọ', cccd: '025211013170', studentPhone: '0333695636', parentPhone: '0386102166', building: 'Nam' },
  { stt: 74, room: '3.3', name: 'Nguyễn Trung Hiếu', birthDate: '05/08/2011', class: '10 Lí B', teacher: 'Cô Minh', address: 'Tam Nông - Phú Thọ', cccd: '025211007055', studentPhone: '0966868906', parentPhone: '0987628622', building: 'Nam' },
  { stt: 75, room: '3.3', name: 'Lê Thanh Tùng', birthDate: '23/09/2011', class: '10 Lí B', teacher: 'Cô Minh', address: 'Bình Dương - Phú Thọ', cccd: '026211002525', studentPhone: '0343153844', parentPhone: '0329512555', building: 'Nam' },

  { stt: 76, room: '3.4', name: 'Trần Nguyên Long', birthDate: '03/10/2011', class: '10 Toán A', teacher: 'Thầy Dũng', address: 'Tiên Lữ - Phú Thọ', cccd: '026211009718', studentPhone: '0868051562', parentPhone: '0388784204', building: 'Nam', isLeader: true },
  { stt: 77, room: '3.4', name: 'Nguyễn Đức Giang', birthDate: '19/06/2011', class: '10 Toán A', teacher: 'Thầy Dũng', address: 'Phù Ninh - Phú Thọ', cccd: '025211009630', studentPhone: '0387228468', parentPhone: '0944063099', building: 'Nam' },
  { stt: 78, room: '3.4', name: 'Nguyễn Xuân Phúc', birthDate: '05/12/2011', class: '10 Toán B', teacher: 'Cô Oanh', address: 'Hùng Việt - Phú Thọ', cccd: '025211004128', studentPhone: '0982663320', parentPhone: '0968256258', building: 'Nam' },
  { stt: 79, room: '3.4', name: 'Lê Huy Hoàng', birthDate: '23/05/2011', class: '10 Toán B', teacher: 'Cô Oanh', address: 'Cẩm Khê - Phú Thọ', cccd: '025211013232', studentPhone: '0365514410', parentPhone: '0986665864', building: 'Nam' },
  { stt: 80, room: '3.4', name: 'Nguyễn Tuệ Lâm', birthDate: '19/09/2011', class: '10 Toán B', teacher: 'Cô Oanh', address: 'Cẩm Khê - Phú Thọ', cccd: '025211012598', studentPhone: '0325627163', parentPhone: '0984363286', building: 'Nam' },
  { stt: 81, room: '3.4', name: 'Nguyễn Sơn Tùng', birthDate: '05/01/2011', class: '10 Toán B', teacher: 'Cô Oanh', address: 'Cẩm Khê - Phú Thọ', cccd: '025211013827', studentPhone: '0338018795', parentPhone: '0984413960', building: 'Nam' },

  // Tầng 4
  { stt: 124, room: '4.1', name: 'Tạ Gia Bảo', birthDate: '24/08/2011', class: '10 Sinh', teacher: 'Cô Ngọc', address: 'Phùng Nguyên - Phú Thọ', cccd: '025211003337', studentPhone: '0968771388', parentPhone: '0974419590', building: 'Nam', isLeader: true },
  { stt: 125, room: '4.1', name: 'Bùi Quang Đông', birthDate: '17/07/2011', class: '10 Tin A', teacher: 'Thầy Sơn Tin', address: 'Thanh Sơn - Phú Thọ', cccd: '025211009337', studentPhone: '0333231013', parentPhone: '0978230693', building: 'Nam' },
  { stt: 126, room: '4.1', name: 'Dương Hải Nam', birthDate: '03/06/2011', class: '10 Tin A', teacher: 'Thầy Sơn Tin', address: 'Đào Xá - Phú Thọ', cccd: '025211001992', studentPhone: '0367002164', parentPhone: '0976333718', building: 'Nam' },
  { stt: 127, room: '4.1', name: 'Nguyễn Khánh Toàn', birthDate: '04/07/2011', class: '10 Tin A', teacher: 'Thầy Sơn Tin', address: 'Bản Nguyên - Phú Thọ', cccd: '025211013739', studentPhone: '0328879867', parentPhone: '0892513073', building: 'Nam' },
  { stt: 128, room: '4.1', name: 'Trần Anh Đức', birthDate: '15/05/2011', class: '10 Tin A', teacher: 'Thầy Sơn Tin', address: 'Lâm Thao - Phú Thọ', cccd: '025211003237', studentPhone: '0332946112', parentPhone: '0942007960', building: 'Nam' },
  { stt: 129, room: '4.1', name: 'Trần Tuệ Ngọc', birthDate: '09/01/2011', class: '10 Tin A', teacher: 'Thầy Sơn Tin', address: 'Lâm Thao - Phú Thọ', cccd: '001211028384', studentPhone: '0342998105', parentPhone: '0946074555', building: 'Nam' },

  // Tầng 5 & 6
  { stt: 260, room: '5.12', name: 'Đoàn Vũ Linh Duy', birthDate: '25/05/2010', class: '11 Tin', teacher: 'Cô Hà', address: 'Hạ Hòa - Phú Thọ', cccd: '025210011995', studentPhone: '0869388577', parentPhone: '0982737574', building: 'Nam', isLeader: true },
  { stt: 261, room: '5.12', name: 'Nguyễn Trí Dũng', birthDate: '29/01/2010', class: '11 Tin', teacher: 'Cô Hà', address: 'Nhữ Khê - Tuyên Quang', cccd: '008210004533', studentPhone: '0383002699', parentPhone: '0399301987', building: 'Nam' },
  { stt: 262, room: '5.12', name: 'Nguyễn Ngọc Hưng', birthDate: '06/01/2010', class: '11 Tin', teacher: 'Cô Hà', address: 'Đoan Hùng - Phú Thọ', cccd: '025210002021', studentPhone: '0347840110', parentPhone: '0389766856', building: 'Nam' },
  { stt: 263, room: '5.12', name: 'Đinh Quang Hải', birthDate: '14/05/2010', class: '11 Tin', teacher: 'Cô Hà', address: 'Minh Hòa - Phú Thọ', cccd: '025210001559', studentPhone: '0359178886', parentPhone: '0362976768', building: 'Nam' },
  { stt: 264, room: '5.12', name: 'Lê Cao Thái Sơn', birthDate: '17/10/2010', class: '11 Tin', teacher: 'Cô Hà', address: 'Cẩm Khê - Phú Thọ', cccd: '025210001573', studentPhone: '0352654383', parentPhone: '0913810601', building: 'Nam' },
  { stt: 265, room: '5.12', name: 'Trần Trí Dũng', birthDate: '23/01/2010', class: '11 Tin', teacher: 'Cô Hà', address: 'P. Vĩnh Phúc - Phú Thọ', cccd: '001210030195', studentPhone: '0939246677', parentPhone: '0989342009', building: 'Nam' },

  { stt: 284, room: '6.4', name: 'Hà Tuấn Thành', birthDate: '05/09/2010', class: '11 Toán A', teacher: 'Thầy Sơn', address: 'Hoàng Cương - Phú Thọ', cccd: '025210013162', studentPhone: '0349545062', parentPhone: '0365128121', building: 'Nam', isLeader: true },
  { stt: 285, room: '6.4', name: 'Nguyễn Vũ Bình Minh', birthDate: '10/02/2010', class: '11 Toán B', teacher: 'Cô Hiền', address: 'Sơn Tây - Hà Nội', cccd: '001210023672', studentPhone: '0917059559', parentPhone: '0772355999', building: 'Nam' },
  { stt: 286, room: '6.4', name: 'Phạm Nguyễn Hoàng Hải', birthDate: '27/03/2010', class: '11 Toán B', teacher: 'Cô Hiền', address: 'Xuân Lũng - Phú Thọ', cccd: '025210017118', studentPhone: '0789073293', parentPhone: '0961440526', building: 'Nam' },
  { stt: 287, room: '6.4', name: 'Lê Mạnh Hùng', birthDate: '23/12/2010', class: '11 Toán B', teacher: 'Cô Hiền', address: 'Âu Cơ - Phú Thọ', cccd: '025210011929', studentPhone: '0968227585', parentPhone: '0977408978', building: 'Nam' },
  { stt: 288, room: '6.4', name: 'Nguyễn Tiến Mạnh', birthDate: '11/06/2010', class: '11 Toán B', teacher: 'Cô Hiền', address: 'Vạn Xuân - Phú Thọ', cccd: '025210005184', studentPhone: '0389759017', parentPhone: '0344303675', building: 'Nam' },
  { stt: 289, room: '6.4', name: 'Phạm Hùng Dũng', birthDate: '29/09/2010', class: '11 Toán B', teacher: 'Cô Hiền', address: 'TT Hạ Hòa - Phú Thọ', cccd: '025210008042', studentPhone: '0988549899', parentPhone: '0985141098', building: 'Nam' }
];

const RAW_FEMALE_BOARDING: BoardingRaw[] = [
  // Tòa Nữ Tầng 2
  { stt: 1, room: '2.5', name: 'Nguyễn Tạ Bảo Ngọc', birthDate: '22/06/2010', class: '11 Toán A', teacher: 'Thầy Sơn', address: 'Đoan Hùng - Phú Thọ', cccd: '025310015154', studentPhone: '0983711434', parentPhone: '0397533994', building: 'Nữ', isLeader: true },
  { stt: 2, room: '2.5', name: 'Lê Thị Quỳnh Mai', birthDate: '24/07/2010', class: '11 Toán A', teacher: 'Thầy Sơn', address: 'Đoan Hùng - Phú Thọ', cccd: '025310002651', studentPhone: '0867178176', parentPhone: '0348249628', building: 'Nữ' },
  { stt: 3, room: '2.5', name: 'Ngô Hà Duyên', birthDate: '14/09/2010', class: '11 Toán A', teacher: 'Thầy Sơn', address: 'Cẩm Khê - Phú Thọ', cccd: '025310012460', studentPhone: '0373813410', parentPhone: '0975677517', building: 'Nữ' },
  { stt: 4, room: '2.5', name: 'Nguyễn Thị Mai Thanh', birthDate: '16/01/2010', class: '11 Toán A', teacher: 'Thầy Sơn', address: 'Thanh Ba - Phú Thọ', cccd: '025310005004', studentPhone: '0345489139', parentPhone: '0978302669', building: 'Nữ' },

  { stt: 5, room: '2.6', name: 'Lê Gia Nhi', birthDate: '19/01/2009', class: '12 Sử', teacher: 'Cô Hằng', address: 'Lâm Thao - Phú Thọ', cccd: '025309014941', studentPhone: '0987130883', parentPhone: '0987191882', building: 'Nữ', isLeader: true },
  { stt: 6, room: '2.6', name: 'Cao Nhật Mai', birthDate: '05/09/2009', class: '12 Anh A', teacher: 'Cô Tố Nga', address: 'Lâm Thao - Phú Thọ', cccd: '025309009328', studentPhone: '0975312597', parentPhone: '0985447488', building: 'Nữ' },
  { stt: 7, room: '2.6', name: 'Ngô Mỹ Ly', birthDate: '26/03/2009', class: '12 Anh D', teacher: 'Cô Oanh', address: 'Lâm Thao - Phú Thọ', cccd: '025309013928', studentPhone: '0398099885', parentPhone: '0353435658', building: 'Nữ' },
  { stt: 8, room: '2.6', name: 'Phạm Thu Phương', birthDate: '10/07/2009', class: '12 Tin', teacher: 'Cô Thái', address: 'Phù Ninh - Phú Thọ', cccd: '025309011353', studentPhone: '0915685836', parentPhone: '0978521183', building: 'Nữ' },
  { stt: 9, room: '2.6', name: 'Phan Thanh Tâm', birthDate: '02/09/2009', class: '12 Hóa B', teacher: 'Cô P.Hương', address: 'Lâm Thao - Phú Thọ', cccd: '025309011136', studentPhone: '0962285044', parentPhone: '0382494429', building: 'Nữ' },
  { stt: 10, room: '2.6', name: 'Quách Khánh Linh', birthDate: '30/07/2009', class: '12 Anh B', teacher: 'Cô Trang', address: 'Lâm Thao - Phú Thọ', cccd: '025309002630', studentPhone: '0971809648', parentPhone: '0363585622', building: 'Nữ' },

  { stt: 11, room: '2.7', name: 'Lưu Phương Thảo', birthDate: '02/04/2009', class: '12 Lí B', teacher: 'Cô Tạ Lan', address: 'TX Phú Thọ - Phú Thọ', cccd: '025309002693', studentPhone: '0868595282', parentPhone: '0988975277', building: 'Nữ', isLeader: true },
  { stt: 12, room: '2.7', name: 'Đào Khánh Ly', birthDate: '06/05/2009', class: '12 Toán C', teacher: 'Cô Thu', address: 'TX Phú Thọ - Phú Thọ', cccd: '025309000526', studentPhone: '0962502322', parentPhone: '0989846759', building: 'Nữ' },
  { stt: 13, room: '2.7', name: 'Hà Phương Liên', birthDate: '17/09/2009', class: '12 Hóa B', teacher: 'Cô P.Hương', address: 'TX Phú Thọ - Phú Thọ', cccd: '025309015260', studentPhone: '0326832816', parentPhone: '0974802972', building: 'Nữ' },
  { stt: 14, room: '2.7', name: 'Lê Diệp Anh', birthDate: '29/07/2009', class: '12 Toán C', teacher: 'Cô Thu', address: 'TX Phú Thọ - Phú Thọ', cccd: '025309014374', studentPhone: '0852595368', parentPhone: '0919828568', building: 'Nữ' },
  { stt: 15, room: '2.7', name: 'Trương Bảo Ngọc', birthDate: '11/02/2009', class: '12 Toán A', teacher: 'Thầy K.Minh', address: 'Thanh Ba - Phú Thọ', cccd: '025309014209', studentPhone: '0334706258', parentPhone: '0976753268', building: 'Nữ' },
  { stt: 16, room: '2.7', name: 'Đặng Thị Thùy Linh', birthDate: '14/07/2009', class: '12 Hóa A', teacher: 'Cô Điêu Hoa', address: 'TX Phú Thọ - Phú Thọ', cccd: '025309004438', studentPhone: '0383168162', parentPhone: '0978274692', building: 'Nữ' },

  // Tầng 3 Nữ
  { stt: 58, room: '2.16', name: 'Nguyễn Thanh Hằng', birthDate: '23/07/2011', class: '10 Tin B', teacher: 'Thầy Cường', address: 'Trạm Thản - Phú Thọ', cccd: '025311001305', studentPhone: '0867668636', parentPhone: '0971488708', building: 'Nữ', isLeader: true },
  { stt: 59, room: '2.16', name: 'Nguyễn Anh Thư', birthDate: '26/10/2011', class: '10 Sử', teacher: 'Thầy Thắng', address: 'Đan Thượng - Phú Thọ', cccd: '025311014005', studentPhone: '0392334731', parentPhone: '0389915756', building: 'Nữ' },
  { stt: 60, room: '2.16', name: 'Nguyễn Thu Trang', birthDate: '17/07/2011', class: '10 Sử', teacher: 'Thầy Thắng', address: 'Âu Cơ - Phú Thọ', cccd: '015311006321', studentPhone: '0367342011', parentPhone: '0982393381', building: 'Nữ' },
  { stt: 61, room: '2.16', name: 'Đặng Nguyễn Khánh Ngọc', birthDate: '14/02/2011', class: '10 Sử', teacher: 'Thầy Thắng', address: 'Phù Ninh - Phú Thọ', cccd: '025311008198', studentPhone: '0962231004', parentPhone: '0979682438', building: 'Nữ' },
  { stt: 62, room: '2.16', name: 'Nguyễn Tuệ Lâm', birthDate: '05/11/2011', class: '10 Sử', teacher: 'Thầy Thắng', address: 'Phùng Nguyên - Phú Thọ', cccd: '026311007247', studentPhone: '0347518283', parentPhone: '0945073386', building: 'Nữ' },
  { stt: 63, room: '2.16', name: 'Nguyễn Diệp Bảo Trâm', birthDate: '09/10/2011', class: '10 Sử', teacher: 'Thầy Thắng', address: 'Đoan Hùng - Phú Thọ', cccd: '025311003471', studentPhone: '0846232296', parentPhone: '0912798976', building: 'Nữ' },

  // Tầng 4 Nữ
  { stt: 209, room: '4.3', name: 'Đỗ Thị Ngọc Ánh', birthDate: '22/10/2011', class: '10 Văn B', teacher: 'Cô P. Hạnh', address: 'Thanh Sơn - Phú Thọ', cccd: '025311007825', studentPhone: '0389103616', parentPhone: '0384522898', building: 'Nữ', isLeader: true },
  { stt: 210, room: '4.3', name: 'Nguyễn Thảo An', birthDate: '06/11/2011', class: '10 Văn B', teacher: 'Cô P. Hạnh', address: 'Vĩnh Tường - Phú Thọ', cccd: '026311001140', studentPhone: '0362408001', parentPhone: '0333453538', building: 'Nữ' },
  { stt: 211, room: '4.3', name: 'Nguyễn Khánh Linh', birthDate: '10/08/2011', class: '10 Văn B', teacher: 'Cô P. Hạnh', address: 'Phường Phú Thọ - Phú Thọ', cccd: '025311010655', studentPhone: '0965743260', parentPhone: '0396050585', building: 'Nữ' },
  { stt: 212, room: '4.3', name: 'Nguyễn Ngọc Khánh Linh', birthDate: '03/11/2011', class: '10 Sử', teacher: 'Thầy Thắng', address: 'Cẩm Khê - Phú Thọ', cccd: '025311000586', studentPhone: '0397507698', parentPhone: '0918579658', building: 'Nữ' },
  { stt: 213, room: '4.3', name: 'Nguyễn Bảo Ngọc', birthDate: '29/12/2011', class: '10 Sử', teacher: 'Thầy Thắng', address: 'Phùng Nguyên - Phú Thọ', cccd: '025311001678', studentPhone: '0369076701', parentPhone: '0963661693', building: 'Nữ' },
  { stt: 214, room: '4.3', name: 'Lương Nguyễn Bảo Ngọc', birthDate: '21/02/2011', class: '10 Sử', teacher: 'Thầy Thắng', address: 'Thanh Ba - Phú Thọ', cccd: '025311015910', studentPhone: '0987905410', parentPhone: '0983228482', building: 'Nữ' },

  // Tầng 5 Nữ
  { stt: 359, room: '5.20', name: 'Bùi Lê Khánh Hiền', birthDate: '17/12/2010', class: '11 Pháp', teacher: 'Cô Minh', address: 'Lâm Thao - Phú Thọ', cccd: '025310008999', studentPhone: '0348662402', parentPhone: '0912517586', building: 'Nữ', isLeader: true },
  { stt: 360, room: '5.20', name: 'Phan Hà Phong Lan', birthDate: '06/11/2010', class: '11 Pháp', teacher: 'Cô Minh', address: 'Hùng Việt - Phú Thọ', cccd: '025310013185', studentPhone: '0972185903', parentPhone: '0974151116', building: 'Nữ' },
  { stt: 361, room: '5.20', name: 'Vũ Ngọc Ánh', birthDate: '24/03/2010', class: '11 Pháp', teacher: 'Cô Minh', address: 'TX Phú Thọ - Phú Thọ', cccd: '025310002522', studentPhone: '0969935583', parentPhone: '0962782766', building: 'Nữ' },
  { stt: 362, room: '5.20', name: 'Phạm Phương Hoa', birthDate: '06/06/2010', class: '11 Pháp', teacher: 'Cô Minh', address: 'TX Phú Thọ - Phú Thọ', cccd: '025310007093', studentPhone: '0395662010', parentPhone: '0987795178', building: 'Nữ' },
  { stt: 363, room: '5.20', name: 'Nguyễn Hà Thanh', birthDate: '23/08/2010', class: '11 Pháp', teacher: 'Cô Minh', address: 'Tiên Lữ - Phú Thọ', cccd: '026310004196', studentPhone: '0869343816', parentPhone: '0975808606', building: 'Nữ' },
  { stt: 364, room: '5.20', name: 'Nguyễn Thị Thảo Linh', birthDate: '01/12/2010', class: '11 Pháp', teacher: 'Cô Minh', address: 'Thanh Ba - Phú Thọ', cccd: '001310027243', studentPhone: '0333137880', parentPhone: '0973646168', building: 'Nữ' }
];

// Helper to synthesize complete 54 classes list with realistic student records
export function generateInitialStudents(): Student[] {
  const result: Student[] = [];
  const boardingMap = new Map<string, BoardingRaw>();

  [...RAW_MALE_BOARDING, ...RAW_FEMALE_BOARDING].forEach(b => {
    boardingMap.set(`${b.name}_${b.class}`, b);
  });

  // First convert all parsed boarding students
  [...RAW_MALE_BOARDING, ...RAW_FEMALE_BOARDING].forEach((b, idx) => {
    const floor = parseInt(b.room.split('.')[0], 10) || 2;
    result.push({
      id: `KTX_${b.building === 'Nam' ? 'M' : 'F'}_${idx + 1}`,
      name: b.name,
      gender: b.building === 'Nam' ? 'Nam' : 'Nữ',
      birthDate: b.birthDate,
      class: b.class,
      teacher: b.teacher || CLASS_TEACHERS[b.class] || 'GVCN',
      address: b.address,
      cccd: b.cccd,
      studentPhone: b.studentPhone,
      parentPhone: b.parentPhone,
      isBoarding: true,
      dormBuilding: b.building,
      room: b.room,
      floor,
      isRoomLeader: !!b.isLeader,
      status: 'present',
      kpiScore: 100,
      violationCount: 0,
      academicStatus: 'studying',
      academicYear: '2026-2027'
    });
  });

  // Now ensure every one of the 54 classes has at least 35 full students (total ~1,890)
  CLASSES_LIST.forEach((className) => {
    const existingInClass = result.filter(s => s.class === className);
    const needed = 35 - existingInClass.length;
    const grade = parseInt(className.substring(0, 2), 10);
    const teacher = CLASS_TEACHERS[className] || 'GVCN';
    const birthYear = grade === 10 ? '2011' : grade === 11 ? '2010' : '2009';

    const sampleFamilyNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Đinh'];
    const sampleMiddleMale = ['Văn', 'Đức', 'Quang', 'Minh', 'Tuấn', 'Hải', 'Thành', 'Trung'];
    const sampleMiddleFemale = ['Thị', 'Phương', 'Ngọc', 'Thùy', 'Mai', 'Khánh', 'Hà', 'Bảo'];
    const sampleNamesMale = ['Anh', 'Bách', 'Cường', 'Dũng', 'Đạt', 'Huy', 'Khoa', 'Lâm', 'Nam', 'Phong', 'Quân', 'Thắng', 'Tùng'];
    const sampleNamesFemale = ['Anh', 'Chi', 'Diệp', 'Giang', 'Hà', 'Linh', 'Mai', 'Ngọc', 'Phương', 'Thảo', 'Trang', 'Yến'];
    const sampleDistricts = ['TP. Việt Trì', 'Lâm Thao', 'Phù Ninh', 'Thanh Ba', 'Cẩm Khê', 'Đoan Hùng', 'Tam Nông', 'Thanh Thủy', 'Hạ Hòa'];

    for (let i = 0; i < needed; i++) {
      const isMale = (i % 2 === 0);
      const fam = sampleFamilyNames[(i + className.length) % sampleFamilyNames.length];
      const mid = isMale 
        ? sampleMiddleMale[(i * 3) % sampleMiddleMale.length] 
        : sampleMiddleFemale[(i * 3) % sampleMiddleFemale.length];
      const given = isMale 
        ? sampleNamesMale[(i * 5) % sampleNamesMale.length] 
        : sampleNamesFemale[(i * 5) % sampleNamesFemale.length];
      const fullName = `${fam} ${mid} ${given}`;
      const day = ((i * 7) % 28 + 1).toString().padStart(2, '0');
      const month = ((i * 3) % 12 + 1).toString().padStart(2, '0');
      const birth = `${day}/${month}/${birthYear}`;
      const district = sampleDistricts[(i + grade) % sampleDistricts.length];

      result.push({
        id: `DAY_${className.replace(/\s+/g, '_')}_${i + 1}`,
        name: fullName,
        gender: isMale ? 'Nam' : 'Nữ',
        birthDate: birth,
        class: className,
        teacher,
        address: `${district} - Phú Thọ`,
        cccd: `025${isMale ? '2' : '3'}${birthYear.slice(-2)}00${Math.floor(100000 + Math.random() * 900000)}`,
        studentPhone: `098${Math.floor(1000000 + Math.random() * 9000000)}`,
        parentPhone: `038${Math.floor(1000000 + Math.random() * 9000000)}`,
        isBoarding: false,
        status: 'present',
        kpiScore: 100,
        violationCount: 0,
        academicStatus: 'studying',
        academicYear: '2026-2027'
      });
    }
  });

  return result;
}

export const INITIAL_STUDENTS_DATA: Student[] = generateInitialStudents();

export const INITIAL_VIOLATIONS_DATA: ViolationRecord[] = [
  {
    id: 'VIO_001',
    studentId: 'KTX_M_1',
    studentName: 'Lê Quang Minh',
    class: '12 Lí B',
    isBoarding: true,
    room: '2.1',
    building: 'Nam',
    date: '2026-10-08',
    time: '07h05',
    code: 'L01',
    title: 'Đi học muộn (sau 07h00)',
    penaltyPoints: -1,
    note: 'Đến phòng học Tòa A lúc 07h05 do mưa to, đã ký sổ trực ban.',
    recordedBy: 'GV Chi đoàn trực Tòa A',
    status: 'recorded'
  },
  {
    id: 'VIO_002',
    studentId: 'KTX_M_25',
    studentName: 'Phạm Đức Hoàng',
    class: '10 Lí A',
    isBoarding: true,
    room: '2.5',
    building: 'Nam',
    date: '2026-10-07',
    time: '06h10',
    code: 'L07',
    title: 'Vi phạm quy định nề nếp KTX',
    penaltyPoints: -3,
    note: 'Không gấp chăn màn nội vụ vuông vắn trong ca kiểm tra 06h00 của Trưởng tầng.',
    recordedBy: 'Trưởng tầng 2 KTX Nam',
    status: 'recorded'
  },
  {
    id: 'VIO_003',
    studentId: 'KTX_F_1',
    studentName: 'Nguyễn Tạ Bảo Ngọc',
    class: '11 Toán A',
    isBoarding: true,
    room: '2.5',
    building: 'Nữ',
    date: '2026-10-06',
    time: '07h08',
    code: 'L02',
    title: 'Sai đồng phục / Không đeo thẻ',
    penaltyPoints: -3,
    note: 'Quên đeo thẻ học sinh khi vào lớp đầu giờ Tòa A.',
    recordedBy: 'Thầy Sơn (GVCN)',
    status: 'recorded'
  }
];

export const INITIAL_LEAVE_DATA: LeaveRequest[] = [
  {
    id: 'LR_001',
    studentId: 'KTX_M_1',
    studentName: 'Lê Quang Minh',
    class: '12 Lí B',
    room: '2.1',
    building: 'Nam',
    leaveType: 'weekend_home',
    fromDate: '2026-10-10',
    toDate: '2026-10-11',
    fromTime: '17:30',
    toTime: '19:00',
    reason: 'Về quê cuối tuần thăm gia đình tại Thanh Ba',
    parentContact: '0388862772',
    status: 'approved',
    approvedBy: 'Thầy Quản sinh KTX'
  },
  {
    id: 'LR_002',
    studentId: 'KTX_F_1',
    studentName: 'Nguyễn Tạ Bảo Ngọc',
    class: '11 Toán A',
    room: '2.5',
    building: 'Nữ',
    leaveType: 'evening_tutoring',
    fromDate: '2026-10-09',
    toDate: '2026-10-09',
    fromTime: '18:15',
    toTime: '21:15',
    reason: 'Tham gia lớp bồi dưỡng đội tuyển HSG Toán',
    parentContact: '0397533994',
    status: 'approved',
    approvedBy: 'Thầy Quản sinh KTX'
  }
];
