import * as jose from 'jose';
import { Env } from './db';

// Extract the token from the "token" cookie
function extractCookie(cookieString: string | null, name: string): string | null {
  if (!cookieString) return null;
  const match = cookieString.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
}

export const verifyJWT = async (request: Request, env: Env) => {
  const cookieHeader = request.headers.get('Cookie');
  const token = extractCookie(cookieHeader, 'token');

  if (!token) {
    return new Response(JSON.stringify({ message: 'Unauthorized: No token provided' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
    });
  }

  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    
    // Attach user payload to request so subsequent handlers can access it
    (request as any).user = payload;
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Unauthorized: Invalid or expired token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
    });
  }
};

export const corsHeaders = (env: Env) => ({
  'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  'Access-Control-Allow-Credentials': 'true',
});

export const handleOptions = (request: Request, env: Env) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(env),
    });
  }
};
