'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import MissionForm from '@/components/features/mission/MissionForm';
import { createMission } from '@/api/missions.api';
import { MissionType } from '@/types/mission.type';

export default function CreateMissionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: MissionType) => {
    try {
      setIsSubmitting(true);
      await createMission(data);
      router.push('/missions');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MissionForm
      onSubmit={handleSubmit}
      submitting={isSubmitting}
      mode="create"
    />
  );
}