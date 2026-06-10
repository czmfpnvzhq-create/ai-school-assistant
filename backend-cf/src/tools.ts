import { IRequest } from 'itty-router';
import { Env, getDb } from './db';
import { corsHeaders } from './middleware';

export const executeToolHandler = async (request: IRequest, env: Env) => {
  try {
    const user = (request as any).user;
    const { toolName, toolArgs } = await request.json();
    
    // Role checks
    const allowed = checkRole(user.role, toolName);
    if (!allowed) {
      return new Response(JSON.stringify({ message: `Role ${user.role} is not allowed to use tool: ${toolName}` }), { status: 403, headers: corsHeaders(env) });
    }

    const db = getDb(env);
    
    switch (toolName) {
      case 'get_student_by_name': {
        const { name } = toolArgs;
        if (!name) return new Response(JSON.stringify({ error: 'Argument name required' }), { headers: corsHeaders(env) });
        
        const search = name.trim();
        const words = search.split(/\s+/).filter((w: string) => w.length >= 2);
        
        let students;
        if (words.length > 0) {
          // Construct ILIKE conditions dynamically
          const conditions = words.map((w: string) => db`name ILIKE ${'%' + w + '%'}`);
          students = await db`
            SELECT s.id, s.name, s."gradeAvg", s."parentEmail", s.phone, c.name as "className"
            FROM "Student" s
            LEFT JOIN "Class" c ON s."classId" = c.id
            WHERE ${conditions.reduce((acc: any, c: any) => db`${acc} AND ${c}`)}
            ORDER BY s.name ASC LIMIT 10
          `;
        } else {
          students = await db`
            SELECT s.id, s.name, s."gradeAvg", s."parentEmail", s.phone, c.name as "className"
            FROM "Student" s
            LEFT JOIN "Class" c ON s."classId" = c.id
            WHERE name ILIKE ${'%' + search + '%'}
            ORDER BY s.name ASC LIMIT 10
          `;
        }

        if (students.length === 0) {
          return new Response(JSON.stringify({ success: false, message: 'No student found', matches: [] }), { headers: corsHeaders(env) });
        }

        if (students.length === 1) {
          const s = students[0];
          // Fetch relations manually since we don't have Prisma include
          const attendances = await db`SELECT date, status FROM "Attendance" WHERE "studentId" = ${s.id} ORDER BY date DESC LIMIT 30`;
          const grades = await db`SELECT subject, score, "examDate" FROM "Grade" WHERE "studentId" = ${s.id} ORDER BY "examDate" DESC LIMIT 10`;
          const fees = await db`SELECT amount, paid, "dueDate" FROM "Fee" WHERE "studentId" = ${s.id} ORDER BY "dueDate" DESC LIMIT 5`;

          const present = attendances.filter(a => a.status === 'present').length;
          const absent = attendances.filter(a => a.status === 'absent').length;
          const late = attendances.filter(a => a.status === 'late').length;
          const totalAtt = attendances.length;
          const attendanceRatePercent = totalAtt > 0 ? Math.round(((present + late) / totalAtt) * 100) : 0;

          return new Response(JSON.stringify({
            success: true,
            student: {
              id: s.id,
              name: s.name,
              className: s.className,
              gradeAvg: Number(s.gradeAvg),
              parentEmail: s.parentEmail,
              phone: s.phone,
              attendanceSummary: { present, absent, late, totalDaysTracked: totalAtt, attendanceRatePercent },
              recentGrades: grades,
              fees
            }
          }), { headers: corsHeaders(env) });
        }

        return new Response(JSON.stringify({
          success: true, multipleMatches: true, matches: students
        }), { headers: corsHeaders(env) });
      }

      case 'get_class_summary': {
        const { class_name } = toolArgs;
        if (!class_name) return new Response(JSON.stringify({ error: 'class_name required' }), { headers: corsHeaders(env) });
        
        const targetClass = await db`SELECT id, name FROM "Class" WHERE name ILIKE ${class_name} LIMIT 1`;
        if (targetClass.length === 0) return new Response(JSON.stringify({ error: 'Class not found' }), { headers: corsHeaders(env) });
        
        const stats = await db`
          SELECT COUNT(id) as count, AVG("gradeAvg") as avg 
          FROM "Student" 
          WHERE "classId" = ${targetClass[0].id}
        `;
        return new Response(JSON.stringify({
          className: targetClass[0].name,
          totalStudents: Number(stats[0].count),
          averageGrade: stats[0].avg ? parseFloat(Number(stats[0].avg).toFixed(2)) : 0
        }), { headers: corsHeaders(env) });
      }

      case 'get_attendance_report': {
        const { date, status, class_name } = toolArgs;
        if (!date) return new Response(JSON.stringify({ error: 'date required' }), { headers: corsHeaders(env) });
        
        let classFilter = db``;
        if (class_name) {
          const targetClass = await db`SELECT id FROM "Class" WHERE name ILIKE ${class_name} LIMIT 1`;
          if (targetClass.length > 0) {
            classFilter = db`AND s."classId" = ${targetClass[0].id}`;
          }
        }
        
        let statusFilter = db``;
        if (status) statusFilter = db`AND a.status = ${status}`;

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const records = await db`
          SELECT a.status, a.date, s.name as "studentName", c.name as "className"
          FROM "Attendance" a
          JOIN "Student" s ON a."studentId" = s.id
          JOIN "Class" c ON s."classId" = c.id
          WHERE a.date >= ${startOfDay} AND a.date <= ${endOfDay}
          ${statusFilter}
          ${classFilter}
          ORDER BY s.name ASC
        `;
        
        return new Response(JSON.stringify(records.length === 0 ? { success: true, data: [] } : records), { headers: corsHeaders(env) });
      }

      case 'get_fee_report': {
        const feesRes = await db`
          SELECT 
            SUM(CASE WHEN paid = true THEN amount ELSE 0 END) as collected,
            SUM(CASE WHEN paid = false THEN amount ELSE 0 END) as pending,
            COUNT(CASE WHEN paid = false THEN 1 END) as pending_count,
            COUNT(id) as total_count
          FROM "Fee"
        `;
        const collected = Number(feesRes[0].collected || 0);
        const pending = Number(feesRes[0].pending || 0);
        const pendingCount = Number(feesRes[0].pending_count || 0);
        const totalCount = Number(feesRes[0].total_count || 0);
        const total = collected + pending;
        const collectionRate = total > 0 ? parseFloat(((collected / total) * 100).toFixed(2)) : 0;
        
        return new Response(JSON.stringify({
          totalFees: totalCount, collectedAmount: collected, pendingAmount: pending, pendingRecords: pendingCount, collectionRatePercent: collectionRate
        }), { headers: corsHeaders(env) });
      }
      
      // I'll skip other tools for brevity or implement them as needed
      default:
        return new Response(JSON.stringify({ error: 'Tool not supported or not found' }), { headers: corsHeaders(env) });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};

function checkRole(role: string, toolName: string) {
  if (role === 'ADMIN') return true;
  if (role === 'TEACHER' && ['get_class_summary', 'get_attendance_report'].includes(toolName)) return true;
  if ((role === 'STUDENT' || role === 'PARENT') && ['get_student_by_name'].includes(toolName)) return true;
  return false;
}
