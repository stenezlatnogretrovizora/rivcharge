import { FormEvent, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format, isToday, startOfToday } from "date-fns";
import { Session } from "next-auth";
import { useLocation } from "~/contexts/LocationContext";

type SelectedRange = {
  start: Date | string,
  end: Date | string
}

const BookingSlotForm = ({ selectedRange }: { selectedRange: SelectedRange }) => {
  const session = useSession().data as Session;
  const [locationId, setLocationId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [bookingStatus, setBookingStatus] = useState('');
  const { getClosestLocation, chargingLocations } = useLocation();
  const closestLocation = getClosestLocation();
  const [name, email] = [session?.user?.name || '', session?.user?.email || '']

  const isStartDayToday = isToday(new Date(startDate));
  const minStartTime = isStartDayToday ? format(new Date(), 'HH:mm') : '00:00';

  useEffect(() => {
    setStartDate(format(selectedRange.start, 'yyyy-MM-dd'));
    setStartTime(format(selectedRange.start, 'HH:mm'));
    setEndDate(format(selectedRange.end, 'yyyy-MM-dd'));
    setEndTime(format(selectedRange.end, 'HH:mm'));
  }, [selectedRange]);

  useEffect(() => {
    if (!closestLocation) return;
    setLocationId(closestLocation.id);
  }, []);

  useEffect(() => {
    const isValid = !!name && !!email && !!locationId && !!startDate && !!startTime && !!endDate && !!endTime;
    setIsFormValid(isValid);
  }, [name, email, locationId, startDate, startTime, endDate, endTime]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    const bookingDetails = {
      email,
      name,
      startDate,
      startTime,
      endDate,
      endTime,
      locationId,
    };

    try {
      const response = await fetch('/api/charging-slots/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingDetails),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.queueEntry) {
          setBookingStatus('All slots are full. You have been added to the queue.');
        } else {
          setBookingStatus('Booking successful!');
        }
      } else {
        setBookingStatus('Failed to book the slot. Please try again later.');
      }
    } catch (error) {
      setBookingStatus('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="flex items-center justify-center p-12">
      <div className="mx-auto w-full max-w-[550px] bg-white p-8 rounded-md shadow-lg">
        <form onSubmit={handleSubmit}>
          <h2 className="mb-8 text-2xl font-semibold text-[#07074D]">Request a Charging Slot</h2>
          <div className="mb-5">
            <label className="mb-3 block text-base font-medium text-[#07074D]">Name</label>
            <input
              value={name}
              disabled
              className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none"
            />
          </div>
          <div className="mb-5">
            <label className="mb-3 block text-base font-medium text-[#07074D]">Location</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
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
                  min={format(startOfToday(), 'yyyy-MM-dd')}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
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
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
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
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
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
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full rounded-md py-3 px-8 text-center text-base font-semibold text-white outline-none transition-all duration-300
                ${isFormValid ? 'bg-[#6A64F1] hover:bg-[#5a55e1] hover:shadow-form' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Book Charge
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