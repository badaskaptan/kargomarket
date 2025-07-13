import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { DivIcon } from 'leaflet';
import styles from './LiveMap.module.css';
// Leaflet default icon fix
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});
const LiveMap = ({ coordinates, height = "200px", className = "", onClick }) => {
    const center = coordinates.length > 0 ? [coordinates[0].lat, coordinates[0].lng] : [39.0, 35.0];
    const clickable = typeof onClick === 'function';
    const getUserTypeBadge = (type) => {
        switch (type) {
            case 'buyer': return { label: 'A', color: '#3b82f6' };
            case 'seller': return { label: 'S', color: '#22c55e' };
            case 'carrier': return { label: 'N', color: '#f59e42' };
            default: return { label: '?', color: '#6b7280' };
        }
    };
    const createUserIcon = (avatar, type, name) => {
        const badge = getUserTypeBadge(type);
        const html = `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:48px;height:48px;">
        <img src='${avatar || 'https://ui-avatars.com/api/?name=' + (name || 'Kullanıcı') + '&background=cccccc&color=444444&size=48'}' alt='avatar' style='width:40px;height:40px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 8px #0002;object-fit:cover;background:#fff;' />
        <span style='position:absolute;bottom:-2px;right:-2px;width:20px;height:20px;border-radius:50%;background:${badge.color};color:#fff;font-size:12px;font-weight:bold;display:flex;align-items:center;justify-content:center;border:2px solid #fff;'>${badge.label}</span>
      </div>
    `;
        return new DivIcon({
            html,
            className: '',
            iconSize: [48, 48],
            iconAnchor: [24, 40],
            popupAnchor: [0, -40]
        });
    };
    return (_jsx("div", { className: `${className}${clickable ? ' live-map-clickable' : ''}`, onClick: onClick, ...(clickable ? { role: 'button', tabIndex: 0 } : {}), children: _jsxs(MapContainer, { center: center, zoom: 6, style: { width: '100%', height, borderRadius: 16, overflow: 'hidden' }, scrollWheelZoom: true, children: [_jsx(TileLayer, { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), coordinates.map((coord, idx) => (_jsx(Marker, { position: [coord.lat, coord.lng], icon: createUserIcon(coord.avatar, coord.type, coord.name), children: _jsx(Popup, { children: _jsxs("div", { className: styles.liveMapPopup, children: [_jsxs("div", { className: styles.liveMapPopupHeader, children: [_jsx("img", { src: coord.avatar || `https://ui-avatars.com/api/?name=${coord.name || 'Kullanıcı'}`, alt: "avatar", className: styles.liveMapPopupAvatar }), _jsxs("div", { children: [_jsx("span", { className: styles.liveMapPopupName, children: coord.name || 'Kullanıcı' }), _jsx("br", {}), _jsx("span", { className: styles.liveMapPopupType, children: coord.type })] })] }), _jsxs("div", { children: [_jsx("strong", { children: "Konum" }), _jsx("br", {}), coord.lat, ", ", coord.lng] })] }) }) }, idx)))] }) }));
};
export default LiveMap;
