"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  proxies: any[];
  nodes: any[];
}

// Auto-center component
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function SatelliteMap({ proxies, nodes }: MapProps) {
  const center: [number, number] = proxies.length > 0 
    ? [proxies[0].lat, proxies[0].lng] 
    : [20, 0];

  return (
    <MapContainer 
      center={center} 
      zoom={3} 
      scrollWheelZoom={true} 
      className="w-full h-full z-10"
      style={{ background: '#020617' }}
    >
      <ChangeView center={center} />
      
      {/* Esri World Imagery Satellite Tiles */}
      <TileLayer
        attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />

      {/* Tracked Proxies */}
      {proxies.map((proxy, idx) => (
        <Marker 
          key={`proxy-${idx}`} 
          position={[proxy.lat, proxy.lng]}
          icon={L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #06b6d4; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 15px #06b6d4; border: 2px solid white;" class="animate-pulse"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
          })}
        >
          <Popup className="custom-popup">
            <div className="text-xs p-1">
              <div className="font-bold text-neutral-900">{proxy.ip}</div>
              <div className="text-neutral-500">{proxy.city}, {proxy.country}</div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Network Nodes */}
      {nodes.map((node, idx) => (
        <Marker 
          key={`node-${idx}`} 
          position={[node.lat, node.lng]}
          icon={L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #10b981; width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 10px #10b981; border: 1px solid white;"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5]
          })}
        >
          <Popup>
            <div className="text-xs p-1">
              <div className="font-bold text-neutral-900">{node.id}</div>
              <div className="text-neutral-500">{node.location}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
