import React from 'react';

interface FleetTitleProps {
  title: string;
}

const FleetTitle: React.FC<FleetTitleProps> = ({ title }) => {
  return (
    <div className="w-full my-4 px-7 text-center text-xl font-bold">
      <p>EMBR {title}</p>
    </div>
  );
};

export default FleetTitle;
