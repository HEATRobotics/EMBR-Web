import React from 'react';
import Item from './Item';
import { RobotType } from '@/types/robot.type';

/*
TODO: on hover over the "Edit", "Create" and "Delete" buttons, show a tooltip that says not supported. Or maybe just use a gray background to indicate that they are disabled. 
*/

function BotsBar({ 
    bots, 
    selectedBot, 
    disabled, 
    setSelectedBot,
    createMissionCallback,
    deleteMissionCallback,
    startEndMissionCallback,
}: { 
    bots: RobotType[]; 
    selectedBot: RobotType | null; 
    disabled: boolean; 
    setSelectedBot: React.Dispatch<React.SetStateAction<RobotType | null>>;
    createMissionCallback: () => void;
    deleteMissionCallback: () => void;
    startEndMissionCallback: () => void;
}) {
    
    return (
        <div className="absolute flex flex-col gap-y-1 m-1 z-[10]">
            <div className="flex flex-col gap-y-2.5">
                {bots.length > 0 ? (
                    bots.map((bot) => (
                        <div
                            key={bot.id}
                            className="
                              border-1 border-black 
                              rounded-lg shadow-md px-3 py-2 
                              bg-white/20           
                              backdrop-blur-sm      
                              hover:bg-orange-500/30 
                              transition-colors duration-200 ease-in-out
                              font-semibold        
                              text-base  
                              text-white
                          "
                        >
                            <Item
                                bot={bot}
                                disabled={disabled}
                                selectedBot={selectedBot}
                                setSelectedBot={setSelectedBot}
                            />
                        </div>
                    ))
                ) : (
                    <p className="bg-white text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-md opacity-75">
                        No bots available.
                    </p>
                )}
            </div>


            <div className="inline-flex rounded-md shadow-sm overflow-hidden">
                <button
                    onClick={createMissionCallback}
                    className="bg-white text-gray-800 font-medium py-2 px-4 border-t border-b border-gray-300 hover:bg-gray-100 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                    Create Mission
                </button>
                <button
                    disabled
                    onClick={deleteMissionCallback}
                    className="bg-white text-gray-800 font-medium py-2 px-4 border border-gray-300 first:rounded-l-md last:rounded-r-md hover:bg-gray-100 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                    Delete Mission
                </button>
            </div>
            {/* 🔹 New Start/End Mission button */}
            <button
                className="w-full bg-white text-gray-800 font-medium py-2 px-4 border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 disabled:opacity-75 disabled:cursor-not-allowed"
                onClick={startEndMissionCallback}
            >
                Mission List
            </button>

        </div>

    );
}

export default BotsBar;
