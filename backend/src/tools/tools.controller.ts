import { Controller, Post, Body } from '@nestjs/common';
import { ToolsService } from './tools.service';

@Controller('tools')
export class ToolsController {
  constructor(private toolsService: ToolsService) {}

  @Post('execute')
  async executeTool(@Body() body: { toolName: string; toolArgs: any }) {
    return this.toolsService.executeTool(body.toolName, body.toolArgs);
  }
}
