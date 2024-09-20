import { useSession } from 'next-auth/react';
import { useLocation } from "~/contexts/LocationContext";

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
    <div className="flex flex-1 flex-col items-center justify-center min-h-screen">
      <div className="max-w-sm bg-white rounded-md shadow-md">
        <div className="flex flex-col items-center p-8">
          <img
            className="mb-3 w-24 h-24 rounded-full shadow-lg"
            src={user?.image || '/default-profile.png'}
            alt={user?.name || "user name"}
          />
          <h1 className="text-xl font-medium text-gray-800">{user?.name}</h1>
          <p className="text-sm text-gray-600">{user?.email}</p>
          <div className="text-sm text-[#6A64F1] font-medium">
            Location: {closestLocation?.city}, {closestLocation?.country}
          </div>
        </div>
      </div>
    </div>
  );
}

