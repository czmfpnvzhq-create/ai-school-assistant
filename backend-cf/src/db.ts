import postgres from 'postgres';

export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
}

let sql: postgres.Sql<any> | null = null;

export function getDb(env: Env) {
  if (!sql) {
    sql = postgres(env.DATABASE_URL, {
      idle_timeout: 20,
      max_lifetime: 60 * 30, // 30 minutes
    });
  }
  return sql;
}
