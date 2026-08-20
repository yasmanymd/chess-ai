import { Module } from '@nestjs/common';
import { BootstrapGateway } from './infrastructure/realtime/bootstrap.gateway.js';

@Module({ providers: [BootstrapGateway] })
export class AppModule {}
