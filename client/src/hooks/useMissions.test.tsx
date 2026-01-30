import { renderHook, waitFor } from '@testing-library/react';
import { useMissions, useMission } from './useMissions';
import { fetchMissions, fetchMissionById } from '@/api/missions.api';
import { MissionType } from '@/types/mission.type';

// Mock the API functions
jest.mock('@/api/missions.api');
const mockedFetchMissions = fetchMissions as jest.MockedFunction<typeof fetchMissions>;
const mockedFetchMissionById = fetchMissionById as jest.MockedFunction<typeof fetchMissionById>;

describe('useMissions', () => {
  const mockMissions: MissionType[] = [
    {
      missionID: 1,
      missionName: 'Mission 1',
      progress: 50,
      averageTemperature: 25,
      timePassed: 120,
      timeEstimated: 240,
      timeStart: null,
      timeEnd: null,
      areaCoordinates: undefined,
      assignedBots: [],
      hotspots: [],
    },
    {
      missionID: 2,
      missionName: 'Mission 2',
      progress: 75,
      averageTemperature: 22,
      timePassed: 180,
      timeEstimated: 240,
      timeStart: '2024-01-15 10:00:00',
      timeEnd: null,
      areaCoordinates: [
        { lat: 50, lng: -120 },
        { lat: 49, lng: -119 },
      ],
      assignedBots: [1, 2],
      hotspots: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log to suppress output during tests
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('useMissions hook', () => {
    it('should fetch missions successfully', async () => {
      mockedFetchMissions.mockResolvedValue(mockMissions);

      const { result } = renderHook(() => useMissions());

      // Initial state
      expect(result.current.missionsLoading).toBe(true);
      expect(result.current.missionsData).toBeNull();
      expect(result.current.missionsError).toBeNull();

      // Wait for the missions to be fetched
      await waitFor(() => {
        expect(result.current.missionsLoading).toBe(false);
      });

      expect(result.current.missionsData).toEqual(mockMissions);
      expect(result.current.missionsError).toBeNull();
      expect(mockedFetchMissions).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch error', async () => {
      mockedFetchMissions.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useMissions());

      expect(result.current.missionsLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.missionsLoading).toBe(false);
      });

      expect(result.current.missionsData).toBeNull();
      expect(result.current.missionsError).toBe('Failed to fetch mission.');
    });

    it('should provide setMissions function', async () => {
      mockedFetchMissions.mockResolvedValue(mockMissions);

      const { result } = renderHook(() => useMissions());

      await waitFor(() => {
        expect(result.current.missionsLoading).toBe(false);
      });

      expect(result.current.setMissions).toBeDefined();
      expect(typeof result.current.setMissions).toBe('function');
    });
  });

  describe('useMission hook', () => {
    const mockMission: MissionType = {
      missionID: 10,
      missionName: 'Specific Mission',
      progress: 60,
      averageTemperature: 23,
      timePassed: 150,
      timeEstimated: 250,
      timeStart: '2024-01-16 09:00:00',
      timeEnd: null,
      areaCoordinates: [
        { lat: 51, lng: -121 },
        { lat: 50, lng: -120 },
      ],
      assignedBots: [3, 4],
      hotspots: [],
    };

    it('should fetch a specific mission successfully', async () => {
      mockedFetchMissionById.mockResolvedValue(mockMission);

      const { result } = renderHook(() => useMission(10));

      // Initial state
      expect(result.current.missionLoading).toBe(true);
      expect(result.current.missionData).toBeNull();
      expect(result.current.missionError).toBeNull();

      // Wait for the mission to be fetched
      await waitFor(() => {
        expect(result.current.missionLoading).toBe(false);
      });

      expect(result.current.missionData).toEqual(mockMission);
      expect(result.current.missionError).toBeNull();
      expect(mockedFetchMissionById).toHaveBeenCalledWith(10);
      expect(mockedFetchMissionById).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch error for specific mission', async () => {
      mockedFetchMissionById.mockRejectedValue(new Error('Mission not found'));

      const { result } = renderHook(() => useMission(999));

      expect(result.current.missionLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.missionLoading).toBe(false);
      });

      expect(result.current.missionData).toBeNull();
      expect(result.current.missionError).toBe('Failed to fetch mission.');
    });

    it('should refetch when missionId changes', async () => {
      mockedFetchMissionById.mockResolvedValue(mockMission);

      const { result, rerender } = renderHook(
        ({ id }) => useMission(id),
        { initialProps: { id: 10 } }
      );

      await waitFor(() => {
        expect(result.current.missionLoading).toBe(false);
      });

      expect(mockedFetchMissionById).toHaveBeenCalledWith(10);
      expect(mockedFetchMissionById).toHaveBeenCalledTimes(1);

      // Change missionId
      rerender({ id: 20 });

      await waitFor(() => {
        expect(mockedFetchMissionById).toHaveBeenCalledWith(20);
      });

      expect(mockedFetchMissionById).toHaveBeenCalledTimes(2);
    });

    it('should provide setMission function', async () => {
      mockedFetchMissionById.mockResolvedValue(mockMission);

      const { result } = renderHook(() => useMission(10));

      await waitFor(() => {
        expect(result.current.missionLoading).toBe(false);
      });

      expect(result.current.setMission).toBeDefined();
      expect(typeof result.current.setMission).toBe('function');
    });
  });
});
