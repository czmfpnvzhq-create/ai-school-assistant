import { IRequest } from 'itty-router';
import { Env, getDb } from './db';
import { corsHeaders } from './middleware';

export const getStudentsHandler = async (request: IRequest, env: Env) => {
  const db = getDb(env);
  const students = await db`
    SELECT s.*, c.name as "className" 
    FROM "Student" s
    LEFT JOIN "Class" c ON s."classId" = c.id
    ORDER BY s.name ASC
  `;
  const formatted = students.map(s => ({
    ...s,
    class: s.className ? { name: s.className } : null
  }));
  return new Response(JSON.stringify(formatted), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
};

export const getStudentsByClassHandler = async (request: IRequest, env: Env) => {
  const db = getDb(env);
  const classes = await db`SELECT id, name FROM "Class" ORDER BY name ASC`;
  const students = await db`SELECT id, name, "classId", "gradeAvg", "parentEmail", phone FROM "Student" ORDER BY name ASC`;
  
  const result = classes.map(c => ({
    ...c,
    students: students.filter(s => s.classId === c.id)
  }));
  
  return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
};

export const getStudentByIdHandler = async (request: IRequest, env: Env) => {
  try {
    const { id } = request.params;
    const db = getDb(env);
    const students = await db`
      SELECT s.*, c.name as "className" 
      FROM "Student" s
      LEFT JOIN "Class" c ON s."classId" = c.id
      WHERE s.id = ${Number(id)}
    `;
    if (students.length === 0) {
      return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404, headers: corsHeaders(env) });
    }
    const s = students[0];
    const formatted = { ...s, class: s.className ? { name: s.className } : null };
    return new Response(JSON.stringify(formatted), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};

export const createStudentHandler = async (request: IRequest, env: Env) => {
  try {
    const { name, classId, parentEmail, phone, address } = await request.json();
    const db = getDb(env);
    const result = await db`
      INSERT INTO "Student" (name, "classId", "parentEmail", phone, address, "gradeAvg", "createdAt") 
      VALUES (${name}, ${classId}, ${parentEmail || null}, ${phone || null}, ${address || null}, 0, NOW()) 
      RETURNING *
    `;
    return new Response(JSON.stringify(result[0]), { status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};

export const updateStudentHandler = async (request: IRequest, env: Env) => {
  try {
    const { id } = request.params;
    const { name, classId, parentEmail, phone, address } = await request.json();
    const db = getDb(env);
    const result = await db`
      UPDATE "Student" 
      SET name = ${name}, "classId" = ${classId}, "parentEmail" = ${parentEmail || null}, phone = ${phone || null}, address = ${address || null}
      WHERE id = ${Number(id)} 
      RETURNING *
    `;
    return new Response(JSON.stringify(result[0]), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};

export const deleteStudentHandler = async (request: IRequest, env: Env) => {
  try {
    const { id } = request.params;
    const db = getDb(env);
    await db`DELETE FROM "Student" WHERE id = ${Number(id)}`;
    return new Response(JSON.stringify({ message: 'Deleted successfully' }), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};
