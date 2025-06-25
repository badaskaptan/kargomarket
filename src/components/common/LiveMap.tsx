import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface Coordinate {
  lat: number;
  lng: number;
}

interface LiveMapProps {
  coordinates: Coordinate[];
  height?: string;
  showRoute?: boolean;
  onClick?: () => void;
  className?: string;
}

const LiveMap: React.FC<LiveMapProps> = ({ 
  coordinates, 
  height = "200px", 
  showRoute = false, 
  onClick,
  className = ""
}) => {
  // Bu gerçek bir harita implementasyonu değil, demo amaçlı bir görsel
  // Gerçek projede Google Maps, Mapbox veya OpenStreetMap kullanılabilir
  
  return (
    <div 
      className={`relative bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden ${className}`}
      style={{ height }}
      onClick={onClick}
    >
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#3B82F6" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Route Line */}
      {showRoute && coordinates.length > 1 && (
        <svg className="absolute inset-0 w-full h-full">
          <path
            d={`M 20% 30% Q 50% 20% 80% 70%`}
            stroke="#EF4444"
            strokeWidth="3"
            fill="none"
            strokeDasharray="5,5"
            className="animate-pulse"
          />
        </svg>
      )}

      {/* Location Markers */}
      {coordinates.map((coord, index) => (
        <div
          key={index}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
            index === 0 ? 'text-green-600' : 'text-red-600'
          }`}
          style={{
            left: `${20 + (index * 60)}%`,
            top: `${30 + (index * 40)}%`
          }}
        >
          <div className="relative">
            <MapPin size={24} className="drop-shadow-lg" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
          </div>
        </div>
      ))}

      {/* Navigation Icon */}
      <div className="absolute top-2 right-2">
        <Navigation size={16} className="text-primary-600" />
      </div>

      {/* Click Overlay */}
      {onClick && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors">
          <div className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-gray-700 opacity-0 hover:opacity-100 transition-opacity">
            Haritayı büyüt
          </div>
        </div>
      )}

      {/* Coordinates Info */}
      <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-xs text-gray-600">
        {coordinates.length} konum
      </div>
    </div>
  );
};

export default LiveMap;