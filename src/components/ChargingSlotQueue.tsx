import { FormEvent, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format, isToday, startOfToday } from "date-fns";
import { Session } from "next-auth";

const ChargingSlotQueue = ({ selectedDate }: { selectedDate: Date | string }) => {
  const session  = useSession().data as Session & { user: { id: string, name: string, email: string } };
  const [location, setLocation] = useState('Office Base');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(''); // State to store the booking status message
  const isCurrentDayToday = isToday(new Date(date));

  const name = session?.user?.name || '';
  const email = session?.user?.email || '';

  const minTime = isCurrentDayToday ? format(new Date(), 'HH:mm') : '00:00';

  useEffect(() => {
    setDate(format(selectedDate, 'yyyy-MM-dd'));
    setTime(format(selectedDate, 'HH:mm'));
  }, [selectedDate]);

  useEffect(() => {
    const isValid = (!!name && !!email && !!location && !!date && !!time);
    setIsFormValid(isValid);
  }, [name, email, location, date, time]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid) {
      console.error('Form is not valid');
      return;
    }

    const bookingDetails = {
      userId: session?.user?.id as string,
      chargingSlotId: `${location}-${date}-${time}`,
      date,
      location,
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
      console.error('An error occurred:', error);
      setBookingStatus('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="flex items-center justify-center p-12">
      <div className="mx-auto w-full max-w-[550px] bg-white p-8 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <h2 className="mb-8 text-2xl font-semibold text-[#07074D]">
            Request a Charging Slot
          </h2>
          <div className="mb-5">
            <label className="mb-3 block text-base font-medium text-[#07074D]">
              Name
            </label>
            <input
              value={name}
              disabled
              className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none"
            />
          </div>
          <div className="mb-5">
            <label className="mb-3 block text-base font-medium text-[#07074D]">
              Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
            >
              <option value="Office Base">Belgrade (office)</option>
              <option value="Location 1">Location 1</option>
              <option value="Location 2">Location 2</option>
              <option value="Location 3">Location 3</option>
            </select>
          </div>

          <div className="-mx-3 flex flex-wrap">
            <div className="w-full px-3 sm:w-1/2">
              <div className="mb-5">
                <label className="mb-3 block text-base font-medium text-[#07074D]">
                  Date
                </label>
                <input
                  type="date"
                  min={format(startOfToday(), 'yyyy-MM-dd')}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>
            </div>

            <div className="w-full px-3 sm:w-1/2">
              <div className="mb-5">
                <label className="mb-3 block text-base font-medium text-[#07074D]">
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  min={minTime}
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

export default ChargingSlotQueue;
