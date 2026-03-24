import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';

@Controller('field-meta')
export class FieldMetaController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  @Get()
  list() {
    return this.prisma.fieldMeta.findMany({ orderBy: [{ source: 'asc' }, { sortOrder: 'asc' }] });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { labelZh?: string; descriptionZh?: string; visibleDefault?: boolean }) {
    const before = await this.prisma.fieldMeta.findUnique({ where: { id } });
    const updated = await this.prisma.fieldMeta.update({ where: { id }, data: body });
    await this.audit.log('admin', 'update', 'FieldMeta', id, before, updated);
    return updated;
  }
}
