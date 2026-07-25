const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Only allow image uploads
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter,
});

// Server-side validation function
function validateFormData(req) {
  const errors = {};
  const { fullName, email, jobTitle, department, birthDate, bio } = req.body;

  // Full Name validation
  if (!fullName || !fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  } else if (fullName.length > 50) {
    errors.fullName = 'Full name must be 50 characters or less';
  } else if (!/^[a-zA-Z\s]+$/.test(fullName)) {
    errors.fullName = 'Full name can only contain letters and spaces';
  }

  // Email validation
  if (!email || !email.trim()) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address';
  } else if (email.length > 100) {
    errors.email = 'Email is too long';
  }

  // Job Title validation
  if (!jobTitle || !jobTitle.trim()) {
    errors.jobTitle = 'Job title is required';
  } else if (jobTitle.length > 50) {
    errors.jobTitle = 'Job title must be 50 characters or less';
  }

  // Department validation
  const validDepartments = ['engineering', 'product', 'design', 'marketing', 'operations'];
  if (!department || !validDepartments.includes(department)) {
    errors.department = 'Please select a valid department';
  }

  // Birth Date validation
  if (!birthDate) {
    errors.birthDate = 'Birth date is required';
  } else {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    if (age < 18) {
      errors.birthDate = 'You must be at least 18 years old';
    }
    
    if (age > 120) {
      errors.birthDate = 'Please enter a valid birth date';
    }
  }

  // Bio validation
  if (!bio || !bio.trim()) {
    errors.bio = 'Bio is required';
  } else if (bio.trim().length < 10) {
    errors.bio = 'Bio must be at least 10 characters';
  } else if (bio.length > 500) {
    errors.bio = 'Bio must be 500 characters or less';
  }

  // Image validation
  if (!req.file) {
    errors.profileImage = 'Profile image is required';
  }

  return errors;
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.post('/api/submit-form', upload.single('profileImage'), (req, res) => {
  try {
    // Server-side validation
    const errors = validateFormData(req);

    if (Object.keys(errors).length > 0) {
      // If there was an uploaded file, delete it since validation failed
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors,
      });
    }

    // If all validation passes, return success
    res.json({
      success: true,
      message: 'Form submitted successfully',
      data: {
        fullName: req.body.fullName,
        email: req.body.email,
        jobTitle: req.body.jobTitle,
        department: req.body.department,
        birthDate: req.body.birthDate,
        imageFileName: req.file.filename,
      },
    });

    console.log(`✅ Form submitted by ${req.body.fullName} (${req.body.email})`);
    console.log(`📁 Image saved as: ${req.file.filename}`);
  } catch (error) {
    console.error('Server error:', error);
    
    // Clean up uploaded file if there's an error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: {
          profileImage: 'Image must be smaller than 5MB',
        },
      });
    }
  }
  if (error.message === 'Only JPEG, PNG, and WebP images are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: {
        profileImage: error.message,
      },
    });
  }
  res.status(500).json({
    success: false,
    message: 'An error occurred',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadDir}`);
});
