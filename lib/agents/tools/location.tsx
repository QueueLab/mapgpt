import { createStreamableValue } from 'ai/rsc';
import { ToolProps } from '.';

export const locationTool = ({ uiStream, fullResponse }: ToolProps) => ({
  description: 'Query elevation data and contour lines from Mapbox',
  parameters: {
    type: 'object',
    properties: {
      latitude: {
        type: 'number',
        description: 'Latitude of the location'
      },
      longitude: {
        type: 'number',
        description: 'Longitude of the location'
      }
    },
    required: ['latitude', 'longitude']
  },
  execute: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    let hasError = false;
    const streamResults = createStreamableValue<string>();
    uiStream.append(<div>Loading elevation data and contour lines...</div>);

    try {
      const response = await fetch(
        `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${longitude},${latitude}.json?layers=contour&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      streamResults.done(JSON.stringify(data));
      uiStream.update(<div>Elevation data and contour lines loaded successfully.</div>);
      return data;
    } catch (error) {
      console.error('Mapbox API error:', error);
      hasError = true;
      fullResponse += `\nAn error occurred while querying elevation data and contour lines for latitude: ${latitude}, longitude: ${longitude}.`;
      uiStream.update(
        <div>{`An error occurred while querying elevation data and contour lines for latitude: ${latitude}, longitude: ${longitude}.`}</div>
      );
      return null;
    }
  }
});
