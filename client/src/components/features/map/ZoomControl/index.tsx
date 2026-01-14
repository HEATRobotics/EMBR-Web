// components/ZoomControl.tsx
import React from 'react';

interface ZoomControlProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const ZoomControl: React.FC<ZoomControlProps> = ({ onZoomIn, onZoomOut }) => {
  return (
    <div className="flex items-center justify-center bg-darkgray rounded-full w-[45px] h-[25px] shadow-md">
      <button
        onClick={onZoomOut}
        className="text-white rounded-bl-full rounded-tl-full focus:outline-none focus:ring-0 outline-none focus:bg-red h-full w-full transition-colors duration-150 ease-in-out"
        aria-label="Zoom out"
      >
        -
      </button>
      <div className="bg-white h-6 w-px" />
      <button
        onClick={onZoomIn}
        className="text-white rounded-br-full rounded-tr-full focus:outline-none focus:ring-0 outline-none focus:bg-red h-full w-full transition-colors duration-150 ease-in-out"
        aria-label="Zoom in"
      >
        +
      </button>
    </div>
  );
};

export default ZoomControl;
