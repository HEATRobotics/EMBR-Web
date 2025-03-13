import React from 'react';

interface ToggleSwitchProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, setEnabled }) => {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
        enabled ? 'bg-red' : 'bg-darkgray'
      }`}
    >
      <span
        className={`transform transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block w-4 h-4 transform bg-white rounded-full`}
      />
    </button>
  );
};

export default ToggleSwitch;
