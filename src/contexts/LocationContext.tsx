import React, { createContext, useContext, useEffect, useState } from 'react';
import { getChargingLocations } from "~/utils/locationUtils";
import type { Location, LocationContextType } from "~/types/locations";

const LocationContext = createContext<LocationContextType>({
  location: { latitude: 0, longitude: 0 },
  chargingLocations: [],
  getClosestLocation: (): Location | null => { return null; }
});

export const LocationProvider = ({ children }: React.PropsWithChildren) => {
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [chargingLocations, setChargingLocations] = useState([] as Location[]);

  function getClosestLocation () {
    if (!chargingLocations.length) {
      return null;
    }

    if (!chargingLocations[0]) {
      return null;
    }

    return chargingLocations[0];
  }

  useEffect(() => {
    if (location.latitude === 0 && location.longitude === 0) {
      return;
    }

    getChargingLocations(location.latitude, location.longitude).then((charging) => {
      setChargingLocations(charging);
    })
    .catch((error) => {
      console.error('Error getting charging locations:', error);
    })
  }, [location]);


  useEffect(() => {
    const geo = navigator.geolocation;
    if (geo) {
      geo.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          // Only update the location if it has changed
          if (
            newLocation.latitude !== location.latitude ||
            newLocation.longitude !== location.longitude
          ) {
            setLocation(newLocation);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, [location]);


  return (
    <LocationContext.Provider value={{ location, chargingLocations, getClosestLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === null) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
