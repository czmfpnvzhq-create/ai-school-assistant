import { Module } from "@nestjs/common";
import { NoticesService } from "./notices.service";
import { NoticesController } from "./notices.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [NoticesService],
  controllers: [NoticesController],
})
export class NoticesModule {}
