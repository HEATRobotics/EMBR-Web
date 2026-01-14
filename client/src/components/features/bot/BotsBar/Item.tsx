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
            className="text-brand-black font-medium text-center py-2 px-4 cursor-pointer select-none"
            style={{
            backgroundColor: RobotOperationalStatusType[bot.operationalStatus].bgColor,
            transition: 'filter 120ms ease',
            }}
            onClick={!disabled ? handleBotClick : () => {}}
            onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.filter = 'brightness(0.9)';
            }}
            onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1)';
            }}
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
            <span>
                {bot.name}
            </span>
            </Tooltip>
        </div>
    );   
}

export default Item;
