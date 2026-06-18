'use client'; 

import { useParams } from 'next/navigation';
import {useEffect, useState} from 'react';
import CustomGoogleMap from '@/components/features/map/GoogleMap';
import {fetchHotspots, fetchTemperaturesByHotspotID, updateHotspotStatus} from '@/api/hotspots.api';
import {HotspotType} from '@/types/hotspot.type';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';



export default function HotspotDetail() {
  const params = useParams();
  const hotspotId = params.id;
  const [hotspotName, setHotspotName] = useState(`Hotspot #${hotspotId}`); 
  const [isNameSaved, setIsNameSaved] = useState(false); 
  const [hotspot, setHotspot] = useState<HotspotType | null>(null);
  const [temperatureData, setTemperatureData] = useState<any[]>([]);
  const[isUpdating,setIsUpdating] = useState(false);

  useEffect(()=> {
    const loadHotspot = async () => {
      const hotspots =await fetchHotspots();
      const found = hotspots.find(h => h.id === Number(hotspotId));
      setHotspot(found || null);
    };
    loadHotspot();
    }, [hotspotId]);

  useEffect(() => {
    const loadTemperatures = async () => {
      const temps = await fetchTemperaturesByHotspotID(Number(hotspotId));

      const formattedTemps = temps.map((temp, index) => ({
        reading: index + 1, 
        temperature: Number(temp.temperature), 

      }));
      setTemperatureData(formattedTemps); 

    }; 
    loadTemperatures(); 

  }, [hotspotId]);



  if (!hotspot) return <div>Loading...</div>;

  const detectedDate = new Date(hotspot.detectedAt).toLocaleString(); // format date for display

  // derive temperature summary values from temperatureData so they are available in the JSX
  const temperatures = temperatureData.map((item) => item.temperature);
  const minTemp = temperatures.length > 0 ? Math.min(...temperatures) : null;
  const maxTemp = temperatures.length > 0 ? Math.max(...temperatures) : null;
  const avgTemp =
    temperatures.length > 0
      ? temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length
      : null;

  const handleToggleStatus = async () => {
    if (!hotspot) return;
    const nextStatus: HotspotType['status'] =
      hotspot.status === 'unresolved' ? 'resolved' : 'unresolved';

    try {
      setIsUpdating(true);
      const updatedStatus = await updateHotspotStatus(hotspot.id, nextStatus);
      setHotspot({ ...hotspot, status: updatedStatus });
    } finally {
      setIsUpdating(false);
    }
  };
  return (
    <div className="bg-gray-100 min-h-screen pt-20">
      <main className="mb-16 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Hotspot #{hotspotId}</h1>
            <p className="text-gray-600">Detected: {detectedDate}</p>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick= {handleToggleStatus}
              disabled={isUpdating}
              className={`px-4 py-2 bg-green-600 text-white rounded-md ${
                hotspot.status === `unresolved`
              ? `bg-green-600 hover:bg-green-700`
              : `bg-yellow-600 hover:bg-yellow-700`
            } ${isUpdating ? `opacity-60 cursor-not-allowed` : ``}`}
          >
            {hotspot.status === 'unresolved'
              ? `Mark as resolved`
              : `Mark as unresolved`}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map and Location */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="h-96 rounded overflow-hidden">
                {hotspot ? (
                  <CustomGoogleMap
                    bots={[]}
                    missionsData={[]}
                    drawingMode={false}
                    showSearch={false}
                    center={{ lat: hotspot.latitude, lng: hotspot.longitude }}
                    zoom={18}
                    hotspotLocation={{ lat: hotspot.latitude, lng: hotspot.longitude }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    Loading hotspot map... 
                  </div>
                )}

              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">GPS Coordinates</p>
                  <p className="font-mono">
                    {hotspot ? `${hotspot.latitude.toFixed(2)}, ${hotspot.longitude.toFixed(2)}` : `N/A`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Altitude</p>
                  <p className="font-mono">
                    {hotspot ? `${hotspot.altitude.toFixed(2)}` : `N/A`}
                  </p>
                </div>
              </div>
            </div>

            {/* Temperature History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Temperature History</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Min Temperature</p>
                  <p className="text-2xl font-bold">
                    {minTemp !== null ? `${minTemp.toFixed(2)}°F` : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Max Temperature</p>
                  <p className="text-2xl font-bold">
                    {maxTemp !== null ? `${maxTemp.toFixed(2)}°F` : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Average Temperature</p>
                  <p className="text-2xl font-bold">
                    {avgTemp !== null ? `${avgTemp.toFixed(2)}°F` : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-100 h-64 rounded p-4">
                {temperatureData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={temperatureData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="reading" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        strokeWidth={2}
                        dot
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-500">
                    No temperature data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Hotspot Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                    Critical
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Temperature</p>
                  <p className="text-2xl font-bold">{avgTemp !== null ? `${avgTemp.toFixed(2)}°F` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">First Detected</p>
                  <p>{hotspot.detectedAt ? new Date(hotspot.detectedAt).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold">{hotspot.status}</p>
                </div>
              </div>
            </div>

            {/* Mission Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Mission Info</h2>
              <div className="space-y-2">
                <p>
                  <span className="text-sm text-gray-600">Mission:</span> <span className="font-semibold">{hotspot.missionName}</span>
                </p>
                <p>
                  <span className="text-sm text-gray-600">Bot:</span> <span className="font-semibold">{hotspot.botID}</span>
                </p>
              </div>
            </div>
            {/* Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <textarea
                className="w-full px-4 py-2 text-black border rounded-md"
                rows={4}
                placeholder="Add notes about this hotspot..."
              />
              <button className="mt-2 w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                Save Notes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
