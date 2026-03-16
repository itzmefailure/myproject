// 1. Dependencies (Inhe hona zaruri hai)
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// 2. Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 3. Database Connection
const mongoURI = "mongodb+srv://deepaksharma0401:missionmsquare0401@cluster0.dmgwc52.mongodb.net/?appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("🚀 M Square Cloud DB is Live!"))
    .catch(err => console.log("❌ DB Error: ", err));

// 4. Database Schemas
const admissionSchema = new mongoose.Schema({
    studentName: String,
    fatherName: String,
    phone: String,
    stream: String,
    address: String,
    date: { type: Date, default: Date.now }
});

const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    date: { type: Date, default: Date.now }
});

const Admission = mongoose.model('Admission', admissionSchema);
const Contact = mongoose.model('Contact', contactSchema);

// 5. API Routes (Inhe beech mein hona chahiye)

app.post('/api/admission', async (req, res) => {
    try {
        const newAdmission = new Admission(req.body);
        await newAdmission.save();
        res.status(200).json({ success: true, message: "Admission Data Saved!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error saving data" });
    }
});

app.post('/api/contact', async (req, res) => {
    try {
        const newMessage = new Contact(req.body);
        await newMessage.save();
        res.status(200).json({ success: true, message: "Message Sent!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error sending message" });
    }
});

app.get('/api/admissions', async (req, res) => {
    try {
        const data = await Admission.find().sort({ date: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Error fetching data" });
    }
});

app.post('/api/login', (req, res) => {
    const { user, pass } = req.body;
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

// 6. STATIC FILES & CATCH-ALL (YE SABSE NICHE HONA CHAHIYE)
// Pehle API routes check honge, agar kuch match nahi hua tab ye chalega
app.use(express.static(path.join(__dirname)));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 7. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});