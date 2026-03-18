require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- 1. Middleware (Hamesha top par) ---
app.use(express.json());
app.use(cors());

// --- 2. MongoDB Connection ---
// server.js mein connection wala part aise check karo
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ M Square Database Connected');
        await initSettings(); // Yahan call karna zaroori hai
    })
    .catch(err => console.error('❌ Connection Error:', err));
// --- 3. Database Schemas (Models) ---
const AdmissionSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    stream: { type: String, required: true },
    subject: { type: String, required: true },
    message: String,
    submittedAt: { type: Date, default: Date.now }
});

const ContactSchema = new mongoose.Schema({
    contact_subject: { type: String, required: true },
    contact_message: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now }
});

const Admission = mongoose.model('Admission', AdmissionSchema);
const Contact = mongoose.model('Contact', ContactSchema);

// --- 4. API Endpoints (Routes) ---

// Admission Form Route
// REPLACE this in your server.js
app.post('/api/admin/login', async (req, res) => {
    try {
        const { password } = req.body;

        // 1. Database se current settings (password) uthao
        const settings = await Settings.findOne(); 

        // 2. Check karo ki kya user ka input DB wale password se match ho raha hai
        if (settings && password === settings.admin_password) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: "Invalid Password" });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// Contact Form Route
app.post('/api/contact', async (req, res) => {
    try {
        const newMessage = new Contact(req.body);
        await newMessage.save();
        res.status(201).json({ success: true, message: "Message Saved!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Login Check Route
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const ADMIN_PASSWORD = process.env.ADMIN_PASS || "M2Banda2026"; 

    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Wrong Password" });
    }
});

// Saara data fetch karne ke liye (Admin Only)
app.get('/api/admin/data', async (req, res) => {
    try {
        const admissions = await Admission.find().sort({ submittedAt: -1 });
        const contacts = await Contact.find().sort({ submittedAt: -1 });
        res.json({ admissions, contacts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Data delete karne ke liye
app.delete('/api/admin/delete/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        if (type === 'admission') await Admission.findByIdAndDelete(id);
        else await Contact.findByIdAndDelete(id);
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 5. Server Start (Hamesha Last mein) ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
// 1. Password Schema
const SettingsSchema = new mongoose.Schema({
    admin_password: { type: String, default: "M2Banda2026" } // Default password
});
const Settings = mongoose.model('Settings', SettingsSchema);

// 2. Initial Setup (Agar database khali hai toh default password daalna)
async function initSettings() {
    const check = await Settings.findOne();
    if (!check) await new Settings().save();
}
initSettings();

// 3. Login Route Update (Ab DB se check karega)
app.post('/api/admin/login', async (req, res) => {
    const { password } = req.body;
    const settings = await Settings.findOne();
    if (password === settings.admin_password) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

// 4. Change Password Route (Naya Route)
app.post('/api/admin/update-password', async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const settings = await Settings.findOne();

    if (currentPassword === settings.admin_password) {
        settings.admin_password = newPassword;
        await settings.save();
        res.json({ success: true, message: "Password updated successfully!" });
    } else {
        res.status(400).json({ success: false, message: "Current password is wrong" });
    }
});