import React from 'react';

interface StatusCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'orange' | 'blue' | 'green' | 'gray';
  trend?: 'up' | 'down' | 'stable';
}

const colorClasses = {
  orange: 'bg-orange-50 border-l-4 border-orange-600 text-orange-900',
  blue: 'bg-blue-50 border-l-4 border-blue-600 text-blue-900',
  green: 'bg-green-50 border-l-4 border-green-600 text-green-900',
  gray: 'bg-gray-50 border-l-4 border-gray-400 text-gray-900',
};

const trendIcons = {
  up: '↑',
  down: '↓',
  stable: '→',
};

export default function StatusCard({
  label,
  value,
  icon,
  color = 'gray',
  trend,
}: StatusCardProps) {
  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-75">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        {icon && <div className="text-2xl opacity-50 ml-2">{icon}</div>}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20 flex items-center gap-1 text-sm">
          <span className="opacity-75">{trendIcons[trend]}</span>
          <span className="opacity-75">
            {trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable'}
          </span>
        </div>
      )}
    </div>
  );
}
