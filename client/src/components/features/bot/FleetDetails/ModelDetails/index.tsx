import Image from 'next/image';
import React from 'react';

import robotImage from '../../../../public/robot.jpeg';
import Box from '../Box';
import StatusIndicator from '../StatusIndicator';

const ModelDetails: React.FC = () => {
  return (
    <Box title="3D model" button="view 3D model details">
      <Image src={robotImage} alt="homeImage" className="size-full mt-[20px]" />
    </Box>
  );
};

export default ModelDetails;
