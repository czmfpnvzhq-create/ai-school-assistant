import { IRequest } from 'itty-router';
import { Env, getDb } from './db';
import { corsHeaders } from './middleware';

export const getNoticesHandler = async (request: IRequest, env: Env) => {
  const db = getDb(env);
  const notices = await db`SELECT id, title, content, "postedBy", "createdAt" FROM "Notice" ORDER BY "createdAt" DESC`;
  return new Response(JSON.stringify(notices), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
};

export const createNoticeHandler = async (request: IRequest, env: Env) => {
  try {
    const { title, content, postedBy } = await request.json();
    const db = getDb(env);
    const result = await db`
      INSERT INTO "Notice" (title, content, "postedBy", "createdAt") 
      VALUES (${title}, ${content}, ${postedBy}, NOW()) 
      RETURNING *
    `;
    return new Response(JSON.stringify(result[0]), { status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};

export const deleteNoticeHandler = async (request: IRequest, env: Env) => {
  try {
    const { id } = request.params;
    const db = getDb(env);
    await db`DELETE FROM "Notice" WHERE id = ${Number(id)}`;
    return new Response(JSON.stringify({ message: 'Deleted successfully' }), { headers: { 'Content-Type': 'application/json', ...corsHeaders(env) } });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};
