import { Module } from '@nestjs/common';
import { PrismaService } from './common/prisma.service';
import { AuditService } from './common/audit.service';
import { FieldMetaController } from './field-meta/controller';
import { ProductsController } from './products/controller';
import { ReplacementRuleController } from './replacement-rules/controller';
import { FormulaProfileController } from './formula-profiles/controller';
import { ReleaseController } from './releases/controller';
import { AuditLogsController } from './audit-logs/controller';

@Module({
  controllers: [FieldMetaController, ProductsController, ReplacementRuleController, FormulaProfileController, ReleaseController, AuditLogsController],
  providers: [PrismaService, AuditService],
})
export class AppModule {}
