// main.js and datafeed.js combined

// Datafeed implementation
const lastBarsCache = new Map();
const configurationData = {
	supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', '1M'],
};

let firstCall = {};

const urlParams = new URLSearchParams(window.location.search);
const tokenName = (urlParams.get('name') || "") + "/USD";
const tokenAddress = urlParams.get('address') || "";
const resolution = urlParams.get('resolution') || "15";
const priceScale = Number(urlParams.get('pricescale') || 100000);
console.log("🚀 ~ priceScale:", priceScale)
// response = await axios.get('/crawl/data_chart?resolution='+resolution + "&address="+tokenAddress, {
// 	headers: {
// 		'accept': '*/*'
// 	}
// });
// // console.log("🚀 ~ getBars: ~ response:", response.data)
// let bars = response.data
const Datafeed = {
	onReady: (callback) => {
		// console.log('[onReady]: Method call');
		setTimeout(() => callback(configurationData));
	},

	resolveSymbol: async (
		symbolName,
		onSymbolResolvedCallback,
		onResolveErrorCallback,
		extension
	) => {
		// console.log('[resolveSymbol]: Method call', symbolName);
		
		const symbolInfo = {
			ticker: tokenName,
			// name: tokenName,
			session: '24x7',
			minmov: 1,
			pricescale: priceScale,
			has_intraday: true,
			// has_no_volume: true,
			// has_weekly_and_monthly: true,
			volume_precision: 2,
			// data_status: 'streaming',
		}
		// console.log('[resolveSymbol]: Symbol resolved', symbolName);
		onSymbolResolvedCallback(symbolInfo);
	},

	getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
		// const { from, to, firstDataRequest } = periodParams;
		
		// console.log('[getBars]: Method calll', symbolInfo, resolution, from, to);

		let response
		try {
			response = await axios.get('/api/app/data_chart?resolution='+resolution + "&address="+tokenAddress, {
					headers: {
						'accept': '*/*'
					}
				});
			// console.log("🚀 ~ getBars: ~ response:", response.data)
			let bars = response.data
			// console.log("🚀 ~ bars ~ bars:", bars)
			if (!firstCall[resolution]){
				firstCall[resolution] = true;
				// console.log(bars);
				// console.log(`[getBars]: returned ${bars.length} bar(s)`);
				onHistoryCallback(bars, {
					noData: false,
				});
			} else {
				onHistoryCallback([], {
					noData: true,
				});
			}

			
		} catch (error) {
			// console.log('[getBars]: Get error', error);
			onHistoryCallback([], {
				noData: true,
			});
			// onErrorCallback(error);
		}
	},
};

window.tvWidget = new TradingView.widget({
	symbol: tokenName,             
	interval: resolution,          
	fullscreen: true,              
	container: 'tv_chart_container',
	datafeed: Datafeed,
	supported_resolutions: configurationData.supported_resolutions,
	enabled_features: ['study_templates'],
	library_path: '../charting_library_cloned_data/charting_library/',
	theme: "dark",
});

// window.tvWidget.activeChart().createStudy("MACD", false, false, [])
// async function saveChartToPNG() {
// 	const screenshotCanvas = await window.tvWidget.takeClientScreenshot();
// 	console.log("🚀 ~ saveChartToPNG ~ screenshotCanvas:", screenshotCanvas.toDataURL())
// 	return screenshotCanvas.toDataURL();
//   }


