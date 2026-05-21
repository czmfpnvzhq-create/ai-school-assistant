import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ToolsService } from './tools.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { isToolAllowedForRole } from './tool-permissions';

@Controller('tools')
@UseGuards(JwtAuthGuard)
export class ToolsController {
  constructor(private toolsService: ToolsService) {}

  @Post('execute')
  async executeTool(
    @Body() body: { toolName: string; toolArgs: Record<string, unknown> },
    @Req() req: { user: { role: string; name: string; email: string } },
  ) {
    const { toolName, toolArgs } = body;

    if (!isToolAllowedForRole(req.user.role, toolName)) {
      throw new ForbiddenException(
        `Role ${req.user.role} is not allowed to use tool: ${toolName}`,
      );
    }

    return this.toolsService.executeTool(toolName, toolArgs ?? {});
  }
}
