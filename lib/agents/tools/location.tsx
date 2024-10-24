import axios from 'axios';

const MAPBOX_API_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export const locationTool = async (location: string) => {
  try {
    const response = await axios.get(
      `${MAPBOX_API_URL}/${encodeURIComponent(location)}.json`,
      {
        params: {
          access_token: MAPBOX_ACCESS_TOKEN,
        },
      }
    );

    const data = response.data;
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return { latitude, longitude };
    } else {
      throw new Error('Location not found');
    }
  } catch (error) {
    console.error('Error fetching location:', error);
    return null;
  }
};
