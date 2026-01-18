import {
	getAllMissions,
	getMissionByID,
	createMission,
	updateMission,
	startMission,
	endMission,
	deleteMission,
	assignBotsToMission,
	getAssignmentsForMission
} from '../services/database.service.mjs';

const mapMission = async (missionRow) => {
	if (!missionRow) return null;
	const area = missionRow.areaCoordinates;
	let areaParsed = area;
	if (typeof area === 'string') {
		try { areaParsed = JSON.parse(area); } catch { areaParsed = null; }
	}
	const assignedBots = await getAssignmentsForMission(missionRow.missionID);

	return {
		...missionRow,
		areaCoordinates: areaParsed,
		assignedBots,
	};
};

export async function getAllMissionsController(req, res) {
	try {
		const missions = await getAllMissions();
		if (!missions) return res.status(500).json({ error: 'Failed to fetch missions' });

		const mapped = await Promise.all(missions.map(mapMission));
		res.status(200).json(mapped);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

export async function getMissionByIdController(req, res) {
	try {
		const mission = await getMissionByID(req.params.id);
		if (!mission.success) return res.status(404).json({ error: mission.error || 'Mission not found' });

		const mapped = await mapMission(mission.data);
		res.status(200).json(mapped);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

export async function createMissionController(req, res) {
	try {
		const body = req.body || {};
		const missionPayload = {
			missionName: body.missionName,
			areaCoordinates: body.areaCoordinates,
			progress: body.progress ?? 0,
			avgTemp: body.avgTemp ?? 0,
			timePassed: body.timePassed ?? 0,
			timeEstimated: body.timeEstimated ?? 0,
			timeStart: body.timeStart ?? null,
			timeEnd: body.timeEnd ?? null,
			botIds: body.botIds ?? [],
		};

		const result = await createMission(missionPayload);
		if (!result.success) return res.status(500).json({ error: result.error || 'Failed to create mission' });

		res.status(201).json({ missionID: result.missionID });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

export async function updateMissionController(req, res) {
	try {
		const result = await updateMission(req.params.id, req.body || {});
		if (!result.success) return res.status(500).json({ error: result.error || 'Failed to update mission' });
		res.status(200).json({ message: 'Mission updated successfully' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

export async function startMissionController(req, res) {
	try {
		const missionId = req.params.id;
        const time = req.body?.time;

        if (!time) {
            return res.status(400).json({ error: 'Start time is required' });
        }

        const bots = await getAssignmentsForMission(missionId);
        const result = await startMission(missionId, time, bots);
		if (!result.success) return res.status(500).json({ error: result.error || 'Failed to start mission' });
		res.status(200).json({ message: 'Mission started successfully' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

export async function endMissionController(req, res) {
	try {
        const missionId = req.params.id;
        const time = req.body?.time;

        if (!time) {
            return res.status(400).json({ error: 'End time is required' });
        }

        const bots = await getAssignmentsForMission(missionId);
		const result = await endMission(missionId, time, bots);
		if (!result.success) return res.status(500).json({ error: result.error || 'Failed to end mission' });
		res.status(200).json({ message: 'Mission ended successfully' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

export async function deleteMissionController(req, res) {
	try {
		const result = await deleteMission(req.params.id);
		if (!result.success) return res.status(404).json({ error: result.error || 'Mission not found' });
		res.status(200).json({ message: 'Mission deleted successfully' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

export async function assignBotsController(req, res) {
	try {
		const botIds = req.body?.botIds ?? [];
		const result = await assignBotsToMission(req.params.id, botIds);
		if (!result.success) return res.status(500).json({ error: result.error || 'Failed to assign bots' });
		res.status(200).json({ message: 'Bots assigned successfully' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

