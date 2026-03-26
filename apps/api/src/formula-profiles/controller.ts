import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';

@Controller('formula-profiles')
export class FormulaProfileController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  @Get()
  list() {
    return this.prisma.formulaProfile.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  @Post()
  async create(@Body() body: any) {
    const created = await this.prisma.formulaProfile.create({ data: body });
    await this.audit.log('admin', 'create', 'FormulaProfile', created.id, null, created);
    return created;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const before = await this.prisma.formulaProfile.findUnique({ where: { id } });
    const updated = await this.prisma.formulaProfile.update({ where: { id }, data: body });
    await this.audit.log('admin', 'update', 'FormulaProfile', id, before, updated);
    return updated;
  }
}
