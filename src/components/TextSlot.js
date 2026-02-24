import React from 'react';

function TextSlot({ value, scriptLabel, modeId, onClick }) {
  return (
    <button
      type="button"
      className={`text-slot mode-${modeId}`}
      data-slot="true"
      onClick={onClick}
    >
      <span className="slot-value">{value}</span>
      <span className="slot-label">{scriptLabel}</span>
    </button>
  );
}

export default TextSlot;
