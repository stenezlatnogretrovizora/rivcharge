import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  charger: {
    name: string;
    location: {
      city: string;
      country: string;
    };
  }
}

const ChargingSlotList = () => {
  const { data: session } = useSession();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/charging-slots');
        const fetchedSlots = await response.json() as Slot[];

        // Categorize slots into previous and upcoming
        const now = new Date();
        const upcoming = fetchedSlots.filter(slot => new Date(slot.startTime) >= now).reverse();
        const previous = fetchedSlots.filter(slot => new Date(slot.endTime) < now);

        // Merge and set the slots for display in a single list
        setSlots([...upcoming, ...previous]);
      } catch (err) {
        console.error('Error fetching charging slots:', err);
        setError('Failed to load slots.');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      void fetchSlots();
    }
  }, [session]);

  if (!session) return <div>Loading...</div>;

  return (
    <div className="w-full h-1/4">
      {loading && <div>Loading slots...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {/* Scrollable list container */}
      <div className="w-full h-[75vh] overflow-y-auto">
        <ul className="space-y-4">
          {slots.map(slot => (
            <li
              key={slot.id}
              className={`p-4 rounded-md shadow-md bg-white`}
            >
              <div className="font-semibold">
                {slot.charger.location.city}, {slot.charger.location.country}
              </div>
              <div className="text-sm text-[#6A64F1]">{slot.charger.name}</div>
              <div>
                {format(new Date(slot.startTime), 'MMM dd, yyyy HH:mm')} -{' '}
                {format(new Date(slot.endTime), 'HH:mm')}
              </div>
              <div className={`text-sm ${new Date(slot.startTime) >= new Date() ? 'text-green-400' : 'text-red-400'}`}>
                {new Date(slot.startTime) >= new Date() ? 'Upcoming' : 'Previous'}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChargingSlotList;