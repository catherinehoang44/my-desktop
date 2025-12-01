import React, { useState } from 'react';
import axios from 'axios';

const KindMsgsForm = () => {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!note.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please write a note before submitting.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await axios.post('/api/email/send', {
        name: name.trim() || undefined,
        message: note.trim()
      });

      setSubmitStatus({ type: 'success', message: 'Message sent successfully! Thank you!' });
      setName('');
      setNote('');
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to send message. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="kind-msgs-form" onSubmit={handleSubmit}>
      <div className="kind-msgs-form-field">
        <label className="kind-msgs-form-label">(Optional) Name</label>
        <div className="kind-msgs-input-container">
          <div className="kind-msgs-input-shadow"></div>
          <input
            type="text"
            className="kind-msgs-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>
      <div className="kind-msgs-form-field">
        <label className="kind-msgs-form-label">Write a nice note :)</label>
        <div className="kind-msgs-textarea-container">
          <div className="kind-msgs-textarea-shadow"></div>
          <textarea
            className="kind-msgs-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={8}
          />
        </div>
      </div>
      <div className="kind-msgs-form-field">
        <button 
          type="submit" 
          className="kind-msgs-submit-btn"
          disabled={isSubmitting}
        >
          <span className="kind-msgs-submit-text">
            {isSubmitting ? 'SENDING...' : 'SUBMIT'}
          </span>
        </button>
        {submitStatus && (
          <div className={`kind-msgs-status ${submitStatus.type}`}>
            {submitStatus.message}
          </div>
        )}
      </div>
    </form>
  );
};

export default KindMsgsForm;

