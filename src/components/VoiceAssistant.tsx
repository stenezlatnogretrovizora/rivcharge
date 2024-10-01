/* eslint-disable */

import { useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { addHours, format } from 'date-fns';
import { useLocation } from '~/contexts/LocationContext';
import { useChargingData } from "~/hooks/useChargingData";

interface VoiceAssistantProps {
  onBookingRequest: (bookingDetails: any) => void;
}

export default function VoiceAssistant({ onBookingRequest }: VoiceAssistantProps) {
  const { chargers, bookedSlots } = useChargingData();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const { data: session } = useSession();
  const { getClosestLocation } = useLocation();

  const availableChargerIds = chargers.map(charger => {
    return bookedSlots.some(slot => slot.resourceId === charger.id) ? null : charger.id;
  }).filter(id => id !== null);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await processAudio(audioBlob);
      };

      mediaRecorder.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopListening = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsListening(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    // Send audio to Whisper API for transcription
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');

    try {
      const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: formData,
      });

      const whisperData = await whisperResponse.json() as { text: string };
      setTranscript(whisperData.text);

      // Process the transcript with OpenAI's function calling
      await processTranscript(whisperData.text);
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  };

  const processTranscript = async (text: string) => {
    try {
      const closestLocation = getClosestLocation();
      const closestLocationString = closestLocation?.country ? `${closestLocation.city}, ${closestLocation.country}` : 'unknown location';
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{
            role: 'system',
            content: `Today is ${new Date().toUTCString()}, and we're in ${closestLocationString}`
          }, { role: 'user', content: text }],
          functions: [
            {
              name: 'book_charging_slot',
              description: 'Book a charging slot for an electric vehicle',
              parameters: {
                type: 'object',
                properties: {
                  start_date: { type: 'string', description: 'Start date of the booking (YYYY-MM-DD)' },
                  start_time: { type: 'string', description: 'Start time of the booking (HH:MM)' },
                  duration: { type: 'number', description: 'Duration of the booking in hours' },
                },
                required: ['start_date', 'start_time', 'duration'],
              },
            },
          ],
          function_call: 'auto',
        }),
      });
      const openaiData = await openaiResponse.json();
      const functionCall = openaiData.choices[0].message.function_call;

      if (functionCall && functionCall.name === 'book_charging_slot') {
        const { start_date, start_time, duration } = JSON.parse(functionCall.arguments);
        const startDateTime = new Date(`${start_date}T${start_time}`);
        const endDateTime = addHours(startDateTime, duration);
        const closestLocation = getClosestLocation();

        const bookingDetails = {
          email: session?.user?.email || '',
          name: session?.user?.name || '',
          startDate: format(startDateTime, 'yyyy-MM-dd'),
          startTime: format(startDateTime, 'HH:mm'),
          endDate: format(endDateTime, 'yyyy-MM-dd'),
          endTime: format(endDateTime, 'HH:mm'),
          locationId: closestLocation?.id || '',
          resourceId: availableChargerIds[0], // This will be determined by the server
          eventId: null
        };

        try {
          const response = await fetch('/api/charging-slots', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingDetails),
          });

          if (response.ok) {
            const data = await response.json();
            onBookingRequest(data.slot);
            setResponse(`Booking confirmed for ${start_date} at ${start_time} for ${duration} hours.`);
          } else {
            const errorData = await response.json();
            setResponse(`Booking failed: ${errorData.error}`);
          }
        } catch (error) {
          console.error('Error booking slot:', error);
          setResponse("An error occurred while booking the slot. Please try again.");
        }
      } else {
        setResponse("I'm sorry, I couldn't process your booking request. Please try again.");
      }
    } catch (error) {
      console.error('Error processing transcript:', error);
      setResponse("An error occurred while processing your request. Please try again.");
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`px-4 py-2 rounded ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
      >
        {isListening ? 'Stop Listening' : 'Start Voice Assistant'}
      </button>
      {transcript && (
        <div className="mt-2">
          <strong>You said:</strong> {transcript}
        </div>
      )}
      {response && (
        <div className="mt-2">
          <strong>Assistant:</strong> {response}
        </div>
      )}
    </div>
  );
};
