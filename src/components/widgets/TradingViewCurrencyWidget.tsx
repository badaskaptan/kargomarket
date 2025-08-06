// Mini TradingView Currency Widget - Döviz kurları için kompakt widget
import React, { useEffect, useRef, memo } from 'react';

function TradingViewCurrencyWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    // Önceki içeriği temizle
    container.current.innerHTML = '';
    
    // Widget container oluştur
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";
    container.current.appendChild(widgetContainer);
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "symbols": [
          {
            "proName": "FX_IDC:USDTRY",
            "title": "USD/TRY"
          },
          {
            "proName": "FX_IDC:EURTRY",
            "title": "EUR/TRY"
          },
          {
            "proName": "CME_MINI:ES1!",
            "title": "S&P 500"
          },
          {
            "proName": "TVC:GOLD",
            "title": "Altın"
          },
          {
            "proName": "NYMEX:CL1!",
            "title": "WTI Petrol"
          },
          {
            "proName": "CBOT:ZC1!",
            "title": "Mısır"
          },
          {
            "proName": "NYSE:FDX",
            "title": "FedEx"
          }
        ],
        "showSymbolLogo": true,
        "colorTheme": "light",
        "isTransparent": false,
        "displayMode": "adaptive",
        "locale": "tr"
      }`;
    container.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(TradingViewCurrencyWidget);
