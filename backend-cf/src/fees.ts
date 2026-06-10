import { IRequest } from 'itty-router';
import { Env, getDb } from './db';
import { corsHeaders } from './middleware';

export const getFeesHandler = async (request: IRequest, env: Env) => {
  const db = getDb(env);
  const fees = await db`
    SELECT f.*, s.name as "studentName", c.name as "className" 
    FROM "Fee" f
    JOIN "Student" s ON f."studentId" = s.id
    JOIN "Class" c ON s."classId" = c.id
    ORDER BY f."dueDate" ASC
  `;
  const formatted = fees.map(f => ({
    id: f.id,
    studentId: f.studentId,
    amount: f.amount,
    paid: f.paid,
    dueDate: f.dueDate,
    paidAt: f.paidAt,
    student: { name: f.studentName, class: { name: f.className } }
  }));
  return new Response(JSON.stringify(formatted), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
};

export const payFeeHandler = async (request: IRequest, env: Env) => {
  try {
    const { id } = request.params;
    const db = getDb(env);
    const result = await db`
      UPDATE "Fee" 
      SET paid = true, "paidAt" = NOW() 
      WHERE id = ${Number(id)} 
      RETURNING *
    `;
    return new Response(JSON.stringify(result[0]), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};
