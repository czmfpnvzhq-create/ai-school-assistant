import { Module } from "@nestjs/common";
import { TeachersService } from "./teachers.service";
import { TeachersController } from "./teachers.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [TeachersService],
  controllers: [TeachersController],
})
export class TeachersModule {}
