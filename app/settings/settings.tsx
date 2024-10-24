import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, User, Mail, MapPin, Globe, Cpu } from 'lucide-react';
import iso6391 from 'iso-639-1';
import mapboxgl from 'mapbox-gl'; // Import your Mapbox component
import { Mapbox } from '../../components/map/mapbox-map';
import { useProfileActions, ProfileActionEnum } from '../../components/profile-toggle-context';

/**
 * AccountSettings component handles the user account settings.
 * It provides a form for users to update their profile information, location, language, and model preferences.
 */
export const AccountSettings = () => {
  const [name, setName] = useState('--');
  const [email, setEmail] = useState('ereqglobal@gmail.com');
  const [theme, setTheme] = useState('Dark');
  const [introduction, setIntroduction] = useState("I'm a software engineer");
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('Automatic');
  const [accountStatus] = useState('Trial');
  const [treeCount] = useState(0); // Fixed value, not changeable
  const [languages, setLanguages] = useState([]);
  const [position, setPosition] = useState({
    latitude: 0,
    longitude: 0,
  });

  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem('selectedModel') || 'default';
  });

  const modelOptions = [
    { value: 'default', label: 'Default' },
    { value: 'ollama', label: 'Grok 1.5' },
    { value: 'openai', label: 'GPT-4o' },
    { value: 'google', label: 'Gemini-2.0' },
    { value: 'anthropic', label: 'Claude 3.5 Sonnet' },
  ];

  useEffect(() => {
    localStorage.setItem('selectedModel', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    // Programmatically list all languages using iso-639-1
    const languageList = iso6391.getAllNames();
    //setLanguages(languageList as string[]);
  }, []);

  useEffect(() => {
    // Handle routing and theme context
    const handleRouting = () => {
      // Add routing logic here
    };

    handleRouting();
  }, []);

  /**
   * Handles the location change and updates the position using Mapbox API.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);

    // Call Mapbox API to get the location data
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${e.target.value}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
    );
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      setPosition({ latitude, longitude });
    }
  };

  /**
   * Handles the save button click and logs the settings.
   */
  const handleSave = () => {
    console.log('Saving settings...');
    // Add routing logic here
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-black text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <button className="text-gray-400">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Name and Email Input */}
        <div className="flex items-center space-x-2">
          <User className="text-gray-400" size={20} />
          <div className="flex-grow">
            <label htmlFor="name" className="block text-sm font-medium text-gray-400">Name</label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 bg-gray-800 border-gray-700" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Mail className="text-gray-400" size={20} />
          <div className="flex-grow">
            <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email</label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-gray-800 border-gray-700" />
          </div>
        </div>

        {/* Theme Selection */}
        <div className="flex items-center space-x-2">
          <div className="text-gray-400">🌓</div>
          <div className="flex-grow">
            <label htmlFor="theme" className="block text-sm font-medium text-gray-400">Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="mt-1 bg-gray-800 border-gray-700">
              <option value="Dark">Dark</option>
              <option value="Light">Light</option>
            </select>
          </div>
        </div>

        {/* Introduction Text Area */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Profile</h2>
          <p className="text-sm text-gray-400 mb-2">This profile is accessible to AI.</p>
          <div className="flex items-center space-x-2">
            <User className="text-gray-400" size={20} />
            <div className="flex-grow">
              <label htmlFor="introduction" className="block text-sm font-medium text-gray-400">Introduction</label>
              <textarea
                id="introduction"
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                className="mt-1 w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Location Input with Mapbox Integration */}
        <div className="flex items-center space-x-2">
          <MapPin className="text-gray-400" size={20} />
          <div className="flex-grow">
            <label htmlFor="location" className="block text-sm font-medium text-gray-400">Location</label>
            <Input id="location" value={location} onChange={handleLocationChange} className="mt-1 bg-gray-800 border-gray-700" />
          </div>
        </div>

        {/* Render the Mapbox component */}
        <div className="mt-4" style={{ height: '200px', width: '100%' }}>
          <Mapbox position={position} />
        </div>

        {/* Language Selection */}
        <div className="flex items-center space-x-2">
          <Globe className="text-gray-400" size={20} />
          <div className="flex-grow">
            <label htmlFor="language" className="block text-sm font-medium text-gray-400">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-1 bg-gray-800 border-gray-700">
              <option value="Automatic">Automatic</option>
              {languages.map((lang, index) => (
                <option key={index} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Model Selection */}
        <div className="flex items-center space-x-2">
        <Cpu className="text-gray-400" size={20} />
        <div className="flex-grow">
          <label htmlFor="modelGarden" className="block text-sm font-medium text-gray-400">Model Garden</label>
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)} 
            className="mt-1 bg-gray-800 border-gray-700"
          >
            {modelOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
        {/* Account Status and Tree Count */}
        <div className="text-sm text-gray-400">
          <p>Account Status: {accountStatus}</p>
          <p>Trees: {treeCount}</p>
        </div>
      </div>

      <Button onClick={handleSave} className="mt-6 w-full bg-white text-black hover:bg-gray-200">Save</Button>
    </div>
  );
};

export default AccountSettings;
