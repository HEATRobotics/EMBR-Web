'use client'; 

import { useParams } from 'next/navigation';
<<<<<<< Updated upstream
import { useEffect, useState } from 'react'; 
import CustomGoogleMap from '@/components/features/map/GoogleMap';
import {fetchHotspots, fetchTemperaturesByHotspotID} from '@/api/hotspots.api'
import {HotspotType} from '@/types/hotspot.type';
fetchTemperaturesByHotspotID
=======
import {useEffect, useState} from 'react';
import {fetchHotspots, updateHotspotStatus} from '@/api/hotspots.api';
import {HotspotType} from '@/types/hotspot.type';
>>>>>>> Stashed changes


export default function HotspotDetail() {
  const params = useParams();
  const hotspotId = params.id;
<<<<<<< Updated upstream
  const [hotspotName, setHotspotName] = useState(`Hotspot #${hotspotId}`); 
  const [isNameSaved, setIsNameSaved] = useState(false); 
  const [hotspot, setHotspot] = useState<HotspotType | null>(null);


 

  useEffect(() => {
    const savedName = localStorage.getItem(`hotspot-name-${hotspotId}`);
    if (savedName) {
      setHotspotName(savedName);
    }
  }, [hotspotId]);

  useEffect(() => {
    const loadHotspot = async () => {
      const hotspots = await fetchHotspots(); 


      const matchingHotspot = hotspots.find(
        (hotspot) => hotspot.id === Number(hotspotId)
      ); 

      if (matchingHotspot) { 
        setHotspot(matchingHotspot);
      }
    };
    loadHotspot();

  }, [hotspotId]);
  
  const handleSaveName = () => {
    localStorage.setItem(`hotspot-name-${hotspotId}`, hotspotName);
    setIsNameSaved(true);
    console.log('Saving hotspot name:', hotspotName);
  };
=======
  const [hotspot,setHotspot] = useState<HotspotType | null>(null);
  const[isUpdating,setIsUpdating] = useState(false);
>>>>>>> Stashed changes

  useEffect(()=> {
    const loadHotspot = async () => {
      const hotspots =await fetchHotspots();
      const found = hotspots.find(h => h.id === Number(hotspotId));
      setHotspot(found || null);
    };
    loadHotspot();
    }, [hotspotId]);

    if (!hotspot) return <div>Loading...</div>;
  
    const detectedDate=new Date(hotspot.detectedAt).toLocaleString();//format date for display
    const handleToggleStatus = async () => {
      if (!hotspot) return;
      const nextStatus: HotspotType[`status`]=
      hotspot.status === `unresolved` ? `resolved` : `unresolved`;

      try{
        setIsUpdating(true);
        const updatedStatus = await updateHotspotStatus(hotspot.id, nextStatus);
        setHotspot({ ...hotspot, status: updatedStatus });
      }finally{
        setIsUpdating(false);
      }
  };
  return (
    <div className="bg-gray-100 min-h-screen pt-20">
      <main className="mb-16 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
<<<<<<< Updated upstream
            <input 
            type = "text"
            value= {hotspotName}
            onChange={(e) => {
              setHotspotName(e.target.value); 
              setIsNameSaved(false);
            }}
            className="w-full text-3xl font-bold bg-transparent border-b border-transparent focus:outline-none focus:border-blue-500"
            />
            <div className="mt-2"> 
              <button
                onClick={handleSaveName}
                className={`px-4 py-2 rounded-md border ${
                  isNameSaved ?'bg-white text-gray-700 border-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isNameSaved ? 'Saved' : 'Save name'}

                </button>
            </div>
            <p className="text-gray-600">Detected: N/A</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
              Mark as Unresolved
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Mark as Resolved
=======
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
>>>>>>> Stashed changes
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
              <div className="bg-gray-100 h-64 rounded flex items-center justify-center">
                <p className="text-gray-500">Chart: Temperature readings over time</p>
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
                  <p className="text-sm text-gray-600">Current Temperature</p>
                  <p className="text-2xl font-bold">N/A</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">First Detected</p>
                  <p>N/A</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p>N/A</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold">New</p>
                </div>
              </div>
            </div>

            {/* Mission Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Mission Info</h2>
              <div className="space-y-2">
                <p>
                  <span className="text-sm text-gray-600">Mission:</span> N/A
                </p>
                <p>
                  <span className="text-sm text-gray-600">Bot:</span> N/A
                </p>
              </div>
            </div>

            {/* Assignment */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Field Assignment</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Assign to Team Member</label>
                  <select className="w-full px-4 py-2 border rounded-md">
                    <option>Select member...</option>
                  </select>
                </div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Assign
                </button>
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

        {/* Action Log */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Action Log</h2>
          <div className="text-gray-500">
            <p>No actions recorded yet</p>
          </div>
        </div>
      </main>
    </div>
  );
}
