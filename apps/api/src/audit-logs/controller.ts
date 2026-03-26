import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 300 });
  }
}
