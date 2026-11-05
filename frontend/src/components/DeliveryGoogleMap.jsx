
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import "./DeliveryGoogleMap.css";

function coordinates(value) {
  if (!value) return null;

  if (typeof value === "string") {
    const parts = value.split(",").map(Number);

    if (
      parts.length === 2 &&
      parts.every(Number.isFinite) &&
      Math.abs(parts[0]) <= 90 &&
      Math.abs(parts[1]) <= 180
    ) {
      return { lat: parts[0], lng: parts[1] };
    }

    return null;
  }

  if (Array.isArray(value)) {
    // GeoJSON coordinates are [longitude, latitude].
    if (
      value.length >= 2 &&
      Number.isFinite(Number(value[0])) &&
      Number.isFinite(Number(value[1]))
    ) {
      const lng = Number(value[0]);
      const lat = Number(value[1]);

      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        return { lat, lng };
      }
    }

    return null;
  }

  if (typeof value !== "object") return null;

  // Support common nested MongoDB location structures.
  if (value.coordinates) {
    const nested = coordinates(value.coordinates);
    if (nested) return nested;
  }

  if (value.location) {
    const nested = coordinates(value.location);
    if (nested) return nested;
  }

  const latValue = value.lat ?? value.latitude;
  const lngValue = value.lng ?? value.longitude;

  if (latValue == null || lngValue == null) return null;

  const lat = Number(latValue);
  const lng = Number(lngValue);

  if (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  ) {
    return { lat, lng };
  }

  return null;
}

function MapContent({
  pickupAddress,
  pickupLocation,
  customerAddress,
  customerLocation,
  orderStatus,
  destinationType,
}) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const geocodingLibrary = useMapsLibrary("geocoding");

  const [rider, setRider] = useState(null);
  const [pickup, setPickup] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [error, setError] = useState("");
  const [locationPermission, setLocationPermission] = useState("loading");
  const [mapLoaded, setMapLoaded] = useState(false);

  const status = String(orderStatus || "").toLowerCase();

  const customerStage = useMemo(() => {
    return (
      destinationType === "customer" ||
      status.includes("out for delivery") ||
      status.includes("picked up") ||
      status.includes("delivering") ||
      status.includes("delivered")
    );
  }, [destinationType, status]);

  const destination = customerStage ? customer : pickup;

  const destinationAddress = customerStage
    ? customerAddress
    : pickupAddress;

  const destinationTitle = customerStage
    ? "Customer delivery location"
    : "Restaurant pickup location";

  // Get the delivery partner's actual GPS position.
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationPermission("unsupported");
      setError("Your browser does not support GPS location services.");
      return;
    }

    setLocationPermission("requesting");

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setRider({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });

        setLocationPermission("granted");
        setError("");
      },
      (geoError) => {
        setLocationPermission("denied");

        if (geoError.code === 1) {
          setError(
            "Location permission is blocked. Allow location access in your browser to calculate your route from your current position."
          );
        } else if (geoError.code === 2) {
          setError("Your current GPS location is unavailable.");
        } else {
          setError(
            "Unable to get your GPS location. Check your device location settings."
          );
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 20000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Resolve saved coordinates first; geocode the address only if needed.
  useEffect(() => {
    if (!geocodingLibrary) return;

    let cancelled = false;

    async function resolveLocation(location, address) {
      const savedCoordinates = coordinates(location);

      if (savedCoordinates) return savedCoordinates;

      if (!address || typeof address !== "string") return null;

      const geocoder = new geocodingLibrary.Geocoder();

      const result = await geocoder.geocode({
        address,
      });

      const found = result.results?.[0]?.geometry?.location;

      if (!found) return null;

      return {
        lat: found.lat(),
        lng: found.lng(),
      };
    }

    async function loadLocations() {
      try {
        setError("");

        const [pickupPoint, customerPoint] = await Promise.all([
          resolveLocation(pickupLocation, pickupAddress),
          resolveLocation(customerLocation, customerAddress),
        ]);

        if (cancelled) return;

        setPickup(pickupPoint);
        setCustomer(customerPoint);

        if (!pickupPoint) {
          setError(
            "Restaurant location not found. Check the restaurant's saved address or coordinates."
          );
        } else if (!customerPoint) {
          setError(
            "Customer location not found. Check the customer's saved delivery address or coordinates."
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "Unable to locate the saved addresses. Check Google Maps Geocoding API access."
          );
        }
      }
    }

    loadLocations();

    return () => {
      cancelled = true;
    };
  }, [
    geocodingLibrary,
    pickupAddress,
    pickupLocation,
    customerAddress,
    customerLocation,
  ]);

  // Create restaurant and customer markers and adjust the map view.
  useEffect(() => {
    if (!map || !window.google?.maps) return;

    const markers = [];

    if (pickup) {
      markers.push(
        new google.maps.Marker({
          map,
          position: pickup,
          title: "Restaurant pickup",
          label: "P",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#15803d",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
        })
      );
    }

    if (customer) {
      markers.push(
        new google.maps.Marker({
          map,
          position: customer,
          title: "Customer delivery location",
          label: "D",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#c2410c",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
        })
      );
    }

    if (rider) {
      markers.push(
        new google.maps.Marker({
          map,
          position: rider,
          title: "Your current location",
          label: "R",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#1769ff",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
        })
      );
    }

    const points = [rider, pickup, customer].filter(Boolean);

    if (points.length > 1) {
      const bounds = new google.maps.LatLngBounds();

      points.forEach((point) => bounds.extend(point));

      map.fitBounds(bounds, 70);
    } else if (destination) {
      map.setCenter(destination);
      map.setZoom(15);
    } else if (rider) {
      map.setCenter(rider);
      map.setZoom(15);
    }

    setMapLoaded(true);

    return () => {
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [map, rider, pickup, customer, destination]);

  // Calculate the road route from the rider to the current destination.
  useEffect(() => {
    if (!map || !routesLibrary || !rider || !destination) {
      setRouteInfo(null);
      return;
    }

    let cancelled = false;

    const service = new routesLibrary.DirectionsService();

    const renderer = new routesLibrary.DirectionsRenderer({
      map,
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: {
        strokeColor: "#1677ff",
        strokeWeight: 6,
        strokeOpacity: 0.95,
      },
    });

    setRouteInfo(null);

    service
      .route({
        origin: rider,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      })
      .then((result) => {
        if (cancelled) return;

        renderer.setDirections(result);

        const leg = result.routes?.[0]?.legs?.[0];

        setRouteInfo({
          distance: leg?.distance?.text || "Unavailable",
          duration: leg?.duration?.text || "Unavailable",
        });

        setError("");
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "Unable to calculate the driving route. Check your GPS position and Google Maps Directions API access."
          );
        }
      });

    return () => {
      cancelled = true;
      renderer.setMap(null);
    };
  }, [map, routesLibrary, rider, destination]);

  const openNavigation = useCallback(() => {
    if (!destination) {
      setError("The destination coordinates are not available.");
      return;
    }

    const url = new URL("https://www.google.com/maps/dir/");

    url.searchParams.set("api", "1");

    if (rider) {
      url.searchParams.set(
        "origin",
        `${rider.lat},${rider.lng}`
      );
    }

    url.searchParams.set(
      "destination",
      `${destination.lat},${destination.lng}`
    );

    url.searchParams.set("travelmode", "driving");

    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }, [destination, rider]);

  const recenterMap = useCallback(() => {
    if (!map) return;

    if (rider) {
      map.panTo(rider);
      map.setZoom(16);
    } else if (destination) {
      map.panTo(destination);
      map.setZoom(15);
    }
  }, [map, rider, destination]);

  return (
    <div className="delivery-google-map">
      <div className="delivery-google-map-toolbar">
        <div className="delivery-map-heading-text">
          <span className="delivery-map-stage">
            {customerStage ? "DELIVERY DESTINATION" : "PICKUP DESTINATION"}
          </span>

          <strong>{destinationTitle}</strong>

          <p>
            {destinationAddress || "Using saved location coordinates"}
          </p>
        </div>

        <button
          type="button"
          className="delivery-map-navigation-button"
          onClick={openNavigation}
          disabled={!destination}
        >
          Start navigation
        </button>
      </div>

      <div className="delivery-map-route-summary">
        <div>
          <span>Distance</span>
          <strong>{routeInfo?.distance || "--"}</strong>
        </div>

        <div>
          <span>Estimated time</span>
          <strong>{routeInfo?.duration || "--"}</strong>
        </div>

        <div>
          <span>Your GPS</span>
          <strong>
            {locationPermission === "granted"
              ? "Connected"
              : locationPermission === "requesting" ||
                  locationPermission === "loading"
                ? "Locating..."
                : "Unavailable"}
          </strong>
        </div>
      </div>

      {error && (
        <div className="delivery-google-map-error" role="alert">
          {error}
        </div>
      )}

      <div className="delivery-google-map-container">
        <Map
          className="delivery-google-map-canvas"
          defaultCenter={{ lat: 18.5204, lng: 73.8567 }}
          defaultZoom={13}
          gestureHandling="greedy"
          fullscreenControl
          streetViewControl
          mapTypeControl
          zoomControl
        />

        <button
          type="button"
          className="delivery-map-recenter-button"
          onClick={recenterMap}
          disabled={!rider && !destination}
        >
          My location
        </button>
      </div>

      <div className="delivery-map-legend">
        <span>
          <i className="delivery-map-dot rider-dot" />
          Rider
        </span>

        <span>
          <i className="delivery-map-dot pickup-dot" />
          Restaurant
        </span>

        <span>
          <i className="delivery-map-dot customer-dot" />
          Customer
        </span>
      </div>

      {!mapLoaded && (
        <p className="delivery-map-loading">
          Loading Google Maps...
        </p>
      )}
    </div>
  );
}

export default function DeliveryGoogleMap(props) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="delivery-google-map-error">
        Google Maps API key is missing. Add VITE_GOOGLE_MAPS_API_KEY to
        frontend/.env and restart the Vite server.
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={apiKey}
      libraries={["routes", "geocoding"]}
    >
      <MapContent {...props} />
    </APIProvider>
  );
}
