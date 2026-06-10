import { Router, IRequest } from 'itty-router';
import { Env } from './db';
import { verifyJWT, handleOptions, corsHeaders } from './middleware';
import { registerHandler, loginHandler } from './auth';
import { getAdminStatsHandler, getTeacherStatsHandler, getStudentStatsHandler, getParentStatsHandler } from './dashboard';
import { getClassesHandler, createClassHandler, updateClassHandler, deleteClassHandler } from './classes';
import { getStudentsHandler, getStudentsByClassHandler, getStudentByIdHandler, createStudentHandler, updateStudentHandler, deleteStudentHandler } from './students';
import { getTeachersHandler, createTeacherHandler, updateTeacherHandler, deleteTeacherHandler } from './teachers';
import { getAttendanceHandler, createAttendanceHandler, getAttendanceReportHandler } from './attendance';
import { getFeesHandler, payFeeHandler } from './fees';
import { getGradesHandler, createGradeHandler, getGradesReportHandler } from './grades';
import { getNoticesHandler, createNoticeHandler, deleteNoticeHandler } from './notices';
import { executeToolHandler } from './tools';

const router = Router();

// Global OPTIONS handler for CORS preflight
router.options('*', handleOptions);

// Health Checks
router.get('/', () => new Response('OK'));
router.get('/health', () => new Response(JSON.stringify({ status: 'ok' }), { headers: { 'Content-Type': 'application/json' } }));

// Auth (Unprotected)
router.post('/auth/register', registerHandler);
router.post('/auth/login', loginHandler);

// Apply JWT verification middleware to all subsequent routes
router.all('*', verifyJWT);

// Dashboard
router.get('/dashboard/admin-stats', getAdminStatsHandler);
router.get('/dashboard/teacher-stats', getTeacherStatsHandler);
router.get('/dashboard/student-stats', getStudentStatsHandler);
router.get('/dashboard/parent-stats', getParentStatsHandler);

// Classes
router.get('/classes', getClassesHandler);
router.post('/classes', createClassHandler);
router.put('/classes/:id', updateClassHandler);
router.delete('/classes/:id', deleteClassHandler);

// Students
router.get('/students/classes/all', getStudentsByClassHandler);
router.get('/students', getStudentsHandler);
router.get('/students/:id', getStudentByIdHandler);
router.post('/students', createStudentHandler);
router.put('/students/:id', updateStudentHandler);
router.delete('/students/:id', deleteStudentHandler);

// Teachers
router.get('/teachers', getTeachersHandler);
router.post('/teachers', createTeacherHandler);
router.put('/teachers/:id', updateTeacherHandler);
router.delete('/teachers/:id', deleteTeacherHandler);

// Attendance
router.get('/attendance/report', getAttendanceReportHandler);
router.get('/attendance', getAttendanceHandler);
router.post('/attendance', createAttendanceHandler);

// Fees
router.get('/fees', getFeesHandler);
router.put('/fees/:id/pay', payFeeHandler);

// Grades
router.get('/grades/report', getGradesReportHandler);
router.get('/grades', getGradesHandler);
router.post('/grades', createGradeHandler);

// Notices
router.get('/notices', getNoticesHandler);
router.post('/notices', createNoticeHandler);
router.delete('/notices/:id', deleteNoticeHandler);

// Tools (AI)
router.post('/tools/execute', executeToolHandler);

// 404 Fallback
router.all('*', (req: IRequest, env: Env) => new Response('Not Found', { status: 404, headers: corsHeaders(env) }));

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await router.fetch(request, env, ctx);
    } catch (e: any) {
      console.error(e);
      return new Response(JSON.stringify({ message: e.message }), { status: 500, headers: corsHeaders(env) });
    }
  },
};
