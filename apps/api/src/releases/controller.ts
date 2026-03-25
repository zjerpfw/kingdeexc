import { Controller, Get, Param, Post } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';

@Controller('releases')
export class ReleaseController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  @Post('publish')
  async publish() {
    const [fieldDictionary, formulaProfiles, replacementRules, productSnapshot] = await Promise.all([
      this.prisma.fieldMeta.findMany({ orderBy: { sortOrder: 'asc' } }),
      this.prisma.formulaProfile.findMany({ where: { enabled: true } }),
      this.prisma.replacementRule.findMany({ where: { enabled: true } }),
      this.prisma.productMaster.findMany(),
    ]);
    const version = `v${Date.now()}`;
    const releasedAt = new Date().toISOString();
    const payloadBase = { version, releasedAt, fieldDictionary, formulaProfiles, replacementRules, productSnapshot };
    const checksum = createHash('sha256').update(JSON.stringify(payloadBase)).digest('hex');
    const payload = { ...payloadBase, checksum };
    const created = await this.prisma.ruleRelease.create({ data: { version, releasedAt: new Date(releasedAt), payloadJson: payload as Prisma.InputJsonValue, checksum, createdBy: 'admin' } });
    await this.audit.log('admin', 'publish', 'RuleRelease', created.id, null, created);
    return created;
  }

  @Get('latest')
  latest() {
    return this.prisma.ruleRelease.findFirst({ orderBy: { releasedAt: 'desc' } });
  }

  @Get('history')
  history() {
    return this.prisma.ruleRelease.findMany({ orderBy: { releasedAt: 'desc' } });
  }

  @Post(':version/rollback')
  async rollback(@Param('version') version: string) {
    const release = await this.prisma.ruleRelease.findUnique({ where: { version } });
    if (!release) return { ok: false };
    const newVersion = `rollback-${Date.now()}`;
    const created = await this.prisma.ruleRelease.create({
      data: {
        version: newVersion,
        payloadJson: release.payloadJson as Prisma.InputJsonValue,
        checksum: release.checksum,
        status: 'rollback',
        createdBy: 'admin',
      },
    });
    await this.audit.log('admin', 'rollback', 'RuleRelease', created.id, null, created);
    return created;
  }
}
