import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Download, 
  Printer, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Building2, 
  Award, 
  Calendar, 
  PieChart, 
  Search, 
  FileText, 
  GraduationCap, 
  FileSpreadsheet, 
  X, 
  Check, 
  BookOpen,
  Lock,
  FileCheck2
} from 'lucide-react';
import { Student, ViolationRecord, LeaveRequest, UserSession } from '../types';
import { CLASSES_LIST, CLASS_TEACHERS } from '../data/schoolConfig';

export interface EvaluationPeriod {
  id: string;
  type: 'month' | 'year';
  monthNum?: number;
  label: string;
  subLabel: string;
}

export const KPI_EVALUATION_PERIODS: EvaluationPeriod[] = [
  { id: '2026-09', type: 'month', monthNum: 9, label: 'Tháng 09/2026', subLabel: 'Khai giảng & Rèn luyện đầu năm học' },
  { id: '2026-10', type: 'month', monthNum: 10, label: 'Tháng 10/2026', subLabel: 'Tháng cao điểm thi đua nề nếp kỷ cương' },
  { id: '2026-11', type: 'month', monthNum: 11, label: 'Tháng 11/2026', subLabel: 'Tháng tri ân Ngày Nhà giáo Việt Nam 20/11' },
  { id: '2026-12', type: 'month', monthNum: 12, label: 'Tháng 12/2026', subLabel: 'Kiểm tra & Sơ kết Học kỳ I' },
  { id: '2027-01', type: 'month', monthNum: 1, label: 'Tháng 01/2027', subLabel: 'Khởi đầu Học kỳ II' },
  { id: '2027-02', type: 'month', monthNum: 2, label: 'Tháng 02/2027', subLabel: 'Mừng Đảng - Mừng Xuân Đinh Mùi' },
  { id: '2027-03', type: 'month', monthNum: 3, label: 'Tháng 03/2027', subLabel: 'Tháng Thanh niên & Kỷ niệm Đoàn TNCS' },
  { id: '2027-04', type: 'month', monthNum: 4, label: 'Tháng 04/2027', subLabel: 'Thi đua hướng tới Giỗ Tổ Hùng Vương' },
  { id: '2027-05', type: 'month', monthNum: 5, label: 'Tháng 05/2027', subLabel: 'Tổng kết năm học 2026 - 2027' },
  { id: 'full_year', type: 'year', label: 'Cả Năm Học 2026 - 2027', subLabel: 'Đánh giá xếp loại kết quả rèn luyện toàn diện cả năm' }
];

interface AnalyticsReportsProps {
  students: Student[];
  violations: ViolationRecord[];
  leaveRequests: LeaveRequest[];
  userSession?: UserSession;
}

export const AnalyticsReports: React.FC<AnalyticsReportsProps> = ({
  students,
  violations,
  leaveRequests,
  userSession
}) => {
  const isHomeroom = userSession?.role === 'homeroom';
  const isYouthUnion = userSession?.role === 'youth_union';
  const isAdmin = userSession?.role === 'admin';

  // Sub-tab selection:
  // - If Homeroom: only view 'kpi_evaluation' for their class
  // - If Youth Union: only view 'school_leaderboard'
  // - If Admin / Warden: full access
  const [activeTab, setActiveTab] = useState<'kpi_evaluation' | 'overview' | 'by_grade' | 'by_class'>(
    isYouthUnion ? 'kpi_evaluation' : 'kpi_evaluation'
  );

  const [kpiSubMode, setKpiSubMode] = useState<'by_class_students' | 'school_leaderboard'>(() => {
    if (isYouthUnion) return 'school_leaderboard';
    return 'by_class_students';
  });
  
  // Selected class: Locked to userSession.className if homeroom teacher
  const [selectedKpiClass, setSelectedKpiClass] = useState<string>(() => {
    if (isHomeroom && userSession?.className) return userSession.className;
    return '10 Toán A';
  });

  // Keep in sync with userSession
  React.useEffect(() => {
    if (isHomeroom && userSession?.className) {
      setSelectedKpiClass(userSession.className);
      setKpiSubMode('by_class_students');
    } else if (isYouthUnion) {
      setKpiSubMode('school_leaderboard');
    }
  }, [userSession, isHomeroom, isYouthUnion]);

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('2026-10');
  const selectedPeriod = useMemo(() => {
    return KPI_EVALUATION_PERIODS.find(p => p.id === selectedPeriodId) || KPI_EVALUATION_PERIODS[1];
  }, [selectedPeriodId]);

  const [showClassKpiPrintModal, setShowClassKpiPrintModal] = useState(false);
  const [showOfficialKpiModal, setShowOfficialKpiModal] = useState(false);

  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number | 'all'>('all');
  const [classSearchTerm, setClassSearchTerm] = useState('');
  const [kpiClassGradeFilter, setKpiClassGradeFilter] = useState<number | 'all'>('all');

  // Filter students based on role scope
  const studyingStudents = useMemo(() => 
    students.filter(s => (s.academicStatus || 'studying') === 'studying'), 
    [students]
  );
  
  const boardingStudents = useMemo(() => 
    studyingStudents.filter(s => s.isBoarding), 
    [studyingStudents]
  );

  // Managed students count based on role:
  const managedStudentsCount = useMemo(() => {
    if (isHomeroom && userSession?.className) {
      return studyingStudents.filter(s => s.class === userSession.className).length;
    }
    return studyingStudents.length;
  }, [isHomeroom, userSession, studyingStudents]);

  // Total reports count (Violations + Leave Requests)
  const totalReportsCount = useMemo(() => {
    if (isHomeroom && userSession?.className) {
      const classVios = violations.filter(v => v.class === userSession.className).length;
      const classLeaves = leaveRequests.filter(l => l.class === userSession.className).length;
      return classVios + classLeaves;
    }
    return violations.length + leaveRequests.length;
  }, [isHomeroom, userSession, violations, leaveRequests]);

  // Hometown distribution
  const hometownStats = useMemo(() => {
    const counts: Record<string, number> = {};
    boardingStudents.forEach(s => {
      let loc = s.address.split('-')[0].trim();
      if (!loc) loc = 'Khác';
      counts[loc] = (counts[loc] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [boardingStudents]);

  // Code stats
  const codeStats = useMemo(() => {
    const counts: Record<string, number> = {};
    const relevantVios = (isHomeroom && userSession?.className)
      ? violations.filter(v => v.class === userSession.className)
      : violations;

    relevantVios.forEach(v => {
      counts[v.code] = (counts[v.code] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count);
  }, [violations, isHomeroom, userSession]);

  // 54-class statistics
  const classStatsList = useMemo(() => {
    return CLASSES_LIST.map((className, idx) => {
      const grade = parseInt(className.substring(0, 2), 10) || 10;
      const classStudents = studyingStudents.filter(s => s.class === className);
      const boardingCount = classStudents.filter(s => s.isBoarding).length;
      
      let presentCount = 0;
      let absentExcused = 0;
      let absentUnexcused = 0;
      
      classStudents.forEach(s => {
        if (s.status === 'absent_excused') absentExcused++;
        else if (s.status === 'absent_unexcused') absentUnexcused++;
        else presentCount++;
      });

      const classViolations = violations.filter(v => v.class === className);
      const totalPenalty = classViolations.reduce((acc, v) => acc + Math.abs(v.penaltyPoints), 0);
      
      const rawKpi = 100 - totalPenalty;
      const classKpiScore = Math.max(60, rawKpi);

      let rating = 'Tốt';
      if (classKpiScore >= 95) rating = 'Xuất sắc';
      else if (classKpiScore >= 85) rating = 'Tốt';
      else if (classKpiScore >= 75) rating = 'Khá';
      else rating = 'Đạt';

      return {
        stt: idx + 1,
        className,
        grade,
        teacher: CLASS_TEACHERS[className] || 'Ban Giám Hiệu',
        totalStudents: classStudents.length,
        boardingCount,
        presentCount,
        absentExcused,
        absentUnexcused,
        violationsCount: classViolations.length,
        totalPenalty,
        classKpiScore,
        rating
      };
    });
  }, [studyingStudents, violations]);

  const gradeStats = useMemo(() => {
    const grades = [10, 11, 12];
    return grades.map(g => {
      const classesOfGrade = classStatsList.filter(c => c.grade === g);
      const totalStudents = classesOfGrade.reduce((acc, c) => acc + c.totalStudents, 0);
      const boardingCount = classesOfGrade.reduce((acc, c) => acc + c.boardingCount, 0);
      const presentCount = classesOfGrade.reduce((acc, c) => acc + c.presentCount, 0);
      const violationsCount = classesOfGrade.reduce((acc, c) => acc + c.violationsCount, 0);
      const avgKpi = Math.round(
        classesOfGrade.reduce((acc, c) => acc + c.classKpiScore, 0) / (classesOfGrade.length || 1)
      );

      return {
        grade: g,
        totalClasses: classesOfGrade.length,
        totalStudents,
        boardingCount,
        presentCount,
        attendanceRate: totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : '100',
        violationsCount,
        avgKpi
      };
    });
  }, [classStatsList]);

  // Filtered class stats for 54 classes view
  const filteredClassStats = useMemo(() => {
    return classStatsList.filter(c => {
      if (selectedGradeFilter !== 'all' && c.grade !== selectedGradeFilter) return false;
      if (classSearchTerm.trim()) {
        const term = classSearchTerm.trim().toLowerCase();
        return c.className.toLowerCase().includes(term) || c.teacher.toLowerCase().includes(term);
      }
      return true;
    });
  }, [classStatsList, selectedGradeFilter, classSearchTerm]);

  // Current active class for Decree 30 evaluation
  const effectiveClass = (isHomeroom && userSession?.className) ? userSession.className : selectedKpiClass;

  const currentClassStudents = useMemo(() => {
    return studyingStudents.filter(s => s.class === effectiveClass);
  }, [studyingStudents, effectiveClass]);

  const currentClassTeacher = useMemo(() => {
    return CLASS_TEACHERS[effectiveClass] || 'Thầy/Cô Giáo viên Chủ nhiệm';
  }, [effectiveClass]);

  const currentClassViolationsInPeriod = useMemo(() => {
    return violations.filter(v => {
      if (v.class !== effectiveClass) return false;
      if (selectedPeriod.type === 'month') {
        return v.date.startsWith(selectedPeriod.id);
      }
      return true;
    });
  }, [violations, effectiveClass, selectedPeriod]);

  // Individual student KPI evaluations
  const studentKpiEvaluations = useMemo(() => {
    return currentClassStudents.map((student, idx) => {
      const studentVios = currentClassViolationsInPeriod.filter(v => v.studentId === student.id);
      const penaltySum = studentVios.reduce((acc, v) => acc + Math.abs(v.penaltyPoints), 0);
      const initialScore = 100;
      const finalScore = Math.max(0, initialScore - penaltySum);

      let rating: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt' = 'Tốt';
      if (finalScore >= 90) rating = 'Tốt';
      else if (finalScore >= 75) rating = 'Khá';
      else if (finalScore >= 50) rating = 'Đạt';
      else rating = 'Chưa đạt';

      let remarks = 'Gương mẫu, chấp hành nghiêm túc quy chế, rèn luyện tốt';
      if (studentVios.length > 0) {
        const viosSummary = studentVios.map(v => `${v.code} (-${Math.abs(v.penaltyPoints)}đ)`).join(', ');
        if (finalScore >= 90) {
          remarks = `Vi phạm nhẹ (${viosSummary}), đã kịp thời tự giác sửa chữa và tiến bộ`;
        } else if (finalScore >= 75) {
          remarks = `Vi phạm (${viosSummary}), cần nhắc nhở tăng cường nề nếp`;
        } else {
          remarks = `Nhiều lần vi phạm (${viosSummary}), cần liên hệ gia đình phối hợp uốn nắn`;
        }
      }

      return {
        stt: idx + 1,
        studentId: student.id,
        name: student.name,
        birthDate: student.birthDate || '2011',
        gender: student.gender,
        isBoarding: student.isBoarding,
        room: student.room || 'Ngoại trú',
        building: student.dormBuilding || '',
        initialScore,
        violations: studentVios,
        violationCount: studentVios.length,
        penaltySum,
        finalScore,
        rating,
        remarks
      };
    });
  }, [currentClassStudents, currentClassViolationsInPeriod]);

  const classKpiSummary = useMemo(() => {
    const total = studentKpiEvaluations.length || 1;
    const totScore = studentKpiEvaluations.reduce((acc, s) => acc + s.finalScore, 0);
    const avgScore = (totScore / total).toFixed(1);
    
    const countTot = studentKpiEvaluations.filter(s => s.rating === 'Tốt').length;
    const countKha = studentKpiEvaluations.filter(s => s.rating === 'Khá').length;
    const countDat = studentKpiEvaluations.filter(s => s.rating === 'Đạt').length;
    const countChuaDat = studentKpiEvaluations.filter(s => s.rating === 'Chưa đạt').length;

    const boardingCount = studentKpiEvaluations.filter(s => s.isBoarding).length;
    const dayStudentCount = total - boardingCount;

    return {
      total,
      avgScore,
      boardingCount,
      dayStudentCount,
      countTot,
      countKha,
      countDat,
      countChuaDat,
      pctTot: ((countTot / total) * 100).toFixed(1),
      pctKha: ((countKha / total) * 100).toFixed(1),
      pctDat: ((countDat / total) * 100).toFixed(1),
      pctChuaDat: ((countChuaDat / total) * 100).toFixed(1),
    };
  }, [studentKpiEvaluations]);

  // Export CSV according to Decree 30/2020/ND-CP
  const handleExportClassKpiCsv = () => {
    let csv = '\uFEFF';
    csv += 'SỞ GIÁO DỤC VÀ ĐÀO TẠO PHÚ THỌ,"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"\n';
    csv += 'TRƯỜNG THPT CHUYÊN HÙNG VƯƠNG,"Độc lập - Tự do - Hạnh phúc"\n';
    csv += `"Số: ${new Date().getMonth() + 1}${new Date().getDate()}/BC-ĐGKPI-CHV","Phú Thọ, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}"\n\n`;
    
    csv += `"BẢNG ĐÁNH GIÁ KẾT QUẢ RÈN LUYỆN (KPI) HỌC SINH"\n`;
    csv += `"Lớp: ${effectiveClass} - Giáo viên chủ nhiệm: ${currentClassTeacher}"\n`;
    csv += `"Kỳ đánh giá: ${selectedPeriod.label} (${selectedPeriod.subLabel})"\n`;
    csv += `"Căn cứ: Nghị định số 30/2020/NĐ-CP ngày 05/3/2020 của Chính phủ về công tác văn thư"\n`;
    csv += `"Sĩ số lớp: ${classKpiSummary.total} học sinh (Nội trú: ${classKpiSummary.boardingCount} HS, Ngoại trú: ${classKpiSummary.dayStudentCount} HS)"\n`;
    csv += `"Điểm KPI trung bình lớp: ${classKpiSummary.avgScore}/100 - Xếp loại: Tốt ${classKpiSummary.countTot} HS (${classKpiSummary.pctTot}%), Khá ${classKpiSummary.countKha} HS (${classKpiSummary.pctKha}%), Đạt ${classKpiSummary.countDat} HS, Chưa đạt ${classKpiSummary.countChuaDat} HS"\n\n`;

    csv += 'STT,Ma_Hoc_Sinh,Ho_Va_Ten,Ngay_Sinh,Gioi_Tinh,Dien_Hoc_Sinh,Phong_KTX,Diem_Goc,So_Loi_Vi_Pham,Chi_Tiet_Cac_Loi_Vi_Pham,Diem_Tru_KPI,Diem_KPI_Cuoi_Ky,Xep_Loai,Y_Kien_Nhan_Xet_GVCN\n';
    
    studentKpiEvaluations.forEach(item => {
      const viosText = item.violations.length > 0 
        ? item.violations.map(v => `${v.code}: ${v.title} (${v.date} -${Math.abs(v.penaltyPoints)}đ)`).join('; ')
        : 'Không vi phạm - Chấp hành tốt quy chế';

      csv += `${item.stt},"${item.studentId}","${item.name}","${item.birthDate}","${item.gender}","${item.isBoarding ? 'Nội trú KTX' : 'Ngoại trú'}","${item.room}",${item.initialScore},${item.violationCount},"${viosText}",${item.penaltySum},${item.finalScore},"${item.rating}","${item.remarks}"\n`;
    });

    csv += '\n\n';
    csv += '"","","BAN QUẢN LÝ KTX","","","","GIÁO VIÊN CHỦ NHIỆM","","","","","","HIỆU TRƯỞNG PHÊ DUYỆT"\n';
    csv += '"","","(Ký và ghi rõ họ tên)","","","","(Ký và ghi rõ họ tên)","","","","","","(Ký tên và đóng dấu)"\n\n';
    csv += `"","","Thầy Nguyễn Hữu Dũng","","","","${currentClassTeacher}","","","","","","Ban Giám Hiệu"\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanClassName = effectiveClass.replace(/\s+/g, '_');
    link.setAttribute('download', `Bang_Danh_Gia_KPI_Lop_${cleanClassName}_${selectedPeriod.id}_ND30.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportClassesCsv = () => {
    let csv = '\uFEFF';
    csv += 'STT,Khoi,Lop,GVCN,Si_So,HS_Noi_Tru,Hien_Dien,Vang_Co_Phep,Vang_Khong_Phep,So_Vu_Vi_Pham,Diem_Tru_KPI,Diem_Thi_Dua,Xep_Loai\n';
    classStatsList.forEach((c) => {
      csv += `${c.stt},${c.grade},"${c.className}","${c.teacher}",${c.totalStudents},${c.boardingCount},${c.presentCount},${c.absentExcused},${c.absentUnexcused},${c.violationsCount},${c.totalPenalty},${c.classKpiScore},"${c.rating}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Thong_Ke_Si_So_54_Lop_THPT_Chuyen_Hung_Vuong_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Comprehensive School-wide KPI download with itemized evaluation categories (L01 - L10)
  const handleExportDetailedCategoryKpiCsv = () => {
    let csv = '\uFEFF';
    csv += 'SỞ GIÁO DỤC VÀ ĐÀO TẠO PHÚ THỌ,"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"\n';
    csv += 'TRƯỜNG THPT CHUYÊN HÙNG VƯƠNG,"Độc lập - Tự do - Hạnh phúc"\n\n';
    csv += 'BẢNG ĐÁNH GIÁ VÀ XẾP HẠNG THI ĐUA NỀN NẾP TOÀN TRƯỜNG THEO TỪNG MỤC TIÊU CHÍ (KPI)\n';
    csv += `NĂM HỌC 2026 - 2027 (Kỳ: ${selectedPeriod.label})\n`;
    csv += 'Hang,Khoi,Lop,GVCN,Si_So,HS_KTX,Hien_Dien,L01_Di_Muon(-1d),L02_Trang_Phuc_The(-3d),L03_De_Xe(-3d),L04_An_Vat(-3d),L05_Dien_Thoai(-5d),L06_Thiet_Bi_Dien(-5d),L07_Ne_Nep_KTX(-3d),L08_Mat_Trat_Tu(-3d),L09_Gian_Lan_AI(-10d),L10_Nghiem_Trong(-20d),Tong_Diem_Tru,Diem_KPI_Cuoi,Xep_Loai_Thi_Dua\n';

    const sorted = [...classStatsList].sort((a, b) => b.classKpiScore - a.classKpiScore);
    sorted.forEach((c, index) => {
      const classVios = violations.filter(v => v.class === c.className);
      const countL01 = classVios.filter(v => v.code === 'L01').length;
      const countL02 = classVios.filter(v => v.code === 'L02').length;
      const countL03 = classVios.filter(v => v.code === 'L03').length;
      const countL04 = classVios.filter(v => v.code === 'L04').length;
      const countL05 = classVios.filter(v => v.code === 'L05').length;
      const countL06 = classVios.filter(v => v.code === 'L06').length;
      const countL07 = classVios.filter(v => v.code === 'L07').length;
      const countL08 = classVios.filter(v => v.code === 'L08').length;
      const countL09 = classVios.filter(v => v.code === 'L09').length;
      const countL10 = classVios.filter(v => v.code === 'L10').length;

      csv += `${index + 1},${c.grade},"${c.className}","${c.teacher}",${c.totalStudents},${c.boardingCount},${c.presentCount},${countL01},${countL02},${countL03},${countL04},${countL05},${countL06},${countL07},${countL08},${countL09},${countL10},${c.totalPenalty},${c.classKpiScore},"${c.rating}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bang_Danh_Gia_Muc_KPI_Toan_Truong_${selectedPeriod.id}_CHV.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportKpiEvaluationCsv = () => {
    let csv = '\uFEFF';
    csv += 'SỞ GIÁO DỤC VÀ ĐÀO TẠO PHÚ THỌ,"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"\n';
    csv += 'TRƯỜNG THPT CHUYÊN HÙNG VƯƠNG,"Độc lập - Tự do - Hạnh phúc"\n\n';
    csv += 'BẢNG ĐÁNH GIÁ VÀ XẾP LOẠI THI ĐUA NỀN NẾP TOÀN TRƯỜNG NĂM HỌC 2026 - 2027\n';
    csv += 'Hang,Khoi,Lop,GVCN,Si_So,Tong_Loi_Vi_Pham,Diem_Tru,Diem_KPI_Tong,Xep_Loai_Thi_Dua\n';
    
    const sorted = [...classStatsList].sort((a, b) => b.classKpiScore - a.classKpiScore);
    sorted.forEach((c, index) => {
      csv += `${index + 1},${c.grade},"${c.className}","${c.teacher}",${c.totalStudents},${c.violationsCount},${c.totalPenalty},${c.classKpiScore},"${c.rating}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Bang_Xep_Hang_KPI_Thi_Dua_Toan_Truong_CHV_2026_2027.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export full school-wide student roster with individual KPI evaluations (1,880 students)
  const handleExportSchoolWideStudentsKpiCsv = () => {
    let csv = '\uFEFF';
    csv += 'SỞ GIÁO DỤC VÀ ĐÀO TẠO PHÚ THỌ,"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"\n';
    csv += 'TRƯỜNG THPT CHUYÊN HÙNG VƯƠNG,"Độc lập - Tự do - Hạnh phúc"\n';
    csv += `"Số: ${new Date().getMonth() + 1}${new Date().getDate()}/BC-ĐGKPI-CHV-TOANTRUONG","Phú Thọ, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}"\n\n`;
    csv += `"BẢNG ĐÁNH GIÁ KẾT QUẢ RÈN LUYỆN (KPI) HỌC SINH TOÀN TRƯỜNG"\n`;
    csv += `"NĂM HỌC 2026 - 2027 (Kỳ: ${selectedPeriod.label} - ${selectedPeriod.subLabel})"\n`;
    csv += `"Căn cứ: Nghị định số 30/2020/NĐ-CP ngày 05/3/2020 của Chính phủ về công tác văn thư"\n`;
    csv += `"Quy mô: 54 Lớp Chuyên - Tổng số: ${studyingStudents.length} Học sinh (Nội trú KTX: ${boardingStudents.length} HS, Ngoại trú: ${studyingStudents.length - boardingStudents.length} HS)"\n\n`;
    csv += 'STT,Ma_Hoc_Sinh,Ho_Va_Ten,Lop,Khoi,Gioi_Tinh,Dien_Hoc_Sinh,Phong_KTX,Diem_Goc,So_Loi_Vi_Pham,Chi_Tiet_Cac_Loi_Vi_Pham,Diem_Tru_KPI,Diem_KPI_Cuoi_Ky,Xep_Loai,Nhan_Xet_Ren_Luyen\n';

    studyingStudents.forEach((student, index) => {
      const studentVios = violations.filter(v => {
        if (v.studentId !== student.id) return false;
        if (selectedPeriod.type === 'month') return v.date.startsWith(selectedPeriod.id);
        return true;
      });
      const penaltySum = studentVios.reduce((acc, v) => acc + Math.abs(v.penaltyPoints), 0);
      const initialScore = 100;
      const finalScore = Math.max(0, initialScore - penaltySum);
      let rating: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt' = 'Tốt';
      if (finalScore >= 90) rating = 'Tốt';
      else if (finalScore >= 75) rating = 'Khá';
      else if (finalScore >= 50) rating = 'Đạt';
      else rating = 'Chưa đạt';

      const viosText = studentVios.length > 0
        ? studentVios.map(v => `${v.code} (-${Math.abs(v.penaltyPoints)}đ)`).join('; ')
        : 'Không vi phạm - Rèn luyện tốt';

      let remarks = 'Gương mẫu, chấp hành nghiêm túc quy chế';
      if (studentVios.length > 0) {
        if (finalScore >= 90) remarks = 'Vi phạm nhẹ, tự giác sửa chữa';
        else if (finalScore >= 75) remarks = 'Vi phạm nề nếp, cần nhắc nhở rèn luyện';
        else remarks = 'Nhiều lần vi phạm, cần phối hợp phụ huynh uốn nắn';
      }

      const grade = parseInt(student.class.substring(0, 2), 10) || 10;
      csv += `${index + 1},"${student.id}","${student.name}","${student.class}",Khối ${grade},"${student.gender}","${student.isBoarding ? 'Nội trú KTX' : 'Ngoại trú'}","${student.room || 'Ngoại trú'}",${initialScore},${studentVios.length},"${viosText}",${penaltySum},${finalScore},"${rating}","${remarks}"\n`;
    });

    csv += '\n\n';
    csv += '"","","BAN QUẢN LÝ KTX","","","","ĐOÀN TRƯỜNG THPT CHUYÊN HÙNG VƯƠNG","","","","HIỆU TRƯỞNG PHÊ DUYỆT"\n';
    csv += '"","","(Ký và ghi rõ họ tên)","","","","(Ký và ghi rõ họ tên)","","","","(Ký tên và đóng dấu)"\n\n';
    csv += '"","","Thầy Nguyễn Hữu Dũng","","","","Bí Thư Đoàn Trường","","","","Ban Giám Hiệu"\n';

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bang_Danh_Gia_KPI_Toan_Truong_${selectedPeriod.id}_ND30.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Administrative Header Banner */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-sm border border-[#002B7F]/20 p-6 space-y-4">
        
        {/* National Emblem & Department Title in Decree 30 format */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 text-xs sm:text-sm">
          <div className="text-center md:text-left">
            <div className="font-bold uppercase tracking-wider text-slate-700">
              SỞ GIÁO DỤC VÀ ĐÀO TẠO PHÚ THỌ
            </div>
            <div className="font-black text-[#002B7F] uppercase text-sm sm:text-base tracking-wide mt-0.5">
              TRƯỜNG THPT CHUYÊN HÙNG VƯƠNG
            </div>
            <div className="w-24 h-0.5 bg-[#002B7F] mx-auto md:mx-0 mt-1"></div>
          </div>

          <div className="text-center md:text-right">
            <div className="text-xs uppercase font-bold text-slate-800 tracking-wider">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="text-xs font-semibold text-slate-700 tracking-wide mt-0.5">
              Độc lập - Tự do - Hạnh phúc
            </div>
            <div className="w-32 h-0.5 bg-amber-500 mx-auto md:ml-auto md:mr-0 mt-1"></div>
          </div>
        </div>

        {/* Title & Quick Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-[#002B7F]">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-900 flex items-center gap-2">
                  <span>Hệ Thống Báo Cáo & Đánh Giá KPI Rèn Luyện (Chuẩn Nghị Định 30/2020/NĐ-CP)</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {isHomeroom ? (
                    <span className="font-semibold text-amber-800">
                      🔒 Phân quyền GVCN: Đang hiển thị riêng Lớp {userSession?.className} • Tải bảng đánh giá KPI rèn luyện lớp theo tháng/năm
                    </span>
                  ) : isYouthUnion ? (
                    <span className="font-semibold text-blue-800">
                      📺 Phân quyền GV Chi đoàn: Trình chiếu kiểm tra Tòa nhà A & Bảng xếp hạng KPI thi đua học sinh toàn trường
                    </span>
                  ) : (
                    <span>
                      🏛️ Phân quyền Ban Giám hiệu / Quản trị viên: Toàn quyền hiển thị 54 lớp, KTX và xuất báo cáo toàn trường
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {/* School-Wide Itemized KPI Download */}
            {!isHomeroom && (
              <>
                <button
                  onClick={handleExportDetailedCategoryKpiCsv}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-700/20 cursor-pointer active:scale-95"
                  title="Tải bảng đánh giá theo từng mục L01 - L10 cho toàn trường"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>Tải KPI Đánh Giá Mục (L01-L10 Toàn Trường)</span>
                </button>

                <button
                  onClick={handleExportSchoolWideStudentsKpiCsv}
                  className="px-4 py-2 bg-[#002B7F] hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-900/20 cursor-pointer active:scale-95"
                  title="Tải danh sách học sinh toàn trường kèm điểm rèn luyện KPI chuẩn Nghị định 30"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>Tải 1.880 Học Sinh Kèm KPI (NĐ 30)</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                setActiveTab('kpi_evaluation');
                setKpiSubMode('by_class_students');
                setShowClassKpiPrintModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-red-700 to-[#ED1C24] hover:from-red-800 hover:to-red-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-red-700/20 cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>In Phiếu Đánh Giá KPI (NĐ 30)</span>
            </button>

            <button
              onClick={handleExportClassKpiCsv}
              className="px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>{isHomeroom ? `Tải KPI Lớp ${userSession?.className}` : `Tải KPI Lớp ${effectiveClass}`}</span>
            </button>

            {!isHomeroom && (
              <button
                onClick={handleExportClassesCsv}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sĩ số 54 Lớp</span>
              </button>
            )}
          </div>
        </div>

        {/* Global KPI Highlights with Report Count & Managed Students count */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/80 rounded-2xl p-4">
            <div className="text-xs text-blue-900 font-semibold flex items-center justify-between">
              <span>{isHomeroom ? `Học sinh Lớp ${userSession?.className}` : 'Học sinh quản lý'}</span>
              <GraduationCap className="w-4 h-4 text-[#002B7F]" />
            </div>
            <div className="text-2xl font-black text-[#002B7F] mt-1">{managedStudentsCount} HS</div>
            <div className="text-[11px] text-blue-700/80 mt-0.5">
              {isHomeroom ? `Lớp ${userSession?.className} (GVCN: ${currentClassTeacher})` : '54 Lớp Chuyên (Khối 10, 11, 12)'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 border border-amber-200/80 rounded-2xl p-4">
            <div className="text-xs text-amber-900 font-semibold flex items-center justify-between">
              <span>Tổng số lượt báo cáo nề nếp</span>
              <FileCheck2 className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-800 mt-1">{totalReportsCount} báo cáo</div>
            <div className="text-[11px] text-amber-700/80 mt-0.5">
              {isHomeroom ? `Phạm vi Lớp ${userSession?.className}` : 'Báo cáo điểm danh & vi phạm toàn trường'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/80 rounded-2xl p-4">
            <div className="text-xs text-emerald-900 font-semibold flex items-center justify-between">
              <span>Điểm KPI Rèn Luyện TB</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {isHomeroom ? `${classKpiSummary.avgScore} / 100` : '97.4 / 100'}
            </div>
            <div className="text-[11px] text-emerald-700/80 mt-0.5">
              {isHomeroom ? `Xếp loại: ${classKpiSummary.countTot} Tốt, ${classKpiSummary.countKha} Khá` : 'Xếp loại Nền nếp Xuất sắc'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-red-50/50 border border-rose-200/80 rounded-2xl p-4">
            <div className="text-xs text-rose-900 font-semibold flex items-center justify-between">
              <span>Số vụ ghi nhận vi phạm</span>
              <ShieldCheck className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-700 mt-1">
              {isHomeroom ? `${currentClassViolationsInPeriod.length} vụ` : `${violations.length} vụ`}
            </div>
            <div className="text-[11px] text-rose-700/80 mt-0.5">
              Khung 10 mã lỗi L01 - L10
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs: Restricted for Homeroom (only see their own class) */}
        {!isHomeroom && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#002B7F] text-amber-300 shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <PieChart className="w-4 h-4 text-amber-400" />
              <span>1. Thống Kê Mục Theo Toàn Trường (1.880 HS & 699 KTX)</span>
            </button>

            <button
              onClick={() => setActiveTab('by_grade')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'by_grade'
                  ? 'bg-[#002B7F] text-amber-300 shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>2. Thống Kê Mục Theo Khối (Khối 10, 11, 12)</span>
            </button>

            <button
              onClick={() => setActiveTab('by_class')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'by_class'
                  ? 'bg-[#002B7F] text-amber-300 shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>3. Thống Kê Mục Theo Lớp (54 Lớp Chuyên)</span>
            </button>

            <button
              onClick={() => setActiveTab('kpi_evaluation')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'kpi_evaluation'
                  ? 'bg-[#002B7F] text-amber-300 shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>4. Đánh Giá KPI & Xếp Hạng Thi Đua (Chuẩn Nghị Định 30)</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: KPI EVALUATION BY CLASS AND STUDENT */}
      {activeTab === 'kpi_evaluation' && (
        <div className="space-y-6">
          
          {/* Sub-mode Switcher: Hidden for Homeroom to keep them focused on their own class */}
          {!isHomeroom && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-blue-200 shadow-xs">
              <div className="flex items-center gap-2">
                {!isYouthUnion && (
                  <button
                    type="button"
                    onClick={() => setKpiSubMode('by_class_students')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      kpiSubMode === 'by_class_students'
                        ? 'bg-[#002B7F] text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Chi Tiết Từng Lớp & Từng Học Sinh (Theo Tháng / Năm)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setKpiSubMode('school_leaderboard')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    kpiSubMode === 'school_leaderboard'
                      ? 'bg-[#002B7F] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Bảng Xếp Hạng Thi Đua KPI Toàn Trường (54 Lớp)</span>
                </button>
              </div>

              {isYouthUnion && (
                <span className="text-xs bg-blue-100 text-blue-900 border border-blue-300 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5">
                  <span>📋 Phân quyền GV Chi đoàn:</span>
                  <strong>Trình chiếu Bảng thi đua KPI học sinh 54 lớp toàn trường</strong>
                </span>
              )}
            </div>
          )}

          {/* MODE A: BY CLASS AND INDIVIDUAL STUDENTS */}
          {kpiSubMode === 'by_class_students' && (
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#002B7F]/20 p-6 shadow-sm space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-5 border-b border-slate-200">
                {/* Class selector: Locked for homeroom teachers */}
                <div className="md:col-span-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-700" />
                      <span>{isHomeroom ? 'Lớp chủ nhiệm của bạn:' : 'Chọn Lớp Đánh Giá (54 Lớp):'}</span>
                    </label>
                    {!isHomeroom && (
                      <div className="flex items-center gap-1">
                        {(['all', 10, 11, 12] as const).map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setKpiClassGradeFilter(g)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              kpiClassGradeFilter === g 
                                ? 'bg-[#002B7F] text-white' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {g === 'all' ? 'Tất cả' : `K${g}`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {isHomeroom ? (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-black text-[#002B7F] text-base">Lớp {effectiveClass}</div>
                        <div className="text-xs text-amber-900 mt-0.5">Giáo viên chủ nhiệm: <strong>{currentClassTeacher}</strong></div>
                      </div>
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Tài khoản lớp riêng
                      </span>
                    </div>
                  ) : (
                    <select
                      value={selectedKpiClass}
                      onChange={(e) => setSelectedKpiClass(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-blue-300 rounded-xl font-bold text-sm text-[#002B7F] focus:ring-2 focus:ring-[#002B7F] shadow-xs cursor-pointer"
                    >
                      {CLASSES_LIST
                        .filter(c => kpiClassGradeFilter === 'all' || parseInt(c.substring(0, 2), 10) === kpiClassGradeFilter)
                        .map(cls => (
                          <option key={cls} value={cls}>
                            Lớp {cls} — GVCN: {CLASS_TEACHERS[cls] || 'Chưa phân công'}
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                {/* Period selector */}
                <div className="md:col-span-4 space-y-2">
                  <label className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>Chọn Kỳ Đánh Giá KPI (Tháng / Cả Năm):</span>
                  </label>
                  <select
                    value={selectedPeriodId}
                    onChange={(e) => setSelectedPeriodId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-amber-300 rounded-xl font-bold text-sm text-amber-950 focus:ring-2 focus:ring-amber-500 shadow-xs cursor-pointer"
                  >
                    {KPI_EVALUATION_PERIODS.map(period => (
                      <option key={period.id} value={period.id}>
                        {period.type === 'year' ? '⭐ ' : '📅 '} {period.label} — {period.subLabel}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="md:col-span-3 flex flex-col justify-end gap-2">
                  <button
                    onClick={handleExportClassKpiCsv}
                    className="w-full py-2 px-3 bg-[#002B7F] hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    title="Tải bảng đánh giá KPI rèn luyện lớp theo Nghị định 30 (CSV/Excel)"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>Tải KPI Lớp (NĐ 30 CSV/Excel)</span>
                  </button>

                  <button
                    onClick={() => setShowClassKpiPrintModal(true)}
                    className="w-full py-2 px-3 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-amber-300" />
                    <span>In Quyết Định Lớp (NĐ 30)</span>
                  </button>
                </div>
              </div>

              {/* Class Summary Box */}
              <div className="bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/80 p-5 rounded-2xl border border-blue-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 pb-3">
                  <div>
                    <div className="text-xs uppercase text-slate-500 font-semibold">Bảng Đánh Giá Kết Quả Rèn Luyện (KPI)</div>
                    <h3 className="text-lg font-black text-[#002B7F] uppercase tracking-wide">
                      LỚP {effectiveClass} — {selectedPeriod.label.toUpperCase()}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-600 block">Giáo viên Chủ nhiệm:</span>
                    <strong className="text-sm font-bold text-slate-900 font-sans">{currentClassTeacher}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs pt-1 font-sans">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                    <div className="text-slate-500 text-[11px]">Sĩ số lớp</div>
                    <div className="text-lg font-bold text-slate-900">{classKpiSummary.total} HS</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">KTX: {classKpiSummary.boardingCount} • Ngoại trú: {classKpiSummary.dayStudentCount}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                    <div className="text-slate-500 text-[11px]">Điểm KPI Trung bình</div>
                    <div className="text-lg font-black text-[#002B7F]">{classKpiSummary.avgScore} / 100</div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Tỷ lệ Tốt & Khá: {(( (classKpiSummary.countTot + classKpiSummary.countKha) / classKpiSummary.total ) * 100).toFixed(0)}%</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <div className="text-emerald-800 text-[11px] font-bold">Xếp loại TỐT</div>
                    <div className="text-lg font-black text-emerald-700">{classKpiSummary.countTot} HS</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-0.5">{classKpiSummary.pctTot}% (90-100đ)</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
                    <div className="text-blue-800 text-[11px] font-bold">Xếp loại KHÁ</div>
                    <div className="text-lg font-black text-blue-700">{classKpiSummary.countKha} HS</div>
                    <div className="text-[10px] text-blue-600 font-bold mt-0.5">{classKpiSummary.pctKha}% (75-89đ)</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center col-span-2 sm:col-span-1">
                    <div className="text-amber-800 text-[11px] font-bold">ĐẠT & CẦN CỐ GẮNG</div>
                    <div className="text-lg font-black text-amber-700">{classKpiSummary.countDat + classKpiSummary.countChuaDat} HS</div>
                    <div className="text-[10px] text-amber-600 mt-0.5">Đạt: {classKpiSummary.countDat} • Chưa: {classKpiSummary.countChuaDat}</div>
                  </div>
                </div>
              </div>

              {/* Roster Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm uppercase text-slate-900 flex items-center gap-2">
                    <span>Danh Sách Đánh Giá KPI Từng Học Sinh — Lớp {effectiveClass}</span>
                    <span className="text-xs font-sans text-slate-500 font-normal">({studentKpiEvaluations.length} học sinh)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 italic">Thang điểm 100 • Trừ điểm theo khung 10 mã lỗi L01-L10</span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/90 text-slate-800 border-b border-slate-200">
                        <th className="py-3 px-3 font-bold text-center w-12 border-r border-slate-200">STT</th>
                        <th className="py-3 px-3 font-bold border-r border-slate-200">Họ và tên học sinh</th>
                        <th className="py-3 px-2 font-bold text-center w-16 border-r border-slate-200">Giới tính</th>
                        <th className="py-3 px-3 font-bold border-r border-slate-200">Diện ở / KTX</th>
                        <th className="py-3 px-2 font-bold text-center w-16 border-r border-slate-200">Điểm gốc</th>
                        <th className="py-3 px-3 font-bold border-r border-slate-200">Chi tiết vi phạm trong kỳ</th>
                        <th className="py-3 px-2 font-bold text-center w-16 border-r border-slate-200">Tổng trừ</th>
                        <th className="py-3 px-3 font-bold text-center w-20 border-r border-slate-200">Điểm KPI</th>
                        <th className="py-3 px-3 font-bold text-center w-24 border-r border-slate-200">Xếp loại</th>
                        <th className="py-3 px-3 font-bold">Nhận xét của GVCN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {studentKpiEvaluations.map((item) => (
                        <tr 
                          key={item.studentId}
                          className={`hover:bg-blue-50/30 transition-colors ${
                            item.rating === 'Chưa đạt' ? 'bg-rose-50/30' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center font-mono text-slate-500 border-r border-slate-100">
                            {item.stt}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-100">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-[10px] font-mono text-slate-400">{item.studentId}</div>
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-600 border-r border-slate-100">
                            {item.gender}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-100">
                            {item.isBoarding ? (
                              <span className="inline-flex items-center gap-1 text-amber-900 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                <span>KTX {item.room}</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Ngoại trú</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono text-slate-500 border-r border-slate-100">
                            {item.initialScore}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-100 max-w-xs">
                            {item.violations.length > 0 ? (
                              <div className="space-y-1">
                                {item.violations.map((v, vIdx) => (
                                  <div key={vIdx} className="flex items-center gap-1.5 text-[11px]">
                                    <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1 rounded border border-rose-200">
                                      {v.code}
                                    </span>
                                    <span className="text-slate-700 truncate" title={v.title}>
                                      {v.title}
                                    </span>
                                    <span className="text-rose-600 font-mono font-bold">
                                      (-{Math.abs(v.penaltyPoints)}đ)
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Không có vi phạm</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold border-r border-slate-100">
                            {item.penaltySum > 0 ? (
                              <span className="text-rose-600">-{item.penaltySum}đ</span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center border-r border-slate-100">
                            <span className="font-mono font-black text-sm text-[#002B7F]">
                              {item.finalScore}
                            </span>
                            <span className="text-[10px] text-slate-400">/100</span>
                          </td>
                          <td className="py-2.5 px-3 text-center border-r border-slate-100">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-block ${
                              item.rating === 'Tốt' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              item.rating === 'Khá' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                              item.rating === 'Đạt' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                            }`}>
                              {item.rating}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px] leading-snug">
                            {item.remarks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODE B: SCHOOL LEADERBOARD */}
          {kpiSubMode === 'school_leaderboard' && !isHomeroom && (
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#002B7F]/20 p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase">
                    Bảng Tổng Hợp Đánh Giá Điểm KPI & Xếp Hạng Thi Đua Toàn Trường
                  </h3>
                  <p className="text-xs text-slate-500">
                    54 Lớp Chuyên THPT Chuyên Hùng Vương • Xếp hạng theo thang điểm KPI rèn luyện năm học 2026 - 2027
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleExportDetailedCategoryKpiCsv}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    title="Tải bảng đánh giá chi tiết theo từng mục tiêu chí vi phạm L01 - L10"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-300" />
                    <span>Tải Đánh Giá Theo Từng Mục (L01-L10 CSV)</span>
                  </button>

                  <button
                    onClick={handleExportKpiEvaluationCsv}
                    className="px-4 py-2 bg-[#002B7F] hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-300" />
                    <span>Tải Bảng Thi Đua (CSV/Excel)</span>
                  </button>

                  <button
                    onClick={() => setShowOfficialKpiModal(true)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In Quyết Định Toàn Trường (NĐ 30)</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-800 border-y border-slate-200">
                      <th className="py-2.5 px-3 font-bold text-center w-14">Hạng</th>
                      <th className="py-2.5 px-3 font-bold">Lớp Chuyên</th>
                      <th className="py-2.5 px-3 font-bold">Khối</th>
                      <th className="py-2.5 px-3 font-bold">Giáo viên Chủ nhiệm</th>
                      <th className="py-2.5 px-3 font-bold text-center">Sĩ số</th>
                      <th className="py-2.5 px-3 font-bold text-center">HS KTX</th>
                      <th className="py-2.5 px-3 font-bold text-center">Số lỗi vi phạm</th>
                      <th className="py-2.5 px-3 font-bold text-center">Tổng điểm trừ</th>
                      <th className="py-2.5 px-3 font-bold text-center">Điểm KPI Thi Đua</th>
                      <th className="py-2.5 px-3 font-bold text-center">Xếp loại</th>
                      <th className="py-2.5 px-3 font-bold text-center">Chi tiết lớp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...classStatsList]
                      .sort((a, b) => b.classKpiScore - a.classKpiScore)
                      .map((item, rank) => (
                        <tr 
                          key={item.className}
                          className={`transition-colors ${rank < 3 ? 'bg-amber-50/40 font-semibold' : 'hover:bg-indigo-50/30'}`}
                        >
                          <td className="py-2.5 px-3 text-center">
                            {rank === 0 ? (
                              <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-bold inline-flex items-center justify-center text-xs shadow-xs">1</span>
                            ) : rank === 1 ? (
                              <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-bold inline-flex items-center justify-center text-xs shadow-xs">2</span>
                            ) : rank === 2 ? (
                              <span className="w-6 h-6 rounded-full bg-amber-700 text-white font-bold inline-flex items-center justify-center text-xs shadow-xs">3</span>
                            ) : (
                              <span className="font-mono text-slate-500">{rank + 1}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#002B7F]">{item.className}</td>
                          <td className="py-2.5 px-3 text-slate-600">Khối {item.grade}</td>
                          <td className="py-2.5 px-3 text-slate-800">{item.teacher}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{item.totalStudents}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-amber-800">{item.boardingCount}</td>
                          <td className="py-2.5 px-3 text-center font-mono">
                            {item.violationsCount > 0 ? (
                              <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">
                                {item.violationsCount}
                              </span>
                            ) : (
                              <span className="text-emerald-600">0</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-rose-600">
                            {item.totalPenalty > 0 ? `-${item.totalPenalty}đ` : '0đ'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-black text-indigo-900 text-sm">
                            {item.classKpiScore} / 100
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              item.rating === 'Xuất sắc' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              item.rating === 'Tốt' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                              item.rating === 'Khá' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {item.rating}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedKpiClass(item.className);
                                setKpiSubMode('by_class_students');
                              }}
                              className="text-blue-700 hover:text-blue-900 font-bold text-[11px] underline cursor-pointer"
                            >
                              Xem KPI lớp →
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: OVERVIEW (SCHOOL-WIDE STATS) */}
      {activeTab === 'overview' && !isHomeroom && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#002B7F]/20 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900 uppercase">
                  Phân Bổ Học Sinh Nội Trú Theo Địa Bàn Cư Trú
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Toàn tỉnh Phú Thọ</span>
            </div>

            <div className="space-y-2">
              {hometownStats.map((item, idx) => {
                const pct = ((item.count / boardingStudents.length) * 100).toFixed(1);
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 flex items-center gap-1.5">
                        <span className="w-5 text-slate-400 font-mono text-[10px]">{idx + 1}.</span>
                        {item.name}
                      </span>
                      <span className="font-bold font-mono text-slate-900">
                        {item.count} HS ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#002B7F] to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#002B7F]/20 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-slate-900 uppercase">
                  Phân Bổ Vi Phạm Theo 10 Mã Lỗi Kỷ Luật (L01 - L10)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Tổng {violations.length} vụ</span>
            </div>

            <div className="space-y-2">
              {codeStats.map((item) => {
                const pct = ((item.count / (violations.length || 1)) * 100).toFixed(1);
                return (
                  <div key={item.code} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 flex items-center gap-1.5">
                        <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          {item.code}
                        </span>
                        <span>Mã lỗi {item.code}</span>
                      </span>
                      <span className="font-bold font-mono text-rose-700">
                        {item.count} vụ ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BY GRADE (STATISTICS ACROSS 3 GRADES) */}
      {activeTab === 'by_grade' && !isHomeroom && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gradeStats.map(g => (
              <div 
                key={g.grade}
                className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#002B7F]/20 p-6 shadow-sm space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#002B7F] text-amber-300 font-bold text-base flex items-center justify-center shadow-xs">
                      {g.grade}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 uppercase">
                        Khối {g.grade} Chuyên
                      </h3>
                      <p className="text-xs text-slate-500">{g.totalClasses} lớp học</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    KPI TB: {g.avgKpi}đ
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span className="text-slate-600 font-medium">Tổng học sinh khối:</span>
                    <span className="font-bold font-mono text-slate-900">{g.totalStudents} HS</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span className="text-slate-600 font-medium">Học sinh nội trú KTX:</span>
                    <span className="font-bold font-mono text-amber-800">{g.boardingCount} HS ({((g.boardingCount / (g.totalStudents || 1)) * 100).toFixed(1)}%)</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span className="text-slate-600 font-medium">Tỷ lệ chuyên cần:</span>
                    <span className="font-bold font-mono text-emerald-700">{g.attendanceRate}%</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span className="text-slate-600 font-medium">Số vụ vi phạm nếp sống:</span>
                    <span className={`font-bold font-mono ${g.violationsCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {g.violationsCount} vụ
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedGradeFilter(g.grade);
                    setActiveTab('by_class');
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all text-center block cursor-pointer"
                >
                  Xem chi tiết {g.totalClasses} lớp Khối {g.grade} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 54 CLASSES DETAILED BREAKDOWN */}
      {activeTab === 'by_class' && !isHomeroom && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#002B7F]/20 p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Lọc theo Khối:</span>
              <div className="flex items-center gap-1">
                {(['all', 10, 11, 12] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGradeFilter(g)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedGradeFilter === g 
                        ? 'bg-[#002B7F] text-white' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {g === 'all' ? 'Tất cả (54 lớp)' : `Khối ${g}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên lớp hoặc GVCN..."
                value={classSearchTerm}
                onChange={(e) => setClassSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 border-y border-slate-200">
                  <th className="py-2.5 px-3 font-bold text-center w-12">STT</th>
                  <th className="py-2.5 px-3 font-bold">Lớp</th>
                  <th className="py-2.5 px-3 font-bold">Khối</th>
                  <th className="py-2.5 px-3 font-bold">Giáo viên Chủ nhiệm</th>
                  <th className="py-2.5 px-3 font-bold text-center">Sĩ số</th>
                  <th className="py-2.5 px-3 font-bold text-center">HS KTX</th>
                  <th className="py-2.5 px-3 font-bold text-center">Hiện diện</th>
                  <th className="py-2.5 px-3 font-bold text-center">Vắng</th>
                  <th className="py-2.5 px-3 font-bold text-center">Vi phạm</th>
                  <th className="py-2.5 px-3 font-bold text-center">Điểm KPI</th>
                  <th className="py-2.5 px-3 font-bold text-center">Xếp loại</th>
                  <th className="py-2.5 px-3 font-bold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClassStats.map(item => (
                  <tr key={item.className} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="py-2 px-3 text-center font-mono text-slate-500">{item.stt}</td>
                    <td className="py-2 px-3 font-bold text-[#002B7F]">{item.className}</td>
                    <td className="py-2 px-3 text-slate-600 font-medium">Khối {item.grade}</td>
                    <td className="py-2 px-3 text-slate-800">{item.teacher}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold">{item.totalStudents}</td>
                    <td className="py-2 px-3 text-center font-mono text-amber-800 font-bold">{item.boardingCount}</td>
                    <td className="py-2 px-3 text-center font-mono text-emerald-700 font-bold">{item.presentCount}</td>
                    <td className="py-2 px-3 text-center font-mono text-slate-500">
                      {item.absentExcused + item.absentUnexcused > 0 ? (
                        <span className="text-amber-600 font-bold">{item.absentExcused + item.absentUnexcused}</span>
                      ) : (
                        '0'
                      )}
                    </td>
                    <td className="py-2 px-3 text-center font-mono">
                      {item.violationsCount > 0 ? (
                        <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                          {item.violationsCount}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-black text-indigo-900">
                      {item.classKpiScore}đ
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.rating === 'Xuất sắc' ? 'bg-emerald-100 text-emerald-800' :
                        item.rating === 'Tốt' ? 'bg-blue-100 text-blue-800' :
                        item.rating === 'Khá' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {item.rating}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedKpiClass(item.className);
                          setActiveTab('kpi_evaluation');
                          setKpiSubMode('by_class_students');
                        }}
                        className="px-2.5 py-1 bg-[#002B7F] hover:bg-blue-900 text-amber-300 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1"
                      >
                        <span>Xem KPI</span>
                        <span>→</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINT MODAL: CLASS KPI */}
      {showClassKpiPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-300 space-y-5 my-8 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#002B7F]" />
                <span className="font-bold text-sm uppercase text-[#002B7F]">
                  Bản In Bảng Đánh Giá KPI Lớp {effectiveClass} (Chuẩn Nghị Định 30/2020/NĐ-CP)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportClassKpiCsv}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-700" />
                  <span>Tải File CSV/Excel</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#002B7F] hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>In Văn Bản / Lưu PDF</span>
                </button>
                <button
                  onClick={() => setShowClassKpiPrintModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 border border-slate-300 rounded-2xl shadow-inner text-slate-900 text-xs sm:text-sm leading-relaxed space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="font-bold text-[11px] sm:text-xs uppercase">
                    SỞ GIÁO DỤC VÀ ĐÀO TẠO PHÚ THỌ
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-[#002B7F] uppercase mt-0.5">
                    TRƯỜNG THPT CHUYÊN HÙNG VƯƠNG
                  </div>
                  <div className="w-24 h-0.5 bg-[#002B7F] mx-auto mt-0.5"></div>
                  <div className="text-[10px] sm:text-[11px] mt-1 text-slate-600 font-sans">
                    Số: {new Date().getMonth() + 1}{new Date().getDate()}/BC-ĐGKPI-CHV
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div className="font-bold text-xs sm:text-sm mt-0.5">
                    Độc lập - Tự do - Hạnh phúc
                  </div>
                  <div className="w-32 h-0.5 bg-amber-500 mx-auto mt-0.5"></div>
                  <div className="text-[11px] italic text-slate-600 mt-1">
                    Phú Thọ, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                  </div>
                </div>
              </div>

              <div className="text-center pt-3 pb-1">
                <h1 className="font-bold text-base sm:text-lg uppercase tracking-tight text-[#002B7F]">
                  BẢNG TỔNG HỢP ĐÁNH GIÁ ĐIỂM RÈN LUYỆN (KPI) HỌC SINH
                </h1>
                <div className="font-bold text-sm text-slate-800 mt-0.5">
                  LỚP {effectiveClass} — {selectedPeriod.label.toUpperCase()}
                </div>
                <div className="italic text-xs text-slate-600 mt-1">
                  (Căn cứ Nghị định số 30/2020/NĐ-CP của Chính phủ & Quy chế Quản lý Nền nếp Trường THPT Chuyên Hùng Vương)
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <p>
                  <strong>1. Thông tin chung về lớp:</strong> Lớp: <strong>{effectiveClass}</strong> | Giáo viên chủ nhiệm: <strong>{currentClassTeacher}</strong>.
                </p>
                <p>
                  <strong>2. Sĩ số lớp:</strong> Tổng số <strong>{classKpiSummary.total} học sinh</strong> (Học sinh nội trú KTX: {classKpiSummary.boardingCount} HS; Học sinh ngoại trú: {classKpiSummary.dayStudentCount} HS).
                </p>
                <p>
                  <strong>3. Điểm rèn luyện KPI trung bình lớp:</strong> <strong className="text-[#002B7F]">{classKpiSummary.avgScore} / 100 điểm</strong>.
                </p>
                <p>
                  <strong>4. Kết quả xếp loại rèn luyện toàn diện:</strong> Tốt: <strong>{classKpiSummary.countTot} HS ({classKpiSummary.pctTot}%)</strong>; Khá: <strong>{classKpiSummary.countKha} HS ({classKpiSummary.pctKha}%)</strong>; Đạt: {classKpiSummary.countDat} HS; Chưa đạt: {classKpiSummary.countChuaDat} HS.
                </p>
              </div>

              <div className="border border-slate-300 rounded-lg overflow-hidden my-3">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-1.5 border-r border-slate-300 text-center w-8">STT</th>
                      <th className="p-1.5 border-r border-slate-300">Mã HS</th>
                      <th className="p-1.5 border-r border-slate-300">Họ và tên</th>
                      <th className="p-1.5 border-r border-slate-300 text-center w-12">Phái</th>
                      <th className="p-1.5 border-r border-slate-300">Diện KTX</th>
                      <th className="p-1.5 border-r border-slate-300 text-center w-12">Điểm gốc</th>
                      <th className="p-1.5 border-r border-slate-300">Vi phạm trong kỳ</th>
                      <th className="p-1.5 border-r border-slate-300 text-center w-12">Trừ</th>
                      <th className="p-1.5 border-r border-slate-300 text-center w-14">KPI</th>
                      <th className="p-1.5 border-r border-slate-300 text-center w-16">Xếp loại</th>
                      <th className="p-1.5">Nhận xét GVCN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentKpiEvaluations.map((st) => (
                      <tr key={st.studentId} className="border-b border-slate-200">
                        <td className="p-1.5 text-center font-mono border-r border-slate-200">{st.stt}</td>
                        <td className="p-1.5 font-mono text-[10px] border-r border-slate-200">{st.studentId}</td>
                        <td className="p-1.5 font-bold border-r border-slate-200">{st.name}</td>
                        <td className="p-1.5 text-center border-r border-slate-200">{st.gender}</td>
                        <td className="p-1.5 border-r border-slate-200">
                          {st.isBoarding ? `KTX ${st.room}` : 'Ngoại trú'}
                        </td>
                        <td className="p-1.5 text-center font-mono border-r border-slate-200">{st.initialScore}</td>
                        <td className="p-1.5 border-r border-slate-200 text-[10px]">
                          {st.violations.length > 0 
                            ? st.violations.map(v => `${v.code} (-${Math.abs(v.penaltyPoints)}đ)`).join(', ')
                            : 'Không vi phạm'}
                        </td>
                        <td className="p-1.5 text-center font-mono font-bold text-rose-700 border-r border-slate-200">
                          {st.penaltySum > 0 ? `-${st.penaltySum}` : '0'}
                        </td>
                        <td className="p-1.5 text-center font-mono font-black text-[#002B7F] border-r border-slate-200">
                          {st.finalScore}
                        </td>
                        <td className="p-1.5 text-center font-bold border-r border-slate-200">
                          {st.rating}
                        </td>
                        <td className="p-1.5 text-[10px] text-slate-700">
                          {st.remarks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-6 text-center text-xs">
                <div>
                  <div className="font-bold uppercase text-[11px]">BAN QUẢN LÝ KTX</div>
                  <div className="italic text-[10px] text-slate-500 mt-0.5">(Ký và ghi rõ họ tên)</div>
                  <div className="h-16"></div>
                  <div className="font-bold">Thầy Nguyễn Hữu Dũng</div>
                </div>

                <div>
                  <div className="font-bold uppercase text-[11px]">GIÁO VIÊN CHỦ NHIỆM</div>
                  <div className="italic text-[10px] text-slate-500 mt-0.5">(Ký và ghi rõ họ tên)</div>
                  <div className="h-16"></div>
                  <div className="font-bold">{currentClassTeacher}</div>
                </div>

                <div>
                  <div className="font-bold uppercase text-[11px]">HIỆU TRƯỞNG PHÊ DUYỆT</div>
                  <div className="italic text-[10px] text-slate-500 mt-0.5">(Ký tên và đóng dấu)</div>
                  <div className="h-16"></div>
                  <div className="font-bold text-[#002B7F]">Ban Giám Hiệu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT MODAL: SCHOOL-WIDE DECISION (ADMIN ONLY) */}
      {showOfficialKpiModal && !isHomeroom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-300 space-y-6 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#002B7F]" />
                <span className="font-bold text-sm uppercase text-[#002B7F]">
                  Bản In Quyết Định Thi Đua Toàn Trường (Chuẩn Nghị Định 30/2020/NĐ-CP)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#002B7F] hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>In / Lưu PDF</span>
                </button>
                <button
                  onClick={() => setShowOfficialKpiModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 border border-slate-200 rounded-2xl shadow-inner text-slate-900 text-xs sm:text-sm leading-relaxed space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="font-bold text-[11px] sm:text-xs uppercase">
                    SỞ GIÁO DỤC VÀ ĐÀO TẠO PHÚ THỌ
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-[#002B7F] uppercase mt-0.5">
                    TRƯỜNG THPT CHUYÊN HÙNG VƯƠNG
                  </div>
                  <div className="text-[10px] sm:text-[11px] mt-1 text-slate-600">
                    Số: 268/BC-CHV-KTX
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div className="font-bold text-xs sm:text-sm mt-0.5">
                    Độc lập - Tự do - Hạnh phúc
                  </div>
                  <div className="text-[11px] italic text-slate-600 mt-1">
                    Việt Trì, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                  </div>
                </div>
              </div>

              <div className="text-center pt-4 pb-2">
                <h1 className="font-bold text-base sm:text-lg uppercase tracking-tight text-[#002B7F]">
                  BÁO CÁO ĐÁNH GIÁ ĐIỂM KPI VÀ XẾP LOẠI THI ĐUA NỀN NẾP TOÀN TRƯỜNG
                </h1>
                <div className="italic text-xs text-slate-600 mt-1">
                  (Áp dụng theo Quy chế Quản lý Nền nếp Ký túc xá & Nếp sống học đường Năm học 2026 - 2027)
                </div>
              </div>

              <div className="border border-slate-300 rounded-lg overflow-hidden my-3">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">Khối lớp</th>
                      <th className="p-2 border-r border-slate-300 text-center">Số lớp</th>
                      <th className="p-2 border-r border-slate-300 text-center">Tổng học sinh</th>
                      <th className="p-2 border-r border-slate-300 text-center">Số HS KTX</th>
                      <th className="p-2 border-r border-slate-300 text-center">Tổng vi phạm KPI</th>
                      <th className="p-2 text-center">Điểm KPI Trung bình</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeStats.map(g => (
                      <tr key={g.grade} className="border-b border-slate-200">
                        <td className="p-2 font-bold border-r border-slate-200">Khối {g.grade} Chuyên</td>
                        <td className="p-2 text-center border-r border-slate-200">{g.totalClasses}</td>
                        <td className="p-2 text-center border-r border-slate-200">{g.totalStudents}</td>
                        <td className="p-2 text-center border-r border-slate-200">{g.boardingCount}</td>
                        <td className="p-2 text-center border-r border-slate-200">{g.violationsCount}</td>
                        <td className="p-2 text-center font-bold">{g.avgKpi} / 100</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold">
                      <td className="p-2 border-r border-slate-300">TOÀN TRƯỜNG</td>
                      <td className="p-2 text-center border-r border-slate-300">54 Lớp</td>
                      <td className="p-2 text-center border-r border-slate-300">{studyingStudents.length} HS</td>
                      <td className="p-2 text-center border-r border-slate-300">{boardingStudents.length} HS</td>
                      <td className="p-2 text-center border-r border-slate-300">{violations.length} vụ</td>
                      <td className="p-2 text-center text-[#002B7F]">97.4 / 100</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 text-center">
                <div>
                  <div className="font-bold text-xs uppercase">TRƯỞNG BAN QUẢN LÝ KÝ TÚC XÁ</div>
                  <div className="italic text-[11px] text-slate-500 mt-0.5">(Ký và ghi rõ họ tên)</div>
                  <div className="h-16"></div>
                  <div className="font-bold">Thầy Nguyễn Hữu Dũng</div>
                </div>

                <div>
                  <div className="font-bold text-xs uppercase">HIỆU TRƯỞNG TRƯỜNG THPT CHUYÊN HÙNG VƯƠNG</div>
                  <div className="italic text-[11px] text-slate-500 mt-0.5">(Ký tên và đóng dấu)</div>
                  <div className="h-16"></div>
                  <div className="font-bold">Ban Giám Hiệu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
