import { bellNotificationIcon, searchIcon } from '@/assets/icons';
import React from 'react';
import ReactGoogleAutocomplete from 'react-google-autocomplete';

function Search() {
    return (
        <div className="flex justify-end items-center gap-x-2.5">
            <div className="cursor-pointer size-[38px] flex justify-center items-center rounded-[22px] bg-white">{bellNotificationIcon}</div>
            <div className="relative">
                <div className="absolute size-[17px] top-1/2 -translate-y-1/2 left-[18px]">{searchIcon}</div>
                <ReactGoogleAutocomplete
                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                    libraries={['places']}
                    style={{ width: '90%' }}
                    className="cursor-pointer min-w-[450px] rounded-[22px] p-3.5 px-12 bg-white text-[20px] leading-6 text-black placeholder:text-gray"
                />
            </div>
        </div>
    );
}

export default Search;
