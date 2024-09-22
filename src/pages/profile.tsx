import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useLocation } from "~/contexts/LocationContext";
import Map from "~/components/Map";
import ChargingSlotList from "~/components/ChargingSlotsList";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { getClosestLocation } = useLocation();
  const loading = status === 'loading';

  const closestLocation = getClosestLocation();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>Access Denied</p>;
  }

  const { user } = session;
  return (
    <>
      <div className="flex items-center justify-center w-1/4 min-h-screen">
        <div className="max-w-sm bg-white rounded-md shadow-md">
          <div className="flex flex-col items-center p-8">
            <Image
              className="mb-3 w-24 h-24 rounded-md shadow-lg"
              src={user?.image ?? '/default-profile.png'}
              alt={user?.name ?? "user name"}
              width={96}
              height={96}
            />
            <h1 className="text-xl font-medium text-gray-800">{user?.name}</h1>
            <p className="text-sm text-gray-600">{user?.email}</p>
            <div className="text-sm text-[#6A64F1] font-medium">
              Office: {closestLocation?.city}, {closestLocation?.country}
            </div>
            <div className="mt-10">
              <ChargingSlotList />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-screen">
        <Map/>
      </div>
    </>
  );
}

