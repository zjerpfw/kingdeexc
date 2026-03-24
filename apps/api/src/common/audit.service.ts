import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(actor: string, action: string, entityType: string, entityId: string, beforeJson: unknown, afterJson: unknown) {
    return this.prisma.auditLog.create({ data: { actor, action, entityType, entityId, beforeJson: beforeJson as any, afterJson: afterJson as any } });
  }
}
