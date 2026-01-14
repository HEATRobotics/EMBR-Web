import React from 'react';
import Tag from '../Tag';

interface StatusIndicatorProps {
  title: string;
  status?: string;
  tag?: {
    label: string;
    url?: string;
  };
}

const getColor = (status: string): string => {
  switch (status) {
    case "Active":
      return "text-green";
    case "Moderate":
      return "text-orange";
    default:
      return "text-gray";
  }
};


const StatusIndicator: React.FC<StatusIndicatorProps> = ({ title, status, tag }) => {

  return (
    <div className={`flex ${tag && "justify-between"} items-center mt-[15px]`}>
      <div className="text-lg">
          {title}
          {status && 
            <>
              :
              <span className={getColor(status)}>
                {' '}{status}
              </span>
            </>
          }
        </div>
      {tag && 
        <Tag label={tag?.label} url={tag?.url}/>
      }
    </div>
  );
};

export default StatusIndicator;