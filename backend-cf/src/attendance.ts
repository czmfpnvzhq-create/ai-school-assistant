import { IRequest } from 'itty-router';
import { Env, getDb } from './db';
import { corsHeaders } from './middleware';

export const getAttendanceHandler = async (request: IRequest, env: Env) => {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const db = getDb(env);
  
  let attendance;
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    attendance = await db`
      SELECT a.*, s.name as "studentName", c.name as "className"
      FROM "Attendance" a
      JOIN "Student" s ON a."studentId" = s.id
      JOIN "Class" c ON s."classId" = c.id
      WHERE a.date >= ${startOfDay} AND a.date <= ${endOfDay}
      ORDER BY s.name ASC
    `;
  } else {
    attendance = await db`
      SELECT a.*, s.name as "studentName", c.name as "className"
      FROM "Attendance" a
      JOIN "Student" s ON a."studentId" = s.id
      JOIN "Class" c ON s."classId" = c.id
      ORDER BY a.date DESC
      LIMIT 100
    `;
  }
  
  const formatted = attendance.map(a => ({
    id: a.id,
    studentId: a.studentId,
    date: a.date,
    status: a.status,
    student: { name: a.studentName, class: { name: a.className } }
  }));
  
  return new Response(JSON.stringify(formatted), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
};

export const createAttendanceHandler = async (request: IRequest, env: Env) => {
  try {
    const records = await request.json(); // Expected: [{studentId, date, status}]
    const db = getDb(env);
    
    // Simplistic batch insert/update (upsert-like behavior)
    // Cloudflare Workers with Neon allows transactions via postgres
    const result = await db.begin(async sql => {
      const inserted = [];
      for (const r of records) {
        // Upsert logic for attendance
        const res = await sql`
          INSERT INTO "Attendance" ("studentId", date, status, "createdAt")
          VALUES (${r.studentId}, ${r.date}, ${r.status}, NOW())
          ON CONFLICT ("studentId", date) 
          DO UPDATE SET status = EXCLUDED.status
          RETURNING *
        `;
        inserted.push(res[0]);
      }
      return inserted;
    });
    
    return new Response(JSON.stringify(result), { status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};

export const getAttendanceReportHandler = async (request: IRequest, env: Env) => {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  if (!classId || !startDate || !endDate) {
    return new Response(JSON.stringify({ message: 'Missing parameters' }), { status: 400, headers: corsHeaders(env) });
  }
  
  const db = getDb(env);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  const records = await db`
    SELECT a.status, COUNT(a.id) as count, s.name as "studentName", s.id as "studentId"
    FROM "Attendance" a
    JOIN "Student" s ON a."studentId" = s.id
    WHERE s."classId" = ${Number(classId)} 
      AND a.date >= ${start} 
      AND a.date <= ${end}
    GROUP BY s.id, a.status
  `;
  
  // Aggregate by student
  const aggregated: Record<string, any> = {};
  for (const r of records) {
    if (!aggregated[r.studentId]) {
      aggregated[r.studentId] = { studentName: r.studentName, present: 0, absent: 0, late: 0 };
    }
    aggregated[r.studentId][r.status] = Number(r.count);
  }
  
  return new Response(JSON.stringify(Object.values(aggregated)), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
};
