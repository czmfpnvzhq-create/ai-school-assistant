import { IRequest } from 'itty-router';
import { Env, getDb } from './db';
import { corsHeaders } from './middleware';

export const getTeachersHandler = async (request: IRequest, env: Env) => {
  const db = getDb(env);
  const teachers = await db`
    SELECT t.*, c.name as "className" 
    FROM "Teacher" t
    LEFT JOIN "Class" c ON t."classId" = c.id
    ORDER BY t.name ASC
  `;
  // Restructure to match Prisma's nested output if frontend expects it
  const formatted = teachers.map(t => ({
    id: t.id,
    name: t.name,
    email: t.email,
    subject: t.subject,
    classId: t.classId,
    createdAt: t.createdAt,
    class: t.className ? { name: t.className } : null
  }));
  return new Response(JSON.stringify(formatted), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
};

export const createTeacherHandler = async (request: IRequest, env: Env) => {
  try {
    const { name, email, subject, classId } = await request.json();
    const db = getDb(env);
    const result = await db`
      INSERT INTO "Teacher" (name, email, subject, "classId", "createdAt") 
      VALUES (${name}, ${email}, ${subject}, ${classId || null}, NOW()) 
      RETURNING *
    `;
    return new Response(JSON.stringify(result[0]), { status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};

export const updateTeacherHandler = async (request: IRequest, env: Env) => {
  try {
    const { id } = request.params;
    const { name, email, subject, classId } = await request.json();
    const db = getDb(env);
    const result = await db`
      UPDATE "Teacher" 
      SET name = ${name}, email = ${email}, subject = ${subject}, "classId" = ${classId || null} 
      WHERE id = ${Number(id)} 
      RETURNING *
    `;
    return new Response(JSON.stringify(result[0]), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};

export const deleteTeacherHandler = async (request: IRequest, env: Env) => {
  try {
    const { id } = request.params;
    const db = getDb(env);
    await db`DELETE FROM "Teacher" WHERE id = ${Number(id)}`;
    return new Response(JSON.stringify({ message: 'Deleted successfully' }), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};
