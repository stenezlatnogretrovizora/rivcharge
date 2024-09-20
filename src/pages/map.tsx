import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useLocation } from "~/contexts/LocationContext";

interface Location {
  id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface Charger {
  id: string;
  name: string;
  colour: string;
  locationId: string;
}

const ChargingMap: React.FC = () => {
  const { location, chargingLocations } = useLocation();
  const [chargers, setChargers] = useState<Charger[]>([]);

  const fetchChargers = async (id: string) => {
    const response = await fetch('/api/chargers?locationId=' + id);
    const data = await response.json();

    setChargers(data)
  }


  const mapContainerStyle = {
    width: '100%',
    height: '600px'
  };

  return (
    <>
      <LoadScript googleMapsApiKey="" >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={{ lat: location.latitude, lng: location.longitude }}
          zoom={10}
        >
          {chargingLocations.map((location: Location) => (
            <Marker
              key={location.id}
              position={{ lat: location.latitude, lng: location.longitude }}
              onClick={() => fetchChargers(location.id)}
            />
          ))}
        </GoogleMap>
      </LoadScript>

      <div className="float-left clear-left justify-center mt-4">
        {chargers.map((charger) => (
          <div key={charger.id} className="bg-white rounded-md shadow-md p-2 m-2">
            <div className="text-sm text-[#6A64F1] font-medium">
              {charger.name}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ChargingMap;