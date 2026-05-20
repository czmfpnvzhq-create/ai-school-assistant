import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
  ForbiddenException,
} from "@nestjs/common";
import { NoticesService } from "./notices.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("notices")
@UseGuards(JwtAuthGuard)
export class NoticesController {
  constructor(private noticesService: NoticesService) {}

  @Get()
  async findAll() {
    return this.noticesService.findAll();
  }

  @Post()
  async create(
    @Body() body: { title: string; content: string },
    @Req() req: any,
  ) {
    if (req.user.role !== "ADMIN") {
      throw new ForbiddenException("Only admins can post notices");
    }
    return this.noticesService.create(body.title, body.content, req.user.name);
  }

  @Delete(":id")
  async delete(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
    if (req.user.role !== "ADMIN") {
      throw new ForbiddenException("Only admins can delete notices");
    }
    return this.noticesService.delete(id);
  }
}
