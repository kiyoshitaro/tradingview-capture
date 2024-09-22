import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import axios from 'axios';
import UserAgent from 'user-agents';
import * as fs from 'fs/promises';
import * as path from 'path';
import { jsonrepair } from 'jsonrepair';
import puppeteer from 'puppeteer';

@Injectable()
export class AppService implements OnModuleInit {
  private browser: any;
  private headless: any = true;
  private protocolTimeout: any = 300000;
  private dom: any;
  private listResolution: any = ['5', '15', '30', '60', '1h', '4h', '1D', 'D'];
  private argsBrowser: any = [
    // '--incognito',
    '--no-sandbox',
    '--disable-gpu', // Disable GPU
    '--disable-extensions', // Disable extensions
    '--enable-devtools-experiments', // Enable DevTools Protocol experiments
    '--max-old-space-size=4096', // Limit memory usage to 4GB
    '--disable-web-security',
    '--disable-features=IsolateOrigins',
    '--disable-site-isolation-trials',
    '--disable-features=IsolateOrigins',
    '--disable-site-isolation-trials',
    '--disable-dev-shm-usage',
    '--disable-popup-blocking', // Disable popup blocking
    '--disable-infobars', // Hide infobar UI elements
    '--disable-renderer-backgrounding', // Disable renderer backgrounding
    '--disable-background-fetch', // Disable background fetch API
    '--disable-blink-features=FeatureName1,FeatureName2', // Disable specific Blink features
    '--disable-client-side-phishing-detection', // Disable client-side phishing detection
    '--disable-component-update', // Disable component updates
    '--disable-datasaver-prompt', // Disable data saver prompt
    '--disable-default-apps', // Disable installation of default web apps
    '--disable-embedded-media-router', // Disable embedded media router
    '--disable-encrypted-media-extensions',
    '--no-zygote',
    '--single-process',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--no-first-run',
    '--no-remote-debugging-port',
  ];

  async onModuleInit() {
    await this.openBrowser();
  }

  async openBrowser() {
    this.browser = await puppeteer.launch({
      headless: this.headless,
      protocolTimeout: this.protocolTimeout,
      args: this.argsBrowser,
    });
  }

  async checkReady(page: any): Promise<any> {
    return await page.evaluate(async () => {
      function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
      async function checkReady(onReady) {
        try {
          (document as any)
            .querySelector("iframe[title='Financial Chart']")
            .contentWindow.widgetReady(() => {
              onReady('okie');
            });
        } catch (error) {
          await sleep(100);
          await checkReady(onReady);
        }
      }
      async function waitReady() {
        return new Promise((resolve) => {
          checkReady(resolve);
        });
      }

      await waitReady();
      this.dom = (document as any).querySelector(
        "iframe[title='Financial Chart']",
      ).contentWindow.tradingViewApi;
    });
  }

  async getLengthChart(page: any): Promise<any> {
    return page.evaluate(async () => {
      async function checkLoading() {
        const objectsDataCache =
          await this.dom._chartApiInstance.studiesAccessController._studyEngine
            ._objectsDataCache;
        const cacheKeys = Object.keys(objectsDataCache);
        const firstCacheKey = cacheKeys[0];
        const arrayLength = Array.isArray(objectsDataCache[firstCacheKey])
          ? objectsDataCache[firstCacheKey].length
          : objectsDataCache[firstCacheKey];
        if (!arrayLength) {
          // await sleep(100);
          // return await checkLoading();
          return arrayLength;
        } else {
          return arrayLength;
        }
      }

      const arrayLength = await checkLoading();
      return arrayLength;
    });
  }

  async createStudy(
    page: any,
    indicators: any,
    GetLengthChart?: any,
  ): Promise<any> {
    await page.evaluate(
      async (indicators, GetLengthChart) => {
        await Promise.all(
          indicators.map(async (indicator) => {
            const { indicatorName, settings } = indicator;
            if (settings[0] < GetLengthChart || settings?.length === 0) {
              await this.dom
                .activeChart()
                .createStudy(indicatorName, false, false, settings);
              console.log(`Study created ${indicatorName}`);
            } else {
              console.log(`Study min length ${indicatorName}`);
            }
          }),
        );
      },
      indicators,
      GetLengthChart,
    );
  }

  async getDataImage(page: any): Promise<any> {
    return await page.evaluate(async () => {
      async function saveChartToPNG() {
        const screenshotCanvas = await this.dom.takeClientScreenshot();
        // const screenshotCanvas = await this.dom.takeScreenshot()
        return screenshotCanvas.toDataURL();
      }
      // Call the function to save the chart to PNG and return the result
      return await saveChartToPNG();
    });
  }

  private async saveBase64ToFile(
    base64Data: string,
    filePath: string,
  ): Promise<void> {
    const base64Image = base64Data.split(';base64,').pop();
    const imageBuffer = Buffer.from(base64Image, 'base64');
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, imageBuffer);
  }

  async crawlTradingview(
    address: string,
    indicatorsString: any = `[
                {
                    "indicatorName": "MACD",
                    "settings": [12, 26, "close", 9]
                },
                {
                    "indicatorName": "Moving Average Exponential",
                    "settings": [12, "close", 0, "SMA", 9]
                },
                {
                  "indicatorName": "Moving Average Exponential",
                  "settings": [21, "close", 0, "SMA", 9]
                },
                {
                    "indicatorName": "Relative Strength Index",
                    "settings": [14, "SMA", 14]
                }
              ]`,
    symbol: string = 'TOKEN',
    setResolution: string = '15',
    priceScale: string = '100000',
  ) {
    if (!address) {
      throw new BadRequestException('Address required');
    }
    const page = await this.browser.newPage();
    try {
      const indicators = JSON.parse(jsonrepair(indicatorsString));
      const startBrowser = Date.now();
      const resolution_key = {
        '1': '1',
        '5': '5',
        '15': '15',
        '30': '30',
        '60': '60',
        '1h': '60',
        '240': '4H',
        '4h': '4H',
        '1d': '1D',
      };
      const resolution = resolution_key[setResolution];
      try {
        page.setUserAgent(new UserAgent().toString());
        const dimensions = 1000;
        await page.setViewport({ width: dimensions, height: dimensions });
        const url = `http://localhost:8765?name=${symbol}&address=${address}&resolution=${resolution}&pricescale=${priceScale}`;
        console.log(url, 'ooo');
        await page.goto(url);
        console.log('🚀 ~ url:', url);
        page.on('console', (message) => {
          const type = message.type();
          if (type !== 'warn') {
            console.log(`🚀 ~ CrawlService ~ log: ${message.text()}`);
          }
        });
        // Check ready site
        await this.checkReady(page);
        // Set symbol
        const GetLengthChart = await this.getLengthChart(page);
        if (!GetLengthChart || GetLengthChart === 0) {
          await page.close();
          return new BadRequestException('Invalid chart');
        }
        await this.createStudy(page, indicators, GetLengthChart);
        // Get base64 image
        const resultBase64 = await this.getDataImage(page);
        const endGetBase64 = Date.now();
        // try {
        //   const fileName = `${symbol}_${Date.now()}.png`;
        //   const filePath = path.join(process.cwd(), 'uploads', fileName);
        //   await this.saveBase64ToFile(resultBase64, filePath);
        // } catch (error) {
        //   await page.close();
        //   return new BadRequestException(
        //     `Error when save image, ${error.message}`,
        //   );
        // }
        // const endUpload = Date.now();
        console.log(
          '🚀 ~ Time endGetBase64:',
          (endGetBase64 - startBrowser) / 1000,
        );
        await page.close();
        return resultBase64;
      } catch (error) {
        await page.close();
        return JSON.stringify({
          status: 400,
          message: error.message,
        });
      }
    } catch (error) {
      await page.close();
      throw new InternalServerErrorException(error.message);
    }
  }

  async getChartData(
    resolution: string,
    address: string,
  ): Promise<
    {
      time: number;
      low: number;
      high: number;
      open: number;
      close: number;
      volume: number;
    }[]
  > {
    const currentTimeMilliseconds = Date.now();
    const resolution_key = {
      '1': '1m',
      '5': '5m',
      '15': '15m',
      '30': '30m',
      '60': '1H',
      '4h': '4H',
      '1d': '1D',
    };
    const resolution_time = {
      '1': 1,
      '5': 5,
      '15': 15,
      '30': 30,
      '60': 60,
      '4h': 240,
      '1d': 24 * 60,
    };
    if (!address) {
      throw new BadRequestException('Token address not found');
    }
    // Convert milliseconds to seconds
    const timeTo = Math.floor(currentTimeMilliseconds / 1000);
    const timeFrom = timeTo - resolution_time[resolution] * 200 * 60;
    try {
      const response = await axios.get(
        'https://public-api.birdeye.so/defi/ohlcv',
        {
          params: {
            address: address,
            type: resolution_key[resolution] || '15m',
            time_from: timeFrom,
            time_to: timeTo,
          },
          headers: {
            accept: 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9',
            // 'origin': 'https://raydium.io',
            priority: 'u=1, i',
            referer: 'https://raydium.io/',
            'sec-ch-ua':
              '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': new UserAgent().toString(),
            'x-api-key': String(process.env.BIRDEYE_API_KEY),
            'x-chain': 'solana',
          },
        },
      );

      const bars = response.data.data.items.map((item) => ({
        time: item.unixTime * 1000, // convert to milliseconds
        low: item.l,
        high: item.h,
        open: item.o,
        close: item.c,
        volume: item.v,
      }));
      return bars;
    } catch (error) {
      let errorMessage = 'An error occurred while fetching chart data: ';
      if (axios.isAxiosError(error)) {
        errorMessage += error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage += error.message;
      }
      console.error(errorMessage);
      throw new BadRequestException(errorMessage);
    }
  }
}
