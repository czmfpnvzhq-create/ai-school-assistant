import { Module } from "@nestjs/common";
import { ClassesService } from "./classes.service";
import { ClassesController } from "./classes.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ClassesService],
  controllers: [ClassesController],
})
export class ClassesModule {}
