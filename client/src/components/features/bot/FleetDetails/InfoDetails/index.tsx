import React from 'react';
import StatusIndicator from '../StatusIndicator';
import Box from '../Box';


const InfoDetails: React.FC = () => {
  return (
    <Box title="Info">
      <StatusIndicator title="FLIR Camera" tag={{label: "view snapshots", url: "https://google.com"}} />
      <StatusIndicator title="FPV Camera" tag={{label: "view snapshots", url: "https://google.com"}} />
      <StatusIndicator title="TF Camera" tag={{label: "view snapshots", url: "https://google.com"}} />
      <StatusIndicator title="RF Transmitter" status="Moderate" />
      <StatusIndicator title="Motor Controllers" status="Active" />
    </Box>
  );
};

export default InfoDetails;
