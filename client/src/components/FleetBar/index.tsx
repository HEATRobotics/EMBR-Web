import React from 'react';
import Item from './Item';
import { FleetItemType } from '@/types/fleet.type';

function FleetBar({ fleets, activeFleet, disabled, setActiveFleet }: { fleets: FleetItemType[]; activeFleet: string | number | null; disabled: boolean; setActiveFleet: React.Dispatch<React.SetStateAction<string | number | null>> }) {
    return (
        <div className="flex flex-col gap-y-2.5">
            {fleets.map((fleet: FleetItemType) => (
                <Item key={fleet.id} fleet={fleet} disabled={disabled} activeFleet={activeFleet} setActiveFleet={setActiveFleet} />
            ))}
        </div>
    );
}

export default FleetBar;
