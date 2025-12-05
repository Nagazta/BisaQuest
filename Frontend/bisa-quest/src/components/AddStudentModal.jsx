import React, { useState } from "react";
import "./styles/AddStudentModal.css";

const AddStudentModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    classCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (!formData.studentId.trim()) {
      setError("Student ID is required");
      return;
    }

    if (!formData.classCode.trim()) {
      setError("Class code is required");
      return;
    }

    setLoading(true);
    const result = await onSubmit({
      fullname: formData.fullName,
      studentId: formData.studentId,
      classCode: formData.classCode,
    });
    setLoading(false);

    if (result.success) {
      setCredentials({
        fullname: formData.fullName,
        studentId: formData.studentId,
        classCode: formData.classCode,
      });
      setShowCredentials(true);
    } else {
      setError(result.error || "Failed to create student");
    }
  };

  const handleCopyCredentials = () => {
    const text = `Student Login Credentials\nName: ${credentials.fullname}\nStudent ID: ${credentials.studentId}\nClass Code: ${credentials.classCode}`;
    navigator.clipboard.writeText(text);
    alert("Credentials copied to clipboard!");
  };

  const handleClose = () => {
    setShowCredentials(false);
    setFormData({ fullName: "", studentId: "", classCode: "" });
    onClose();
  };

  if (showCredentials) {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div
          className="modal-content credentials-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <h2>✓ STUDENT CREATED!</h2>

          <div className="credentials-box">
            <p>
              <strong>Name:</strong> {credentials.fullname}
            </p>
            <p>
              <strong>Student ID:</strong> {credentials.studentId}
            </p>
            <p>
              <strong>Class Code:</strong> {credentials.classCode}
            </p>
          </div>

          <div className="credentials-notice">
            Students login with Student ID + Class Code (no password needed)
          </div>

          <div className="credentials-actions">
            <button className="copy-btn" onClick={handleCopyCredentials}>
              Copy Credentials
            </button>
            <button className="close-btn" onClick={handleClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>ADD STUDENT</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Enter Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="studentId"
            placeholder="Student ID (e.g., 2024-001)"
            value={formData.studentId}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="classCode"
            placeholder="Class Code (e.g., CS101)"
            value={formData.classCode}
            onChange={handleChange}
            required
          />
          <button type="submit" className="create-btn" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
