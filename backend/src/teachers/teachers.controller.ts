import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from "@nestjs/common";
import { TeachersService } from "./teachers.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("teachers")
@UseGuards(JwtAuthGuard)
export class TeachersController {
  constructor(private teachersService: TeachersService) {}

  @Get()
  async findAll() {
    return this.teachersService.findAll();
  }

  @Post()
  async create(@Body() body: any) {
    return this.teachersService.create(body);
  }

  @Put(":id")
  async update(@Param("id", ParseIntPipe) id: number, @Body() body: any) {
    return this.teachersService.update(id, body);
  }

  @Delete(":id")
  async delete(@Param("id", ParseIntPipe) id: number) {
    return this.teachersService.delete(id);
  }
}
