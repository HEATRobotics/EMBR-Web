import { Marker } from '@react-google-maps/api';

import { RobotOperationalStatusType } from '@/constants/robotConstants';
import { MissionType } from '@/types/mission.type';
import { RobotType } from '@/types/robot.type';

export default class MapDrawUtils {
  static markers: google.maps.Marker[] = [];
  static missionAreas: google.maps.Rectangle[] = [];

  static drawBots(robots: RobotType[], map: google.maps.Map) {
    this.removeOldMarkers();
    // Draw each bot in the list
    robots.forEach((robot: RobotType) => this.drawBot(robot, map));
  }

  static drawMissionAreas(missions: MissionType[], map: google.maps.Map) {
    this.removeOldMissionAreas();
    // Draw each mission area in the list
    missions.forEach((mission) => this.drawMissionArea(mission, map));
  }

  private static drawBot(robot: RobotType, map: google.maps.Map) {

    const statusColor = RobotOperationalStatusType[robot.operationalStatus].color;
    
    const svgData = `
      <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <circle cx="10" cy="10" r="5" fill="${statusColor}" />
      </svg>
    `;

    const marker = new google.maps.Marker({
      position: robot.coordinates,
      title: robot.name,
      map: map,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgData),
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20),
      },
    });

    this.markers.push(marker);
  }

  private static drawMissionArea(mission: MissionType, map: google.maps.Map) {
    if (!mission.areaCoordinates) return;

    //console.log(mission.areaCoordinates);

    const bounds: google.maps.LatLngBoundsLiteral = {
      north: mission.areaCoordinates[0].lat,
      south: mission.areaCoordinates[1].lat,
      west: mission.areaCoordinates[0].lng,
      east: mission.areaCoordinates[1].lng,
    };

    const rectangle = new google.maps.Rectangle({
      bounds,
      map,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
    });

    const labelPosition = {
      lat: bounds.north - 0.0005,
      lng: (bounds.west + bounds.east) / 2,
    };

    //Text for the label
    const labelMarker = new google.maps.Marker({
      position: labelPosition,
      map: map,
      icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 }, // invisible icon
      label: {
        text: mission.missionName || 'Unnamed Mission',
        color: 'black',
        fontSize: '14px',
        fontWeight: 'bold',
      },
    });

    this.missionAreas.push(rectangle);
  }

  private static removeOldMarkers() {
    this.markers.forEach((marker) => {
      marker.setMap(null);
    });

    this.markers = [];
  }

  private static removeOldMissionAreas() {
    this.missionAreas.forEach((missionArea) => missionArea.setMap(null));
    this.missionAreas = [];
  }
}
