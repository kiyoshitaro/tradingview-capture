import { Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';

export class ChartDTO {
  address: string;

  indicators?: string;

  symbol?: string;

  resolution?: string;

  priceScale?: string;
}

@Controller('/app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('data_chart')
  async dataChart(
    @Query('resolution') resolution: string,
    @Query('address') address: string,
  ) {
    return await this.appService.getChartData(resolution, address);
  }

  @Get('chart')
  async crawlChart(@Query() dto: ChartDTO) {
    const { address, indicators, symbol, resolution, priceScale } = dto;
    return await this.appService.crawlTradingview(
      address,
      indicators,
      symbol,
      resolution,
      priceScale,
    );
  }
}
