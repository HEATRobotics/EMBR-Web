import classNames from 'classnames';
import React from 'react';

import { Tooltip } from 'antd';

import { RobotStateType } from '@/constants/robotConstants';
import { RobotType } from '@/types/robot.type';

/*
TODO: Add more info to tooltip like status, mission progress and battery level
*/

function Item({ 
    bot, 
    activeBot, 
    disabled, 
    setActiveBot 
}: { 
    bot: RobotType; 
    activeBot: RobotType | null; 
    disabled: boolean; 
    setActiveBot: React.Dispatch<React.SetStateAction<RobotType | null>> 
}) {

    const handleBotClick = () => {
        setActiveBot((prev) => (prev === bot ? null : bot));
    };

    return (
        <div
            className="text-gray-800 font-medium text-center py-2 px-4 first:rounded-l-md last:rounded-r-md hover:bg-gray-100 opacity-75"
            style={{ backgroundColor: RobotStateType[bot.state].bgColor }}
            onClick={!disabled ? handleBotClick : () => {}}
        >
            <Tooltip
                placement="rightTop"
                title={RobotStateType[bot.state].text}
                color="#ffffff"
                overlayInnerStyle={{
                    color: '#000000',
                    borderRadius: '0px',
                    padding: '0px 5px',
                    minHeight: 'fit-content',
                    border: `1px solid ${RobotStateType[bot.state].color}`,
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
