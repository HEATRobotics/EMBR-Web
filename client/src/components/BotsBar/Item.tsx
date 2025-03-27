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
            className="cursor-pointer min-w-[190px] rounded-[22px] p-3.5 text-[20px] leading-6 text-center transition-all duration-300"
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
                    style={{ backgroundColor: RobotStateType[bot.state].bgColor }}
                    className="rounded-[22px] block p-3.5"
                >
                    {bot.name}
                </span>
            </Tooltip>
        </div>
    );   
}

export default Item;
