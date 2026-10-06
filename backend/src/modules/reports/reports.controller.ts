import { Controller, Get, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RoleEnum } from '@prisma/client';

@ApiTags('Reportes & Exportación Excel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('sales/excel')
  @Roles(RoleEnum.ADMINISTRADOR, RoleEnum.SUPERVISOR, RoleEnum.BODEGA)
  @ApiOperation({ summary: 'Generar y descargar reporte consolidado de ventas en formato Excel (.xlsx)' })
  async downloadSalesReport(@Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const excelBuffer = await this.reportsService.generateSalesReportExcel();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="reporte_ventas_la_victoria.xlsx"',
    });

    return new StreamableFile(excelBuffer);
  }

  @Get('inventory/excel')
  @Roles(RoleEnum.ADMINISTRADOR, RoleEnum.BODEGA, RoleEnum.SUPERVISOR)
  @ApiOperation({ summary: 'Generar y descargar reporte de inventarios y stock en formato Excel (.xlsx)' })
  async downloadInventoryReport(@Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const excelBuffer = await this.reportsService.generateInventoryReportExcel();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="reporte_inventarios_la_victoria.xlsx"',
    });

    return new StreamableFile(excelBuffer);
  }
}
