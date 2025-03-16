import React from 'react';
import Item from './Item';
import { RobotType } from '@/types/robot.type';

function BotsBar({ 
    bots, 
    activeBot, 
    disabled, 
    setActiveBot 
}: { 
    bots: RobotType[]; 
    activeBot: string | number | null; 
    disabled: boolean; 
    setActiveBot: React.Dispatch<React.SetStateAction<string | number | null>> 
}) {
    return (
        <div className="absolute py-[30px] px-[30px] flex flex-col gap-y-2.5 items-start z-[10]">
            <div className="flex flex-col gap-y-2.5">
                {bots.length > 0 ? (
                    bots.map((bot) => (
                        <Item 
                            bot={bot}
                            key={bot.id} 
                            disabled={disabled} 
                            activeBot={activeBot}
                            setActiveBot={setActiveBot}
                        />
                    ))
                ) : (
                    <p className="text-gray-500">No bots available.</p>
                )}
            </div>

            <div className="flex justify-start items-center gap-x-1">
                <button
                    disabled
                    className="left-[35px] text-[12px] leading-[15px] px-2 py-0.5 rounded-[22px] bg-white"
                >
                    Edit
                </button>
                <button
                    disabled
                    className="left-[35px] px-2 py-0.5 text-[12px] leading-[15px] rounded-[22px] bg-white"
                >
                    Create
                </button>
                <button
                    disabled
                    className="left-[35px] px-2 py-0.5 text-[12px] leading-[15px] rounded-[22px] bg-white"
                >
                    Delete
                </button>
            </div>
        </div>

    );
}

export default BotsBar;
