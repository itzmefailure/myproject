require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();

// --- 1. Middleware ---
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// --- 2. Database Schemas & Models ---

// Admission Schema
const AdmissionSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    stream: { type: String, required: true },
    subject: { type: String, required: true },
    message: String,
    submittedAt: { type: Date, default: Date.now }
});
const Admission = mongoose.model('Admission', AdmissionSchema);

// Contact Schema
const ContactSchema = new mongoose.Schema({
    contact_subject: { type: String, required: true },
    contact_message: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', ContactSchema);

// Settings Schema (for Admin Password)
const SettingsSchema = new mongoose.Schema({
    admin_password: { type: String, default: "M2Banda2026" }
});
const Settings = mongoose.model('Settings', SettingsSchema);

// --- 3. Helper Functions ---

// Initializes default settings if DB is empty
async function initSettings() {
    try {
        const check = await Settings.findOne();
        if (!check) {
            await new Settings().save();
            console.log('✅ Default Admin Settings Initialized');
        }
    } catch (err) {
        console.error('❌ InitSettings Error:', err);
    }
}

// --- 4. MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ M Square Database Connected');
        await initSettings(); 
    })
    .catch(err => console.error('❌ Connection Error:', err));

// --- 5. API Routes ---

// Serve Frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Submit Admission Form
app.post('/api/admissions', async (req, res) => {
    try {
        const newAdmission = new Admission(req.body);
        await newAdmission.save();
        res.status(201).json({ success: true, message: "Admission data saved!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error: Data save nahi hua" });
    }
});

// Submit Contact Form
app.post('/api/contact', async (req, res) => {
    try {
        const newContact = new Contact(req.body);
        await newContact.save();
        res.status(201).json({ success: true, message: "Contact message saved!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// Admin Login (Checks Database Password)
app.post('/api/admin/login', async (req, res) => {
    try {
        const { password } = req.body;
        const settings = await Settings.findOne();
        if (settings && password === settings.admin_password) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: "Invalid Password" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// Update Admin Password
app.post('/api/admin/update-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const settings = await Settings.findOne();

        if (currentPassword === settings.admin_password) {
            settings.admin_password = newPassword;
            await settings.save();
            res.json({ success: true, message: "Password updated successfully!" });
        } else {
            res.status(400).json({ success: false, message: "Current password is wrong" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// Fetch All Data (Admin Panel)
app.get('/api/admin/data', async (req, res) => {
    try {
        const admissions = await Admission.find().sort({ submittedAt: -1 });
        const contacts = await Contact.find().sort({ submittedAt: -1 });
        res.json({ admissions, contacts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Entry
app.delete('/api/admin/delete/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        if (type === 'admission') await Admission.findByIdAndDelete(id);
        else await Contact.findByIdAndDelete(id);
        res.json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 6. Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});