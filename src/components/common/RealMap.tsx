import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import styles from './RealMap.module.css';
import './RealMap.wrapper.css';

// Varsayılan marker ikonunu düzelt
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Leaflet default icon fix
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Coordinate {
  lat: number;
  lng: number;
  name?: string;
  type?: string;
  title?: string;
}

interface RealMapProps {
  coordinates: Coordinate[];
  height?: string;
}

const RealMap: React.FC<RealMapProps> = ({ coordinates, height = '400px' }) => {
  const center = coordinates.length > 0 ? [coordinates[0].lat, coordinates[0].lng] : [39.0, 35.0];
  // CSS değişkenini root'a set et
  React.useEffect(() => {
    const wrapper = document.querySelector('.realMapWrapper') as HTMLElement;
    if (wrapper) wrapper.style.setProperty('--real-map-height', height);
  }, [height]);
  return (
    <div className={`realMapWrapper`}>
      <MapContainer center={center as [number, number]} zoom={6} className={styles.realMapContainer} scrollWheelZoom={true}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {coordinates.map((coord, idx) => (
          <Marker key={idx} position={[coord.lat, coord.lng]}>
            <Popup>
              <div>
                <strong>{coord.name || 'Konum'}</strong><br />
                {coord.title && <span>{coord.title}</span>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default RealMap;
