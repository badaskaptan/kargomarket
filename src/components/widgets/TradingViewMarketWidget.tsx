// TradingView Market Widget - Kargo/Nakliye Sektörü için özelleştirilmiş
import React, { useEffect, useRef, memo } from 'react';

function TradingViewMarketWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    // Clear any existing content
    container.current.innerHTML = '';
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "colorTheme": "light",
        "locale": "tr",
        "largeChartUrl": "",
        "isTransparent": false,
        "showSymbolLogo": true,
        "backgroundColor": "#ffffff",
        "support_host": "https://www.tradingview.com",
        "width": "100%",
        "height": 600,
        "symbolsGroups": [
          {
            "name": "Döviz Kurları",
            "symbols": [
              {
                "name": "FX_IDC:USDTRY",
                "displayName": "USD/TRY"
              },
              {
                "name": "FX_IDC:EURTRY", 
                "displayName": "EUR/TRY"
              },
              {
                "name": "FX_IDC:EURUSD",
                "displayName": "EUR/USD"
              },
              {
                "name": "FX_IDC:GBPUSD",
                "displayName": "GBP/USD"
              }
            ]
          },
          {
            "name": "Emtialar & Enerji",
            "symbols": [
              {
                "name": "TVC:GOLD",
                "displayName": "Altın (Ons)"
              },
              {
                "name": "TVC:USOIL",
                "displayName": "Brent Petrol"
              },
              {
                "name": "TVC:SILVER",
                "displayName": "Gümüş"
              },
              {
                "name": "ECONOMICS:USGDP",
                "displayName": "ABD GSYİH"
              }
            ]
          },
          {
            "name": "Nakliye Şirketleri",
            "symbols": [
              {
                "name": "NYSE:FDX",
                "displayName": "FedEx"
              },
              {
                "name": "NYSE:UPS",
                "displayName": "UPS"
              },
              {
                "name": "BIST:THYAO",
                "displayName": "Türk Hava Yolları"
              },
              {
                "name": "NASDAQ:AMZN",
                "displayName": "Amazon"
              }
            ]
          },
          {
            "name": "Endeksler & Futures",
            "symbols": [
              {
                "name": "CME_MINI:ES1!",
                "displayName": "S&P 500 Futures"
              },
              {
                "name": "CME:6E1!",
                "displayName": "Euro Futures"
              },
              {
                "name": "TVC:SPX",
                "displayName": "S&P 500 Index"
              },
              {
                "name": "TVC:DXY",
                "displayName": "Dolar Endeksi"
              }
            ]
          },
          {
            "name": "Tarım Ürünleri",
            "symbols": [
              {
                "name": "CBOT:ZC1!",
                "displayName": "Mısır Futures"
              },
              {
                "name": "CBOT:ZS1!",
                "displayName": "Soya Fasulyesi"
              },
              {
                "name": "CBOT:ZW1!",
                "displayName": "Buğday"
              },
              {
                "name": "NYMEX:CL1!",
                "displayName": "WTI Ham Petrol"
              }
            ]
          }
        ]
      }`;
    container.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container w-full" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright text-xs text-gray-500 mt-2">
        <a 
          href="https://www.tradingview.com/" 
          rel="noopener nofollow" 
          target="_blank"
          className="text-blue-600 hover:text-blue-800"
        >
          Market verileri TradingView tarafından sağlanmaktadır
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewMarketWidget);
