import { Controller, Get, UseGuards, Req, Header } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('admin-stats')
  @Header('Cache-Control', 'private, max-age=60')
  async getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @Get('teacher-stats')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, max-age=30')
  async getTeacherStats(@Req() req: any) {
    return this.dashboardService.getTeacherStats(req.user.email);
  }

  @Get('student-stats')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, max-age=30')
  async getStudentStats(@Req() req: any) {
    return this.dashboardService.getStudentStats(req.user.name);
  }

  @Get('parent-stats')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, max-age=30')
  async getParentStats(@Req() req: any) {
    return this.dashboardService.getParentStats(req.user.email);
  }
}
