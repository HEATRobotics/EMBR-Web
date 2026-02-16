import MissionForm from "@/components/features/mission/MissionForm";

export default function CreateMissionPage() {

 const router = useRouter();

 const handleSubmit = async (mission) => {
   const result = await createMission(mission);
   router.push(`/missions/${result.missionID}`);
 };

 return (
   <MissionForm onSubmit={handleSubmit} />
 );
}