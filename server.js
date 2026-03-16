// Import Dependencies
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 1. Database Connection (MongoDB)
// Yahan aap apna MongoDB Atlas connection string ya local DB use kar sakte hain
// server.js update
// server.js mein purani link ko isse badal dein
const mongoURI = "mongodb+srv://deepaksharma0401:missionmsquare0401@cluster0.dmgwc52.mongodb.net/?appName=Cluster0";



mongoose.connect(mongoURI)
    .then(() => console.log("🚀 M Square Cloud DB is Live!"))
    .catch(err => console.log("❌ DB Error: ", err));

mongoose.connect(mongoURI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.log("❌ DB Connection Error:", err));

// 2. Database Schemas (Structure)

// Admission Schema
const admissionSchema = new mongoose.Schema({
    studentName: String,
    fatherName: String,
    phone: String,
    stream: String,
    address: String,
    date: { type: Date, default: Date.now }
});

// Contact Schema
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    date: { type: Date, default: Date.now }
});

const Admission = mongoose.model('Admission', admissionSchema);
const Contact = mongoose.model('Contact', contactSchema);

// 3. API Routes

// Route for Admission Form
app.post('/api/admission', async (req, res) => {
    try {
        const newAdmission = new Admission(req.body);
        await newAdmission.save();
        res.status(200).json({ success: true, message: "Admission Data Saved!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error saving data" });
    }
});

// Route for Contact Form
app.post('/api/contact', async (req, res) => {
    try {
        const newMessage = new Contact(req.body);
        await newMessage.save();
        res.status(200).json({ success: true, message: "Message Sent!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error sending message" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// Add these routes to your existing server.js

// Get all Admissions
app.get('/api/admissions', async (req, res) => {
    try {
        const data = await Admission.find().sort({ date: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Error fetching data" });
    }
});

// Get all Contact Messages
app.get('/api/contacts', async (req, res) => {
    try {
        const data = await Contact.find().sort({ date: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Error fetching data" });
    }
});
// Add this to your server.js

app.post('/api/login', (req, res) => {
    const { user, pass } = req.body;

    // Credentials (Inhe aap environment variables mein bhi rakh sakte hain)
    const admins = [
        { username: 'deepak', password: 'msquare@deepak' },
        { username: 'shubhanshu', password: 'msquare@shubhanshu' }
    ];

    const isAdmin = admins.find(a => a.username === user && a.password === pass);

    if (isAdmin) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Aap authorized nahi hain!" });
    }
});