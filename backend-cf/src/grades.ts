import { IRequest } from 'itty-router';
import { Env, getDb } from './db';
import { corsHeaders } from './middleware';

export const getGradesHandler = async (request: IRequest, env: Env) => {
  const db = getDb(env);
  const grades = await db`
    SELECT g.*, s.name as "studentName", c.name as "className" 
    FROM "Grade" g
    JOIN "Student" s ON g."studentId" = s.id
    JOIN "Class" c ON s."classId" = c.id
    ORDER BY g."examDate" DESC
  `;
  const formatted = grades.map(g => ({
    id: g.id,
    studentId: g.studentId,
    subject: g.subject,
    score: g.score,
    examDate: g.examDate,
    student: { name: g.studentName, class: { name: g.className } }
  }));
  return new Response(JSON.stringify(formatted), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
};

export const createGradeHandler = async (request: IRequest, env: Env) => {
  try {
    const { studentId, subject, score, examDate } = await request.json();
    const db = getDb(env);
    
    // Insert grade
    const result = await db`
      INSERT INTO "Grade" ("studentId", subject, score, "examDate") 
      VALUES (${studentId}, ${subject}, ${score}, ${examDate}) 
      RETURNING *
    `;
    
    // Update student's grade average
    const avgResult = await db`
      SELECT AVG(score) as avg 
      FROM "Grade" 
      WHERE "studentId" = ${studentId}
    `;
    const newAvg = avgResult[0].avg || 0;
    
    await db`UPDATE "Student" SET "gradeAvg" = ${newAvg} WHERE id = ${studentId}`;
    
    return new Response(JSON.stringify(result[0]), { status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};

export const getGradesReportHandler = async (request: IRequest, env: Env) => {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  const db = getDb(env);
  
  let query;
  if (classId) {
    query = await db`
      SELECT s.id, s.name, s."gradeAvg", c.name as "className"
      FROM "Student" s
      JOIN "Class" c ON s."classId" = c.id
      WHERE s."classId" = ${Number(classId)}
      ORDER BY s."gradeAvg" DESC
    `;
  } else {
    query = await db`
      SELECT s.id, s.name, s."gradeAvg", c.name as "className"
      FROM "Student" s
      JOIN "Class" c ON s."classId" = c.id
      ORDER BY s."gradeAvg" DESC
    `;
  }
  
  const formatted = query.map(s => ({
    id: s.id,
    name: s.name,
    className: s.className,
    gradeAvg: parseFloat(s.gradeAvg)
  }));
  
  return new Response(JSON.stringify(formatted), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
};
