import { Module } from "@nestjs/common";
import { FeesService } from "./fees.service";
import { FeesController } from "./fees.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [FeesService],
  controllers: [FeesController],
})
export class FeesModule {}
