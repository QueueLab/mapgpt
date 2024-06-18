// utils/location-extractor.ts

import { CoreMessage } from 'ai';

export interface LocationEntity {
  name: string;
  coordinates?: { latitude: number; longitude: number };
  // Add any other relevant properties
}

// Asynchronously extract location entities using the AI model
export const extractLocations = async (messages: CoreMessage[], model: any): Promise<LocationEntity[]> => {
  const prompt = `Extract location entities from the following messages. 
  Return the results in JSON format with fields "name" and optionally "coordinates".
  Messages: ${messages.map(m => m.content).join('\n')}`;

  const response = await model({
    messages: [{ role: 'system', content: prompt }],
    maxTokens: 1500
  });

  const locations: LocationEntity[] = JSON.parse(response.content);

  return locations;
};
