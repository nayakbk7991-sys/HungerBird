import React from "react";
import { MapContainer, TileLayer, CircleMarker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [20.5937, 78.9629];

const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(event) {
      onLocationSelect({
        lat: Number(event.latlng.lat.toFixed(6)),
        lng: Number(event.latlng.lng.toFixed(6))
      });
    }
  });

  return null;
};

const LocationPickerMap = ({ location, onLocationSelect }) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-300">
      <MapContainer
        center={
          location
            ? [location.lat, location.lng]
            : DEFAULT_CENTER
        }
        zoom={location ? 15 : 5}
        scrollWheelZoom={true}
        style={{ height: "350px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onLocationSelect={onLocationSelect} />

        {location && (
          <CircleMarker
            center={[location.lat, location.lng]}
            radius={9}
            pathOptions={{
              color: "#c2410c",
              fillColor: "#f97316",
              fillOpacity: 0.9
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default LocationPickerMap;