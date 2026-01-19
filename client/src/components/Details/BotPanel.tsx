import { RobotType } from "@/types/robot.type";
import { useState } from "react";
import BotInfoPanel from "@/components/Details/BotInfo/BotInfoPanel";

function BotPanel({
  selectedBot,
}: {
  selectedBot: RobotType;
}) {
  const [currentTab, setCurrentTab] = useState<"Flir" | "FPV">("Flir");

  return (
    <div className="w-full">

      {/* TAB MENU — SAME AS ORIGINAL: border under tabs */}
      <div className="flex w-full overflow-hidden border-t border-b border-black">
        <button
          onClick={() => setCurrentTab("Flir")}
          className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200
            ${
              currentTab === "Flir"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }
            border-0 shadow-none outline-none
          `}
        >
          Flir
        </button>

        <button
          onClick={() => setCurrentTab("FPV")}
          className={`w-1/2 py-3 text-center text-sm font-semibold transition-colors duration-200
            ${
              currentTab === "FPV"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }
            border-0 shadow-none outline-none
          `}
        >
          FPV
        </button>
      </div>

      {/* FPV IMAGE */}
      {currentTab === "FPV" && (
        <div className="w-full bg-white overflow-hidden mt-2">
          <img
            src="/fpv_sample.jpg"
            alt="FPV Image"
            className="w-full max-h-80 object-contain border-0 shadow-none"
          />
        </div>
      )}

      {/* FLIR IMAGE */}
      {currentTab === "Flir" && (
        <div className="w-full bg-white overflow-hidden mt-2">
          <img
            src="/flir_sample.png"
            alt="Flir Image"
            className="w-full max-h-80 object-contain border-0 shadow-none"
          />
        </div>
      )}

      <BotInfoPanel selectedBot={selectedBot} />
    </div>
  );
}

export default BotPanel;