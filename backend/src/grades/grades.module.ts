import { Module } from "@nestjs/common";
import { GradesService } from "./grades.service";
import { GradesController } from "./grades.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [GradesService],
  controllers: [GradesController],
})
export class GradesModule {}
