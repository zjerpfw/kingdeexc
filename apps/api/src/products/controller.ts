import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@Query('q') q?: string) {
    if (!q) return this.prisma.productMaster.findMany({ take: 200, orderBy: { updatedAt: 'desc' } });
    return this.prisma.productMaster.findMany({
      where: {
        OR: [
          { productCode: { contains: q, mode: 'insensitive' } },
          { productName: { contains: q, mode: 'insensitive' } },
          { warehouseName: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 50,
    });
  }

  @Get('search')
  search(@Query('keyword') keyword = '') {
    return this.prisma.productMaster.findMany({
      where: { OR: [{ productCode: { contains: keyword, mode: 'insensitive' } }, { productName: { contains: keyword, mode: 'insensitive' } }] },
      take: 30,
    });
  }
}
