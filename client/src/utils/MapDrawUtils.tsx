import { RobotStateType } from "@/constants/robotConstants";
import { FleetItemType } from "@/types/fleet.type";
import { RobotType } from "@/types/robot.type";
import { Marker } from "@react-google-maps/api";

export default class MapDrawUtils {

  static markers: google.maps.Marker[] = [];
  
  static drawFleets(fleets: FleetItemType[], map: google.maps.Map) {
    this.removeOldMarkers();
    
    // Draw each fleet
    fleets.forEach((fleet: FleetItemType) => {
      // Draw bots in fleet
      this.drawBots(fleet.bots, map);
    });
  }

  static drawBots(robots: RobotType[], map: google.maps.Map) {
    // Draw each bot in the list
    robots.forEach((robot: RobotType) => this.drawBot(robot, map));
  }

  private static drawBot(robot: RobotType, map: google.maps.Map) {

    const svgData = `
      <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="5" fill="${RobotStateType[robot.state].color}" />
      </svg>
    `;

    const marker = new google.maps.Marker({
      position: robot.coordinates,
      title: robot.name,
      map: map,
      icon: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svgData),
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20)
      }
    })

    this.markers.push(marker);
  }

  private static removeOldMarkers() {
    this.markers.forEach((marker) => {
      marker.setMap(null);
    })

    this.markers = [];
  }

}