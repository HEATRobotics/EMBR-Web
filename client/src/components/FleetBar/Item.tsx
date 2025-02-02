import classNames from 'classnames';
import React from 'react';

import { Tooltip } from 'antd';

import { RobotStateType } from '@/constants/robotConstants';
import { FleetItemType } from '@/types/fleet.type';
import { RobotType } from '@/types/robot.type';


function Item({ fleet, activeFleet, disabled, setActiveFleet }: { fleet: FleetItemType; activeFleet: string | number | null; disabled: boolean; setActiveFleet: React.Dispatch<React.SetStateAction<string | number | null>> }) {
    const handleFleetClick = () => {
        setActiveFleet((prev) => (prev === fleet.id ? null : fleet.id));
    };
    return (
        <div className={classNames('cursor-pointer min-w-[190px] rounded-[22px] p-3.5 bg-white text-[20px] leading-6 hover:bg-lightgray text-center transition-all duration-300 ')} onClick={!disabled ? handleFleetClick : () => {}}>
            <div className="w-full">{fleet.name}</div>
            <div className={classNames('transition-all duration-300 ease-in-out grid overflow-hidden', fleet.id === activeFleet ? 'grid-rows-[1fr] opacity-100 mt-3.5' : 'grid-rows-[0px]  opacity-0')}>
                <div className="gap-1 flex flex-col">
                    {[]
                        .concat(...(fleet.missions.map((mission) => mission.robots ?? []) as any))
                        .filter((robot) => robot != null) // Ensure no robot is null or undefined
                        .map((robot: RobotType) => (
                            <Tooltip
                                key={robot.id}
                                placement="rightTop"
                                title={RobotStateType[robot.state].text}
                                color="#ffffff"
                                overlayInnerStyle={{ color: '#000000', borderRadius: '0px', padding: '0px 5px', minHeight: 'fit-content', border: `1px solid ${RobotStateType[robot.state].color}` }}
                                arrow={undefined}
                            >
                                <span style={{ backgroundColor: RobotStateType[robot.state].bgColor }} className="rounded-[22px]">
                                    {robot.name}
                                </span>
                            </Tooltip>
                        ))}
                </div>
            </div>
        </div>
    );
}

export default Item;
