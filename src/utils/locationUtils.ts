export async function getChargingLocations(latitude: number, longitude: number) {
  const response = await fetch('/api/locations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ latitude, longitude }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch closest location');
  }

  return await response.json();
}