'use client';

import { useRouter, useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import MissionForm from '@/components/features/mission/MissionForm';

import { getMissionById, updateMission } from '@/api/missions.api';
import { MissionType } from '@/types/mission.type';

export default function EditMissionPage() {

  const router = useRouter();
  const params = useParams();



const missionID =
  typeof params.missionID === 'string'
    ? Number(params.missionID)
    : Array.isArray(params.missionID)
      ? Number(params.missionID[0])
      : undefined;
  const [missionData, setMissionData] = useState<MissionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===============================
  // FETCH EXISTING MISSION
  // ===============================

  useEffect(() => {

    async function fetchMission() {

      try {

        const data = await getMissionById(missionID);

        setMissionData(data);

      } catch (err) {

        console.error('Failed to load mission', err);

      } finally {

        setLoading(false);

      }
    }

if (!missionID || isNaN(missionID)) return;

fetchMission();
  }, [missionID]);

  // ===============================
  // SUBMIT HANDLER
  // ===============================

  const handleSubmit = async (updatedMission: MissionType) => {

    setIsSubmitting(true);

    try {

      await updateMission(updatedMission);

      router.push(`/missions/${missionID}`);

    } catch (err) {

      console.error('Failed to update mission', err);
      alert('Failed to save changes');

    } finally {

      setIsSubmitting(false);

    }
  };

  // ===============================
  // LOADING STATE
  // ===============================

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Loading mission...</h1>
      </div>
    );
  }

  if (!missionData) {
    return (
      <div className="p-6 text-red-600">
        Mission not found.
      </div>
    );
  }

  // ===============================
  // PAGE UI
  // ===============================

  return (
    <div className="h-screen flex flex-col p-6">

      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Edit Mission</h1>
        <p className="text-gray-600">
          Modify mission parameters and area
        </p>
      </div>

      <div className="flex-1 overflow-hidden">

        <MissionForm
          initialData={missionData}
          onSubmit={handleSubmit}
          submitting={isSubmitting}
        />

      </div>

    </div>
  );
}