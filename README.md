# TradingView Capture

## Description

TradingView Capture is a powerful tool designed to automate the process of capturing TradingView charts with custom indicators for specific cryptocurrency contracts. This project utilizes Puppeteer to interact with a locally cloned TradingView interface, fetches price data from Birdeye, and generates customized chart screenshots.

## Features

- Automated chart capture from a locally cloned TradingView interface
- Integration with Birdeye API for real-time price data
- Support for custom indicators and timeframes
- Configurable chart settings and layouts
- High-quality screenshot generation

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/tradingview-capture.git
   ```

2. Navigate to the project directory:
   ```
   cd tradingview-capture
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Set up your Birdeye API key:
   - Create a `.env` file in the root directory
   - Add your Birdeye API key to the `.env` file:
     ```
     BIRDEYE_API_KEY=your_api_key_here
     ```

## Usage

1. Start the application:
   ```
   npm run start:dev
   ```

2. Send a request to the API with the following parameters:
   - Contract address
   - Desired indicators
   - Timeframe
   - Any additional chart settings

3. The application will:
   - Fetch price data from Birdeye for the specified contract
   - Load the data into the local TradingView clone
   - Apply the requested indicators and settings
   - Capture a screenshot of the resulting chart

4. Retrieve the generated chart image from the specified output directory

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

- [Puppeteer](https://pptr.dev/)
- [TradingView](https://www.tradingview.com/)
- [Birdeye](https://birdeye.so/)
- [NestJS](https://nestjs.com/)


