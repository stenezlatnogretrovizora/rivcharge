import { type FormEvent, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { format, isToday, startOfToday } from "date-fns";
import { useLocation } from "~/contexts/LocationContext";
import { type BookingDetails, BookingDetailsSchema, type SelectedSlot } from "~/types/slots";

const BookingSlotForm = ({ selectedSlot }: { selectedSlot: SelectedSlot }) => {
  const [loading, setLoading] = useState(false);
  const session = useSession().data!;
  const initialBookingDetails = {
    email: session?.user?.email ?? '',
    name: session?.user?.name ?? '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    locationId: '',
    resourceId: '',
    eventId: null,
  };
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>(initialBookingDetails);
  const [isFormValid, setIsFormValid] = useState(false);
  const [bookingStatus, setBookingStatus] = useState('');
  const { getClosestLocation, chargingLocations } = useLocation();
  const closestLocation = getClosestLocation();

  const isStartDayToday = isToday(new Date(bookingDetails.startDate));
  const minStartTime = isStartDayToday ? format(new Date(), 'HH:mm') : '00:00';
  useEffect(() => {
    setBookingDetails(prev => ({
      ...prev,
      startDate: format(selectedSlot.start, 'yyyy-MM-dd'),
      startTime: format(selectedSlot.start, 'HH:mm'),
      endDate: format(selectedSlot.end, 'yyyy-MM-dd'),
      endTime: format(selectedSlot.end, 'HH:mm'),
      resourceId: selectedSlot.resourceId,
      eventId: selectedSlot.eventId
    }));
  }, [selectedSlot]);

  useEffect(() => {
    if (!closestLocation) return;
    setBookingDetails(prev => ({ ...prev, locationId: closestLocation.id }));
  }, [closestLocation]);

  useEffect(() => {
    let isValid = BookingDetailsSchema.safeParse(bookingDetails).success;

    if (isValid) {
      const startDate = new Date(`${bookingDetails.startDate}T${bookingDetails.startTime}`);
      const endDate = new Date(`${bookingDetails.endDate}T${bookingDetails.endTime}`);
      isValid = startDate < endDate;
    }

    // check if the selected slot is before the current time
    if (isValid) {
      isValid = selectedSlot.start > new Date();
    }

    setIsFormValid(isValid);
  }, [bookingDetails, selectedSlot.start]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/charging-slots', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: selectedSlot.eventId }),
      });

      if (response.ok) {
        setBookingStatus('Slot deleted successfully');
        setIsFormValid(false);
        setBookingDetails(initialBookingDetails)
      } else {
        setBookingStatus('Failed to delete slot');
      }
    } catch (error) {
      console.error('Failed to delete slot', error);
      setBookingStatus('Failed to delete slot due to a network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!isFormValid) return;

    try {
      const response = await fetch('/api/charging-slots', {
        method: bookingDetails.eventId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingDetails),
      });

      const data = await response.json() as { error?: string };

      setBookingStatus(response.ok ? 'Booking successful' : (data.error ?? 'Failed to book slot'));
    } catch (error) {
      console.error('Failed to book slot', error);
      setBookingStatus('Failed to book slot due to a network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center p-10 pt-0">
      <div className="mx-auto w-full max-w-[550px] bg-white p-8 rounded-md shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            {selectedSlot.canDelete ? (
              <div className="text-end">
                <button
                  type="button"
                  className="text-[red] text-sm font-medium"
                  onClick={handleDelete}
                >
                  Delete Slot
                </button>
              </div>
            ) : null}
            <label className="mb-3 block text-base font-medium text-[#07074D]">Name</label>
            <input
              name="name"
              value={bookingDetails.name}
              onChange={handleInputChange}
              disabled
              className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none"
            />
          </div>
          <div className="mb-5">
            <label className="mb-3 block text-base font-medium text-[#07074D]">Location</label>
            <select
              name="locationId"
              value={bookingDetails.locationId}
              onChange={handleInputChange}
              className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
            >
              {chargingLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.city}, {location.country}
                </option>
              ))}
            </select>
          </div>
          <div className="-mx-3 flex flex-wrap">
            <div className="w-full px-3 sm:w-1/2">
              <div className="mb-5">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  min={format(startOfToday(), 'yyyy-MM-dd')}
                  value={bookingDetails.startDate}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>
            </div>
            <div className="w-full px-3 sm:w-1/2">
              <div className="mb-5">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={bookingDetails.startTime}
                  onChange={handleInputChange}
                  min={minStartTime}
                  required
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>
            </div>
          </div>
          <div className="-mx-3 flex flex-wrap">
            <div className="w-full px-3 sm:w-1/2">
              <div className="mb-5">
                <label className="mb-3 block text-base font-medium text-[#07074D]">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={bookingDetails.endDate}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>
            </div>
            <div className="w-full px-3 sm:w-1/2">
              <div className="mb-5">
                <label className="mb-3 block text-base font-medium text-[#07074D]">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={bookingDetails.endTime}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full rounded-md py-3 px-8 text-center text-base font-semibold text-white outline-none transition-all duration-300
                         ${isFormValid && !loading ? 'bg-[#6A64F1] hover:bg-[#5a55e1] hover:shadow-form' : 'bg-gray-400 cursor-not-allowed'}`}>
              {loading ? 'Booking...' : 'Book Charge'}
            </button>

          </div>
          {bookingStatus && (
            <div className="mt-4 text-center text-base font-medium text-[#07074D]">
              {bookingStatus}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookingSlotForm;
