import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
const RealMap = ({ coordinates, height = '400px' }) => {
    const center = coordinates.length > 0 ? [coordinates[0].lat, coordinates[0].lng] : [39.0, 35.0];
    // CSS değişkenini root'a set et
    React.useEffect(() => {
        const wrapper = document.querySelector('.realMapWrapper');
        if (wrapper)
            wrapper.style.setProperty('--real-map-height', height);
    }, [height]);
    return (_jsx("div", { className: `realMapWrapper`, children: _jsxs(MapContainer, { center: center, zoom: 6, className: styles.realMapContainer, scrollWheelZoom: true, children: [_jsx(TileLayer, { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), coordinates.map((coord, idx) => (_jsx(Marker, { position: [coord.lat, coord.lng], children: _jsx(Popup, { children: _jsxs("div", { children: [_jsx("strong", { children: coord.name || 'Konum' }), _jsx("br", {}), coord.title && _jsx("span", { children: coord.title })] }) }) }, idx)))] }) }));
};
export default RealMap;
