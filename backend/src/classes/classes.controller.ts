import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { ClassesService } from "./classes.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("classes")
@UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(private classesService: ClassesService) {}

  @Get()
  async findAll() {
    return this.classesService.findAll();
  }

  @Post()
  async create(@Body() body: { name: string; teacher: string }) {
    return this.classesService.create(body.name, body.teacher);
  }

  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { name: string; teacher: string },
  ) {
    return this.classesService.update(id, body.name, body.teacher);
  }

  @Delete(":id")
  async delete(@Param("id", ParseIntPipe) id: number) {
    return this.classesService.delete(id);
  }
}
