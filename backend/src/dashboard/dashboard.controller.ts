import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('admin-stats')
  async getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @Get('teacher-stats')
  @UseGuards(JwtAuthGuard)
  async getTeacherStats(@Req() req: any) {
    return this.dashboardService.getTeacherStats(req.user.email);
  }
}
