import classNames from 'classnames';
import React from 'react';

import { Tooltip } from 'antd';

import { RobotOperationalStatusType } from '@/constants/robotConstants';
import { RobotType } from '@/types/robot.type';

/*
TODO: Add more info to tooltip like battery level and mission progress
*/

function Item({ 
    bot, 
    selectedBot, 
    disabled, 
    setSelectedBot 
}: { 
    bot: RobotType; 
    selectedBot: RobotType | null; 
    disabled: boolean; 
    setSelectedBot: React.Dispatch<React.SetStateAction<RobotType | null>> 
}) {

    const handleBotClick = () => {
        setSelectedBot((prev) => (prev === bot ? null : bot));
    };
    
    // Generate tooltip content showing both operational health and assignment status
    const getTooltipContent = () => {
    const lines = [RobotOperationalStatusType[bot.operationalStatus].text];
        
        if (bot.assignmentStatus === "assigned") {
            lines.push("🔴 On Mission");
        } else if (bot.assignmentStatus === "ready") {
            lines.push("🟢 Ready");
        } else if (bot.assignmentStatus === "inactive") {
            lines.push("⚫ Inactive");
        }
        
        return lines.join(" • ");
    };

    return (
        <div
            className="text-gray-800 font-medium text-center py-2 px-4 first:rounded-l-md last:rounded-r-md hover:bg-gray-100 opacity-75"
            style={{ backgroundColor: RobotOperationalStatusType[bot.operationalStatus].bgColor }}
            onClick={!disabled ? handleBotClick : () => {}}
        >
            <Tooltip
                placement="rightTop"
                title={getTooltipContent()}
                color="#ffffff"
                overlayInnerStyle={{
                    color: '#000000',
                    borderRadius: '0px',
                    padding: '0px 5px',
                    minHeight: 'fit-content',
                    border: `1px solid ${RobotOperationalStatusType[bot.operationalStatus].color}`,
                }}
                arrow={undefined}
            >
                <span

                >
                    {bot.name}
                </span>
            </Tooltip>
        </div>
    );   
}

export default Item;
