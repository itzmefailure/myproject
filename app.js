// 1. Data Object
const data = {
    'UP Board': ['Math', 'Physics', 'Chemistry', 'Biology', 'English'],
    'CBSE Board': ['Math', 'Physics', 'Chemistry', 'Biology', 'English'],
    'Competitive': ['Math', 'Reasoning', 'GK and GS'],
    'IT Field': ['Data Science', 'Full Stack Developer', 'Cyber Security', 'Generative AI', 'Robotics', 'Web Development', 'App Development']
};

// 2. Stream/Subject View Logic
function showSubjects(stream) {
    document.getElementById('stream-container').classList.add('hidden-section');
    const subjectView = document.getElementById('subject-view');
    const title = document.getElementById('selected-stream-title');
    const container = document.getElementById('subject-container');

    subjectView.classList.remove('hidden-section');
    title.innerText = stream;
    container.innerHTML = '';

    data[stream].forEach(sub => {
        const div = document.createElement('div');
        div.className = 'card-gradient p-6 rounded-xl text-center border gold-border/20';
        div.innerHTML = `<p class="font-semibold text-white">${sub}</p>`;
        container.appendChild(div);
    });
    
    subjectView.scrollIntoView({ behavior: 'smooth' });
}

function goBack() {
    document.getElementById('stream-container').classList.remove('hidden-section');
    document.getElementById('subject-view').classList.add('hidden-section');
    window.scrollTo({ top: document.getElementById('streams').offsetTop - 100, behavior: 'smooth' });
}

// 3. Mobile Menu
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
function toggleMenu() { mobileMenu.classList.add('hidden'); }

// --- 4. REAL Form Submission (Updated Fix) ---
const forms = document.querySelectorAll('form');

// यह लाइन चेक करेगी कि आप लोकल लैपटॉप पर हैं या लाइव होस्टिंग पर
const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"  // लैपटॉप के लिए (Backend Port)
    : ""; // लाइव वेबसाइट के लिए (Current Domain)

forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const loader = submitBtn.querySelector('.loader');
        
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        // स्पेलिंग ठीक की गई: admissions (s जोड़ा गया है)
        const isAdmission = form.closest('#admission');
        const endpoint = isAdmission ? '/api/admissions' : '/api/contact';

        // UI Feedback: Start Loading
        submitBtn.disabled = true;
        if(btnText) btnText.innerText = "Sending...";
        if(loader) loader.classList.remove('hidden');

        try {
            // अब यह URL अपने आप सही पोर्ट (5000) पकड़ लेगा
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json(); // सर्वर का मैसेज पढ़ने के लिए

            if(response.ok) {
                document.getElementById('success-modal').classList.remove('hidden');
                form.reset();
            } else {
                alert("Server Error: " + (result.message || "Something went wrong"));
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Connection failed! अपना Backend Server (Node.js) चेक करें।");
        } finally {
            if(loader) loader.classList.add('hidden');
            if(btnText) btnText.innerText = "Submit";
            submitBtn.disabled = false;
        }
    });
});

// 5. Modal & Scroll Animation (Same as yours, optimized)
function closeModal() {
    document.getElementById('success-modal').classList.add('hidden');
}

window.addEventListener('click', (e) => {
    if (e.target.id === 'success-modal') closeModal();
});

const revealSections = () => {
    const sections = document.querySelectorAll('section');
    const triggerBottom = window.innerHeight * 0.85;
    sections.forEach(section => {
        if (section.getBoundingClientRect().top < triggerBottom) {
            section.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealSections);
window.addEventListener('load', () => {
    document.querySelectorAll('section').forEach(s => s.classList.add('reveal'));
    revealSections(); 
});

// 6. Theme Toggle & Back to Top (Same as yours)
const themeToggleBtn = document.getElementById('theme-toggle');
if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-mode');

themeToggleBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

const backToTopBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    window.scrollY > 400 ? backToTopBtn.classList.replace('scale-0', 'scale-100') : backToTopBtn.classList.replace('scale-100', 'scale-0');
});
backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Last Updated
const lastUpdatedElement = document.getElementById('last-updated');
if (lastUpdatedElement) {
    lastUpdatedElement.innerText = "Site Last Updated: " + new Date(document.lastModified).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}
