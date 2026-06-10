import { IRequest } from 'itty-router';
import { Env, getDb } from './db';
import * as bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { corsHeaders } from './middleware';

export const registerHandler = async (request: IRequest, env: Env) => {
  try {
    const { name, email, password, role } = await request.json();
    if (!name || !email || !password || !role) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400, headers: corsHeaders(env) });
    }

    const db = getDb(env);
    
    // Check if user exists
    const existingUser = await db`SELECT id FROM "User" WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return new Response(JSON.stringify({ message: 'User already exists' }), { status: 400, headers: corsHeaders(env) });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const newUser = await db`
      INSERT INTO "User" (name, email, password, role, "createdAt") 
      VALUES (${name}, ${email}, ${hashedPassword}, ${role}, NOW()) 
      RETURNING id, name, email, role
    `;

    // Create JWT
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const jwt = await new jose.SignJWT({ id: newUser[0].id, name: newUser[0].name, email: newUser[0].email, role: newUser[0].role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    return new Response(JSON.stringify({ user: newUser[0] }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(env),
        'Set-Cookie': `token=${jwt}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`,
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};

export const loginHandler = async (request: IRequest, env: Env) => {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400, headers: corsHeaders(env) });
    }

    const db = getDb(env);
    const users = await db`SELECT id, name, email, password, role FROM "User" WHERE email = ${email}`;
    if (users.length === 0) {
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401, headers: corsHeaders(env) });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401, headers: corsHeaders(env) });
    }

    // Create JWT
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const jwt = await new jose.SignJWT({ id: user.id, name: user.name, email: user.email, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    // Remove password from response
    delete user.password;

    return new Response(JSON.stringify({ user }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(env),
        'Set-Cookie': `token=${jwt}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`,
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: corsHeaders(env) });
  }
};
