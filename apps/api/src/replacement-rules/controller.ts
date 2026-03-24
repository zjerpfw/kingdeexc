import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';

@Controller('replacement-rules')
export class ReplacementRuleController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  @Get()
  list() {
    return this.prisma.replacementRule.findMany({ orderBy: [{ sourceProductCode: 'asc' }, { priority: 'asc' }] });
  }

  @Post()
  async create(@Body() body: any) {
    const created = await this.prisma.replacementRule.create({ data: { ...body, createdBy: body.createdBy || 'admin', updatedBy: body.updatedBy || 'admin' } });
    await this.audit.log('admin', 'create', 'ReplacementRule', created.ruleId, null, created);
    return created;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const before = await this.prisma.replacementRule.findUnique({ where: { ruleId: id } });
    const updated = await this.prisma.replacementRule.update({ where: { ruleId: id }, data: body });
    await this.audit.log('admin', 'update', 'ReplacementRule', id, before, updated);
    return updated;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const before = await this.prisma.replacementRule.findUnique({ where: { ruleId: id } });
    await this.prisma.replacementRule.delete({ where: { ruleId: id } });
    await this.audit.log('admin', 'delete', 'ReplacementRule', id, before, null);
    return { ok: true };
  }
}
