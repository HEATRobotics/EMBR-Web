const RobotStateBadgeColors = {
  active: "#93FF9E",
  chargingRequired: "#FFFB93",
  attentionRequired: "#FF9393",
  systemFailed: "#FE5555",
};

const RobotStateColors = {
  active: "#40FF53",
  chargingRequired: "#FFF967",
  attentionRequired: "#F51515",
  systemFailed: "#F51515",
};

const RobotStateTexts = {
  active: "Active",
  chargingRequired: "Charging Required",
  attentionRequired: "Attention Required",
  systemFailed: "System Failed",
};

export const RobotStateType = {
  active: {
    color: RobotStateColors["active"],
    bgColor: RobotStateBadgeColors["active"],
    text: RobotStateTexts["active"],
  },
  chargingRequired: {
    color: RobotStateColors["chargingRequired"],
    bgColor: RobotStateBadgeColors["chargingRequired"],
    text: RobotStateTexts["chargingRequired"],
  },
  attentionRequired: {
    color: RobotStateColors["attentionRequired"],
    bgColor: RobotStateBadgeColors["attentionRequired"],
    text: RobotStateTexts["attentionRequired"],
  },
  systemFailed: {
    color: RobotStateColors["systemFailed"],
    bgColor: RobotStateBadgeColors["systemFailed"],
    text: RobotStateTexts["systemFailed"],
  },
};
