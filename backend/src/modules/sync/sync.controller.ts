import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { SyncBatchDto } from './dto/sync-batch.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Sincronización Offline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post('batch')
  @ApiOperation({ summary: 'Sincronizar lote de pedidos y clientes generados en modo offline' })
  async processBatchSync(@Body() syncBatchDto: SyncBatchDto, @Request() req: any) {
    return this.syncService.processSync(syncBatchDto, req.user.id);
  }

  @Get('initial-data')
  @ApiOperation({ summary: 'Descargar datos iniciales del servidor para la base de datos local SQLite' })
  async getInitialStateData() {
    return this.syncService.getInitialStateData();
  }
}
