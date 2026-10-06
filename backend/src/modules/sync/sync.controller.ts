import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { SyncBatchDto } from './dto/sync-batch.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { RequirePermissions } from '../auth/permissions/require-permissions.decorator';
import { PermissionEnum } from '../auth/permissions/permissions.enum';

@ApiTags('Sincronización Offline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sync')
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post('batch')
  @ApiOperation({ summary: 'Sincronizar lote de pedidos y clientes generados en modo offline con verificación idempotente' })
  async processBatchSync(@Body() syncBatchDto: SyncBatchDto, @Request() req: any) {
    return this.syncService.processSync(syncBatchDto, req.user.id);
  }

  @Get('initial-data')
  @ApiOperation({ summary: 'Descargar datos iniciales del servidor para almacenamiento offline local SQLite' })
  async getInitialStateData(@Request() req: any) {
    return this.syncService.getInitialStateData(req.user);
  }

  @Get('logs')
  @RequirePermissions(PermissionEnum.REPORT_READ_ALL)
  @ApiOperation({ summary: 'Consultar registro de auditoría de sincronizaciones offline ejecutadas' })
  async getSyncLogs() {
    return this.syncService.getSyncLogs();
  }
}
