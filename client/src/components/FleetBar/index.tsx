import React from 'react';
import Item from './Item';
import { FleetItemType } from '@/types/fleet.type';

function FleetBar({ fleets, activeFleet, disabled, setActiveFleet }: { fleets: FleetItemType[]; activeFleet: string | number | null; disabled: boolean; setActiveFleet: React.Dispatch<React.SetStateAction<string | number | null>> }) {
    return (
        <div className="flex flex-col gap-y-2.5">
            {fleets.length > 0 ? (
                fleets.map((fleet) => (
                    <Item key={fleet.id} fleet={fleet} disabled={disabled} activeFleet={activeFleet} setActiveFleet={setActiveFleet} />
                ))
            ) : (
                <p className="text-gray-500">No fleets available.</p>
            )}
        </div>
    );
}

export default FleetBar;
