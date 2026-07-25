import React, { useState, useRef } from 'react';

const FormApp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    jobTitle: '',
    department: '',
    birthDate: '',
    bio: '',
    profileImage: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    // Full Name: required, min 2 chars, max 50, letters and spaces only
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else if (formData.fullName.length > 50) {
      newErrors.fullName = 'Full name must be 50 characters or less';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
      newErrors.fullName = 'Full name can only contain letters and spaces';
    }

    // Email: required, valid email format
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email is too long';
    }

    // Job Title: required, max 50 chars
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    } else if (formData.jobTitle.length > 50) {
      newErrors.jobTitle = 'Job title must be 50 characters or less';
    }

    // Department: required, must select one
    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }

    // Birth Date: required, must be valid date, user must be 18+
    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        newErrors.birthDate = 'You must be at least 18 years old';
      }
      if (age > 120) {
        newErrors.birthDate = 'Please enter a valid birth date';
      }
    }

    // Bio: required, min 10 chars, max 500
    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.trim().length < 10) {
      newErrors.bio = 'Bio must be at least 10 characters';
    } else if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }

    // Profile Image: required, max 5MB, only images
    if (!formData.profileImage) {
      newErrors.profileImage = 'Profile image is required';
    } else {
      if (formData.profileImage.size > 5 * 1024 * 1024) {
        newErrors.profileImage = 'Image must be smaller than 5MB';
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(formData.profileImage.type)) {
        newErrors.profileImage = 'Only JPEG, PNG, and WebP images are allowed';
      }
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0] || null,
      }));
      // Clear error for this field when user selects a file
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Clear error for this field when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate on client
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fix the errors below', 'error');
      return;
    }

    setLoading(true);

    try {
      // Prepare FormData for multipart/form-data
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('email', formData.email);
      submitData.append('jobTitle', formData.jobTitle);
      submitData.append('department', formData.department);
      submitData.append('birthDate', formData.birthDate);
      submitData.append('bio', formData.bio);
      submitData.append('profileImage', formData.profileImage);

      const response = await fetch('https://form-validation-api-xxxx.onrender.com/api/submit-form', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Server validation errors
        if (data.errors && typeof data.errors === 'object') {
          setErrors(data.errors);
          showToast('Please fix the errors below', 'error');
        } else {
          showToast(data.message || 'Submission failed', 'error');
        }
      } else {
        showToast('Form submitted successfully! 🎉', 'success');
        setFormData({
          fullName: '',
          email: '',
          jobTitle: '',
          department: '',
          birthDate: '',
          bio: '',
          profileImage: null,
        });
        setErrors({});
      }
    } catch (error) {
      console.error('Submission error:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Professional Profile Form</h1>
        <p style={styles.subtitle}>Complete your profile with accurate information</p>

        {/* Toast Notification */}
        {toast && (
          <div
            style={{
              ...styles.toast,
              ...(toast.type === 'success' ? styles.toastSuccess : styles.toastError),
            }}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              style={styles.toastClose}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Full Name */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              style={{
                ...styles.input,
                ...(errors.fullName && styles.inputError),
              }}
              disabled={loading}
            />
            {errors.fullName && <span style={styles.errorText}>{errors.fullName}</span>}
          </div>

          {/* Email */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              style={{
                ...styles.input,
                ...(errors.email && styles.inputError),
              }}
              disabled={loading}
            />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}
          </div>

          {/* Job Title */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Job Title</label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="Senior Developer"
              style={{
                ...styles.input,
                ...(errors.jobTitle && styles.inputError),
              }}
              disabled={loading}
            />
            {errors.jobTitle && <span style={styles.errorText}>{errors.jobTitle}</span>}
          </div>

          {/* Department - Dropdown */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.department && styles.inputError),
              }}
              disabled={loading}
            >
              <option value="">Select a department</option>
              <option value="engineering">Engineering</option>
              <option value="product">Product</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="operations">Operations</option>
            </select>
            {errors.department && <span style={styles.errorText}>{errors.department}</span>}
          </div>

          {/* Birth Date */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Birth Date</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.birthDate && styles.inputError),
              }}
              disabled={loading}
            />
            {errors.birthDate && <span style={styles.errorText}>{errors.birthDate}</span>}
          </div>

          {/* Bio */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              style={{
                ...styles.textarea,
                ...(errors.bio && styles.inputError),
              }}
              disabled={loading}
              rows="4"
            />
            <span style={styles.charCount}>
              {formData.bio.length}/500 characters
            </span>
            {errors.bio && <span style={styles.errorText}>{errors.bio}</span>}
          </div>

          {/* Profile Image */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Profile Image</label>
            <input
              ref={fileInputRef}
              type="file"
              name="profileImage"
              onChange={handleChange}
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleFileClick}
              style={{
                ...styles.fileButton,
                ...(errors.profileImage && styles.fileButtonError),
              }}
              disabled={loading}
            >
              📸 {formData.profileImage ? 'Change Image' : 'Choose Image'}
            </button>
            {formData.profileImage && (
              <span style={styles.fileName}>{formData.profileImage.name}</span>
            )}
            <span style={styles.fileHint}>Max 5MB. JPEG, PNG, or WebP</span>
            {errors.profileImage && <span style={styles.errorText}>{errors.profileImage}</span>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(loading && styles.submitButtonLoading),
            }}
          >
            {loading ? (
              <>
                <span style={styles.spinner}>⌛</span> Submitting...
              </>
            ) : (
              'Submit Form'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    width: '100%',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  input: {
    padding: '12px 16px',
    border: '1.5px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    outline: 'none',
  },
  inputError: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  textarea: {
    padding: '12px 16px',
    border: '1.5px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'all 0.2s',
    outline: 'none',
  },
  charCount: {
    fontSize: '12px',
    color: '#999',
  },
  errorText: {
    fontSize: '13px',
    color: '#dc2626',
    fontWeight: '500',
  },
  fileButton: {
    padding: '12px 16px',
    border: '2px dashed #ddd',
    borderRadius: '8px',
    background: '#f9fafb',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#666',
  },
  fileButtonError: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
  },
  fileName: {
    fontSize: '12px',
    color: '#059669',
    fontWeight: '500',
  },
  fileHint: {
    fontSize: '12px',
    color: '#999',
  },
  submitButton: {
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  submitButtonLoading: {
    opacity: '0.7',
    cursor: 'not-allowed',
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '500',
    animation: 'slideIn 0.3s ease-out',
  },
  toastSuccess: {
    background: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #6ee7b7',
  },
  toastError: {
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
  },
  toastClose: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '0',
    marginLeft: '12px',
  },
};

export default FormApp;
