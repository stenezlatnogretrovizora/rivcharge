import React, { useCallback, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useLocation } from "~/contexts/LocationContext";
import Image from "next/image";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

interface Charger {
  id: string;
  name: string;
}

interface Location {
  id: string;
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  location: { latitude: number; longitude: number };
  chargingLocations: Location[];
}

const mapContainerStyle = {
  width: '100%',
  height: '600px'
};

export function ChargingStations({ chargers }: { chargers: Charger[] }) {
  return (
    <div className="justify-center text-center mt-10">
      <h1 className="text-2xl font-semibold text-[#07074D]">Charging Stations</h1>
      <div className="flex flex-row items-center">
        {chargers.map((charger) => (
          <div key={charger.id} className='flex-col m-auto'>
            <div className="flex items-center justify-center bg-white p-5 m-3">
              <Image
                className="w-2/3 rounded-md shadow-lg"
                src="https://media.rivian.com/image/upload/v1696301490/rivian-com/experience/Experience_Charging_dm11nv.jpg"
                alt={charger.name}
                width={182}
                height={182}
              />
            </div>
            <div className="text-sm text-[#6A64F1]">{charger.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChargingMap() {
  const { location, chargingLocations } = useLocation() as LocationContextType;
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>();
  const [center, setCenter] = useState({ lat: location.latitude, lng: location.longitude });

  const fetchChargers = useCallback(async (id: string, marker: google.maps.MapMouseEvent) => {
    try {
      if (marker.latLng) {
        setCenter({
          lat: marker.latLng.lat(),
          lng: marker.latLng.lng()
        });
      }

      const response = await fetch(`/api/chargers?locationId=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chargers');
      }
      const data = await response.json() as Charger[];
      setChargers(data);
    } catch (error) {
      console.error('Error fetching chargers:', error);
    }
  }, []);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY ?? '',
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(new window.google.maps.LatLng(center.lat, center.lng));
    setMap(map);
  }, [center]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isLoaded) return <></>;

  return (
    <>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        onLoad={onLoad}
        onUnmount={onUnmount}
        zoom={6}
      >
        {chargingLocations.map((location: Location) => (
          <Marker
            key={location.id}
            position={{ lat: location.latitude, lng: location.longitude }}
            onClick={(e) => fetchChargers(location.id, e)}
          />
        ))}
      </GoogleMap>
      {chargers.length > 0 && <ChargingStations chargers={chargers}/>}
    </>
  );
}

export default ChargingMap;