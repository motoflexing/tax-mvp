const pool = require('../config/db');

const toApiApplication = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone,
  companyName: row.company_name,
  businessType: row.business_type,
  gstNumber: row.gst_number,
  city: row.city,
  state: row.state,
  message: row.message,
  status: row.status,
  createdAt: row.created_at
});

const validateApplication = (body) => {
  const errors = {};
  const required = ['fullName', 'email', 'phone'];

  required.forEach((field) => {
    if (!body[field] || String(body[field]).trim() === '') {
      errors[field] = `${field} is required`;
    }
  });

  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))) {
    errors.email = 'Valid email is required';
  }

  if (body.phone && String(body.phone).replace(/\D/g, '').length < 7) {
    errors.phone = 'Valid phone number is required';
  }

  return errors;
};

const createApplication = async (req, res, next) => {
  try {
    const errors = validateApplication(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const {
      fullName,
      email,
      phone,
      companyName = null,
      businessType = null,
      gstNumber = null,
      city = null,
      state = null,
      message = null
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO applications
        (full_name, email, phone, company_name, business_type, gst_number, city, state, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullName.trim(),
        email.trim(),
        phone.trim(),
        companyName || null,
        businessType || null,
        gstNumber || null,
        city || null,
        state || null,
        message || null
      ]
    );

    const [rows] = await pool.execute('SELECT * FROM applications WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: toApiApplication(rows[0])
    });
  } catch (error) {
    return next(error);
  }
};

const getApplications = async (_req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM applications ORDER BY created_at DESC');
    return res.json({ success: true, data: rows.map(toApiApplication) });
  } catch (error) {
    return next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM applications WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    return res.json({ success: true, data: toApiApplication(rows[0]) });
  } catch (error) {
    return next(error);
  }
};

const deleteApplication = async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM applications WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    return res.json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  deleteApplication
};
