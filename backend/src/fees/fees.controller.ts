import { Controller, Get, Put, Query, Param, UseGuards, ParseIntPipe } from "@nestjs/common";
import { FeesService } from "./fees.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("fees")
@UseGuards(JwtAuthGuard)
export class FeesController {
  constructor(private feesService: FeesService) {}

  @Get()
  async findAll(
    @Query("classId") classId?: string,
    @Query("paid") paidStatus?: string,
  ) {
    const classIdNum = classId ? parseInt(classId, 10) : undefined;
    return this.feesService.findAll(classIdNum, paidStatus);
  }

  @Put(":id/pay")
  async pay(@Param("id", ParseIntPipe) id: number) {
    return this.feesService.markAsPaid(id);
  }
}
