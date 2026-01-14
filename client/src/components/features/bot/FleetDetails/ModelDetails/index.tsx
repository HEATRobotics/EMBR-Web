import React from 'react';
import StatusIndicator from '../StatusIndicator';
import Box from '../Box';
import Image from 'next/image';
import robotImage from '../../../../public/robot.jpeg';

const ModelDetails: React.FC = () => {
  return (
    <Box title="3D model" button="view 3D model details">
      <Image src={robotImage} alt="homeImage" className="size-full mt-[20px]" />
    </Box>
  );
};

export default ModelDetails;
