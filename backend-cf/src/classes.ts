import { IRequest } from 'itty-router';
import { Env, getDb } from './db';
import { corsHeaders } from './middleware';

export const getClassesHandler = async (request: IRequest, env: Env) => {
  const db = getDb(env);
  const classes = await db`SELECT id, name, teacher, "createdAt" FROM "Class" ORDER BY name ASC`;
  return new Response(JSON.stringify(classes), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
};

export const createClassHandler = async (request: IRequest, env: Env) => {
  try {
    const { name, teacher } = await request.json();
    const db = getDb(env);
    const result = await db`INSERT INTO "Class" (name, teacher, "createdAt") VALUES (${name}, ${teacher}, NOW()) RETURNING *`;
    return new Response(JSON.stringify(result[0]), { status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};

export const updateClassHandler = async (request: IRequest, env: Env) => {
  try {
    const { id } = request.params;
    const { name, teacher } = await request.json();
    const db = getDb(env);
    const result = await db`UPDATE "Class" SET name = ${name}, teacher = ${teacher} WHERE id = ${Number(id)} RETURNING *`;
    return new Response(JSON.stringify(result[0]), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};

export const deleteClassHandler = async (request: IRequest, env: Env) => {
  try {
    const { id } = request.params;
    const db = getDb(env);
    await db`DELETE FROM "Class" WHERE id = ${Number(id)}`;
    return new Response(JSON.stringify({ message: 'Deleted successfully' }), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};
