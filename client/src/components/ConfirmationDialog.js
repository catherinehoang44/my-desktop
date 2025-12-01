import React from 'react';

const ConfirmationDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirmation-dialog-overlay">
      <div className="confirmation-dialog-window">
        <div className="confirmation-dialog-header">
          <span className="confirmation-dialog-title">Confirm</span>
          <button className="confirmation-dialog-close" onClick={onCancel}>×</button>
        </div>
        <div className="confirmation-dialog-content">
          <p>{message}</p>
        </div>
        <div className="confirmation-dialog-buttons">
          <button className="confirmation-dialog-btn confirmation-dialog-cancel" onClick={onCancel}>Cancel</button>
          <button className="confirmation-dialog-btn confirmation-dialog-confirm" onClick={onConfirm}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;

