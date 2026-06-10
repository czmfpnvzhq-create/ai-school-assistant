import { IRequest } from 'itty-router';
import { Env, getDb } from './db';
import { corsHeaders } from './middleware';

export const getAdminStatsHandler = async (request: IRequest, env: Env) => {
  try {
    const db = getDb(env);
    
    // Total Students
    const studentsRes = await db`SELECT COUNT(*) as count FROM "Student"`;
    const totalStudents = Number(studentsRes[0].count);
    
    // Total Teachers
    const teachersRes = await db`SELECT COUNT(*) as count FROM "Teacher"`;
    const totalTeachers = Number(teachersRes[0].count);
    
    // Total Classes
    const classesRes = await db`SELECT COUNT(*) as count FROM "Class"`;
    const totalClasses = Number(classesRes[0].count);
    
    // Fees Collected and Pending
    const feesRes = await db`
      SELECT 
        SUM(CASE WHEN paid = true THEN amount ELSE 0 END) as collected,
        COUNT(CASE WHEN paid = false THEN 1 END) as pending_count
      FROM "Fee"
    `;
    const feesCollected = Number(feesRes[0].collected || 0);
    const feesPending = Number(feesRes[0].pending_count || 0);
    
    // Absent Today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const absentRes = await db`
      SELECT COUNT(*) as count 
      FROM "Attendance" 
      WHERE date >= ${startOfToday} AND date <= ${endOfToday} AND status = 'absent'
    `;
    const absentToday = Number(absentRes[0].count);
    
    // Top Students
    const topStudentsRes = await db`
      SELECT s.id, s.name, s."gradeAvg", c.name as "className"
      FROM "Student" s
      LEFT JOIN "Class" c ON s."classId" = c.id
      ORDER BY "gradeAvg" DESC
      LIMIT 5
    `;
    const topStudents = topStudentsRes.map((s, index) => ({
      id: s.id,
      rank: index + 1,
      name: s.name,
      className: s.className || 'No Class',
      gradeAvg: Number(s.gradeAvg)
    }));
    
    // Recent Notices
    const notices = await db`
      SELECT id, title, content, "createdAt" 
      FROM "Notice" 
      ORDER BY "createdAt" DESC 
      LIMIT 3
    `;
    
    // Attendance Data (Last 7 Days)
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekAttendance = await db`
      SELECT date, status 
      FROM "Attendance" 
      WHERE date >= ${startOfWeek} AND date <= ${endOfToday}
    `;
    
    const dayBuckets = new Map<string, { total: number; present: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dayBuckets.set(key, { total: 0, present: 0 });
    }

    for (const record of weekAttendance) {
      const key = record.date.toISOString().slice(0, 10);
      const bucket = dayBuckets.get(key);
      if (!bucket) continue;
      bucket.total += 1;
      if (record.status === 'present') bucket.present += 1;
    }

    const attendanceData: Array<{ name: string; rate: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const bucket = dayBuckets.get(key) ?? { total: 0, present: 0 };
      const percentage =
        bucket.total === 0 ? 100 : Math.round((bucket.present / bucket.total) * 100);
      attendanceData.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        rate: percentage,
      });
    }

    return new Response(JSON.stringify({
      totalStudents,
      totalTeachers,
      totalClasses,
      feesCollected,
      feesPending,
      absentToday,
      topStudents,
      recentNotices: notices,
      attendanceData
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });

  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};

export const getTeacherStatsHandler = async (request: IRequest, env: Env) => {
  try {
    const user = (request as any).user;
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403, headers: corsHeaders(env) });
    }

    const db = getDb(env);
    const teacherRes = await db`
      SELECT t.id, t.name, t.subject, c.id as "classId", c.name as "className"
      FROM "Teacher" t
      LEFT JOIN "Class" c ON t."classId" = c.id
      WHERE t.email = ${user.email}
    `;
    
    if (teacherRes.length === 0 || !teacherRes[0].classId) {
      return new Response(JSON.stringify({
        teacher: teacherRes[0] || null,
        assignedClass: null,
        totalStudents: 0,
        todayAttendanceRate: 0,
        classGradeAvg: 0,
        students: [],
        todayAttendance: [],
        recentGrades: [],
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
    }

    const teacher = teacherRes[0];
    const classId = teacher.classId;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const studentsRes = await db`SELECT id, name, "gradeAvg" FROM "Student" WHERE "classId" = ${classId} ORDER BY name ASC`;
    const totalStudents = studentsRes.length;
    
    const todayAttendance = await db`
      SELECT a.status, a."studentId" 
      FROM "Attendance" a
      JOIN "Student" s ON a."studentId" = s.id
      WHERE s."classId" = ${classId} AND a.date >= ${startOfToday} AND a.date <= ${endOfToday}
    `;

    const recentGrades = await db`
      SELECT g.id, g.subject, g.score, g."examDate", s.name as "studentName"
      FROM "Grade" g
      JOIN "Student" s ON g."studentId" = s.id
      WHERE s."classId" = ${classId}
      ORDER BY g."examDate" DESC
      LIMIT 10
    `;

    const presentCount = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const todayAttendanceRate = todayAttendance.length > 0 ? Math.round((presentCount / todayAttendance.length) * 100) : 0;
    
    let sumGrades = 0;
    for (const s of studentsRes) sumGrades += Number(s.gradeAvg);
    const classGradeAvg = totalStudents > 0 ? parseFloat((sumGrades / totalStudents).toFixed(2)) : 0;

    const attendanceMap: Record<number, string> = {};
    todayAttendance.forEach((a) => {
      attendanceMap[a.studentId] = a.status;
    });

    return new Response(JSON.stringify({
      teacher: { id: teacher.id, name: teacher.name, subject: teacher.subject },
      assignedClass: { id: teacher.classId, name: teacher.className },
      totalStudents,
      todayAttendanceRate,
      todayMarked: todayAttendance.length > 0,
      classGradeAvg,
      students: studentsRes.map((s) => ({ ...s, todayStatus: attendanceMap[s.id] || null })),
      recentGrades,
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });

  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};

export const getStudentStatsHandler = async (request: IRequest, env: Env) => {
  try {
    const user = (request as any).user;
    const db = getDb(env);

    const studentRes = await db`
      SELECT s.id, s.name, s."gradeAvg", c.name as "className"
      FROM "Student" s
      LEFT JOIN "Class" c ON s."classId" = c.id
      WHERE s.name = ${user.name}
      LIMIT 1
    `;

    const recentNotices = await db`SELECT id, title, content, "createdAt" FROM "Notice" ORDER BY "createdAt" DESC LIMIT 5`;

    if (studentRes.length === 0) {
      return new Response(JSON.stringify({ student: null, recentNotices }), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
    }

    const student = studentRes[0];

    const attendances = await db`
      SELECT date, status FROM "Attendance" 
      WHERE "studentId" = ${student.id} 
      ORDER BY date DESC LIMIT 30
    `;

    const recentGrades = await db`
      SELECT id, subject, score, "examDate" FROM "Grade" 
      WHERE "studentId" = ${student.id} 
      ORDER BY "examDate" DESC LIMIT 10
    `;

    const totalDays = attendances.length;
    const presentDays = attendances.filter(a => a.status === 'present' || a.status === 'late').length;
    const absentDays = attendances.filter(a => a.status === 'absent').length;
    const lateDays = attendances.filter(a => a.status === 'late').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    return new Response(JSON.stringify({
      student: {
        id: student.id,
        name: student.name,
        className: student.className || 'Unassigned',
        gradeAvg: student.gradeAvg,
        attendance: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          percentage: attendancePercentage,
          records: attendances,
        },
        recentGrades,
      },
      recentNotices,
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });

  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};

export const getParentStatsHandler = async (request: IRequest, env: Env) => {
  try {
    const user = (request as any).user;
    const db = getDb(env);

    const studentRes = await db`
      SELECT s.id, s.name, s."gradeAvg", c.name as "className"
      FROM "Student" s
      LEFT JOIN "Class" c ON s."classId" = c.id
      WHERE s."parentEmail" = ${user.email}
      LIMIT 1
    `;

    const recentNotices = await db`SELECT id, title, content, "createdAt" FROM "Notice" ORDER BY "createdAt" DESC LIMIT 5`;

    if (studentRes.length === 0) {
      return new Response(JSON.stringify({ child: null, recentNotices }), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
    }

    const student = studentRes[0];

    const attendances = await db`
      SELECT date, status FROM "Attendance" 
      WHERE "studentId" = ${student.id} 
      ORDER BY date DESC LIMIT 30
    `;

    const grades = await db`
      SELECT id, subject, score, "examDate" FROM "Grade" 
      WHERE "studentId" = ${student.id} 
      ORDER BY "examDate" DESC LIMIT 10
    `;

    const fees = await db`
      SELECT id, amount, paid, "dueDate", "paidAt" FROM "Fee" 
      WHERE "studentId" = ${student.id} 
      ORDER BY "dueDate" DESC
    `;

    const totalDays = attendances.length;
    const presentDays = attendances.filter(a => a.status === 'present').length;
    const lateDays = attendances.filter(a => a.status === 'late').length;
    const absentDays = attendances.filter(a => a.status === 'absent').length;
    const attendancePercentage = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0;

    let totalFees = 0;
    let paidFees = 0;
    let pendingFees = 0;

    fees.forEach(f => {
      totalFees += Number(f.amount);
      if (f.paid) paidFees += Number(f.amount);
      else pendingFees += Number(f.amount);
    });

    return new Response(JSON.stringify({
      child: {
        id: student.id,
        name: student.name,
        className: student.className || 'Unassigned',
        gradeAvg: student.gradeAvg,
        attendance: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          percentage: attendancePercentage,
          records: attendances,
        },
        recentGrades: grades.slice(0, 5),
        grades,
        fees,
        latestFee: fees.length > 0 ? fees[0] : null,
        feeSummary: { total: totalFees, paid: paidFees, pending: pendingFees },
      },
      recentNotices,
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });

  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};
