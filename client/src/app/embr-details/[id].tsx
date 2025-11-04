// pages/missions/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { deleteMission } from '@/api/mission.api';  // import your delete function
import axios from 'axios';

export default function MissionDetails() {
  const router = useRouter();
  const { id } = router.query; // get the mission ID from the URL
  const [mission, setMission] = useState<any>(null);

  // Fetch the mission details (optional)
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:3100/api/missions/${id}`).then(res => {
        setMission(res.data);
      });
    }
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm('Are you sure you want to delete this mission?');
    if (!confirmed) return;

    try {
      const response = await deleteMission(id as string);
      alert(response.message);
      router.push('/missions'); // redirect to mission list page
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="p-6">
      {mission ? (
        <>
          <h1 className="text-2xl font-bold">{mission.name}</h1>
          <p>Bot ID: {mission.botID}</p>
          <p>Coordinates: {JSON.stringify(mission.areaCoordinates)}</p>

          {/* 🧨 Delete Button */}
          <button
            onClick={handleDelete}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete Mission
          </button>
        </>
      ) : (
        <p>Loading mission...</p>
      )}
    </div>
  );
}
