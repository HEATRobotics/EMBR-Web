import { RobotType } from "@/types/robot.type";
import { useState } from "react";
import JanusStreaming from "@/components/VideoStream";
import BotInfoPanel from "@/components/Details/BotInfo/BotInfoPanel";

function BotPanel({
  selectedBot,
  onClose,
}: {
  selectedBot: RobotType;
  onClose?: () => void; // still accept it so parent can pass, but not required here
}) {
  const [currentTab, setCurrentTab] = useState<"Flir" | "FPV">("Flir");

  return (
    <div className="relative px-2 pb-4">
      {/* NOTE: exit button moved to the top tab in DetailsPanel */}
      {/* Tab Menu */}
      <div className="flex w-full overflow-hidden shadow border-b border-black mt-2">
        <button
          onClick={() => setCurrentTab("Flir")}
          className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 ${
            currentTab === "Flir"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
          }`}
        >
          Flir
        </button>
        <button
          onClick={() => setCurrentTab("FPV")}
          className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200 ${
            currentTab === "FPV"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
          }`}
        >
          FPV
        </button>
      </div>

      {currentTab === "FPV" && (
        <div className="w-full overflow-hidden shadow bg-white mt-2">
          <img src="/fpv_sample.jpg" alt="fpv Image" className="w-full max-h-80 object-contain" />
        </div>
      )}

      {currentTab === "Flir" && (
        <div className="w-full overflow-hidden shadow bg-white mt-2">
          <img src="/flir_sample.png" alt="Flir Image" className="w-full max-h-80 object-contain" />
        </div>
      )}

      <BotInfoPanel selectedBot={selectedBot} />
    </div>
  );
}

export default BotPanel;