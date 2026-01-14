import {RobotType} from "@/types/robot.type";
import {useState} from "react";
import BotInfoPanel from "@/components/features/bot/Details/BotInfo/BotInfoPanel";


function BotPanel({ selectedBot }: { selectedBot: RobotType }) {
    const [currentTab, setCurrentTab] = useState<"Flir" | "FPV">("Flir");


    return (
        <>
            <BotInfoPanel selectedBot={selectedBot}/>
        </>
    )
}

export default BotPanel;