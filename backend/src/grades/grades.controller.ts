import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { GradesService } from "./grades.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("grades")
@UseGuards(JwtAuthGuard)
export class GradesController {
  constructor(private gradesService: GradesService) {}

  @Get()
  async getGrades(
    @Query("classId") classId: string,
    @Query("subject") subject: string,
    @Query("examDate") examDate: string
  ) {
    const parsedClassId = parseInt(classId, 10);
    return this.gradesService.getGrades(parsedClassId, subject, examDate);
  }

  @Post()
  async saveGrades(@Body() body: { grades: any[] }) {
    return this.gradesService.saveGrades(body.grades);
  }

  @Get("report")
  async getGradesReport(
    @Query("classId") classId?: string,
    @Query("subject") subject?: string
  ) {
    const parsedClassId =
      classId && classId !== "All" ? parseInt(classId, 10) : undefined;
    const filterSubject = subject && subject !== "All" ? subject : undefined;
    return this.gradesService.getGradesReport(parsedClassId, filterSubject);
  }
}
