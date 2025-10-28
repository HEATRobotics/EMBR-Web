// Robot operational status badge colors and texts
// These represent the real-time operational state based on sensor data

const RobotOperationalStatusBadgeColors = {
  operational: "#93FF9E",
  chargingRequired: "#FFFB93",
  attentionRequired: "#FF9393",
  systemFailed: "#FE5555",
};

const RobotOperationalStatusColors = {
  operational: "#40FF53",
  chargingRequired: "#FFF967",
  attentionRequired: "#F51515",
  systemFailed: "#F51515",
};

const RobotOperationalStatusTexts = {
  operational: "Operational",
  chargingRequired: "Charging Required",
  attentionRequired: "Attention Required",
  systemFailed: "System Failed",
};

export const RobotOperationalStatusType = {
  operational: {
    color: RobotOperationalStatusColors["operational"],
    bgColor: RobotOperationalStatusBadgeColors["operational"],
    text: RobotOperationalStatusTexts["operational"],
  },
  chargingRequired: {
    color: RobotOperationalStatusColors["chargingRequired"],
    bgColor: RobotOperationalStatusBadgeColors["chargingRequired"],
    text: RobotOperationalStatusTexts["chargingRequired"],
  },
  attentionRequired: {
    color: RobotOperationalStatusColors["attentionRequired"],
    bgColor: RobotOperationalStatusBadgeColors["attentionRequired"],
    text: RobotOperationalStatusTexts["attentionRequired"],
  },
  systemFailed: {
    color: RobotOperationalStatusColors["systemFailed"],
    bgColor: RobotOperationalStatusBadgeColors["systemFailed"],
    text: RobotOperationalStatusTexts["systemFailed"],
  },
};
