# EduManage Pro — School Management System

EduManage Pro is a futuristic, highly animated, and fully responsive school management dashboard designed for modern educational institutions. It provides separate portals with distinct functionalities for Administrators, Teachers, and Parents, all unified under a sleek, glassmorphism-inspired UI.

## Features

### Role-Based Access
- **Administrator Portal:** Full system access. Manage students, teachers, classes, track attendance, handle fee payments, and post announcements. Features a real-time dashboard with charting and live metrics.
- **Teacher Portal:** Designed for educators to mark daily class attendance, enter examination marks, view assigned classes, and publish notices.
- **Parent Portal:** Allows parents and guardians to access their child's attendance records, academic performance results, view teacher details, and read school notices safely using an OTP-verified login.

### Key Modules
- **Dashboard & Analytics:** Real-time data visualization of weekly attendance and fee statuses.
- **Interactive Data Tables:** Advanced UI tables for tracking students, tracking fees with varying statuses (Paid, Partial, Pending), and marking batch attendance.
- **Notice Board System:** Categorized notice deployment (General, Exam, Holiday, Sports, Fee) with urgency tags.
- **Fee Management:** Robust payment recording module supporting various modes (Cash, UPI, Cheque) with live due calculation.
- **Data Import:** Administrators can import batch student data seamlessly via CSV.

### High-Level Aesthetics
- **Futuristic UI/UX:** Built with a cyberpunk/sci-fi glass panel aesthetic using vibrant neon accents (`#00f5ff`, `#7b61ff`, `#ff2d78`).
- **Engaging Animations:** Dynamic particle backgrounds, neon glow pulses on hover, custom loaders, floating alerts, and smooth panel transitions providing an immersive experience.
- **Responsive Design:** Completely mobile-supportive. The layout intelligently collapses the sidebar into a hamburger menu, stacks cards using Bootstrap 5's grid system, and makes tables horizontally scrollable to ensure usability on screens of all sizes.

## Technologies Used
- **Frontend Core:** HTML5, CSS3, JavaScript (ES6+).
- **Styling:** Vanilla CSS coupled with Bootstrap 5 (for grid structure and responsive utilities) and Bootstrap Icons.
- **Fonts:** Orbitron (brand), Rajdhani (data formatting), and Inter (body and readability text).
- **Backend/Storage:** Currently operates entirely within the browser using `sessionStorage` and `localStorage` for a zero-setup persistent demonstration.

## Setup & Run Instructions

This project requires zero build tools. It runs perfectly as static files from any standard web server.

1. Clone or download this repository.
2. Open the directory in your preferred environment.
3. Serve the directory using any local web server (e.g., VS Code Live Server, Python's `http.server`, or Node's `http-server`).
    - *Example (Python):* `python -m http.server 8000`
    - *Example (Node):* `npx serve .`
4. Navigate to `http://localhost:8000/login.html` in your web browser.

### Default Administrator Login
- **Username:** `admin`
- **Password:** `admin@123`

## Screenshots

*(You can add screenshots of your Dashboard, Login Screen, and Dark Aesthetic here before publishing)*

## License

This project is open-source. Feel free to use and modify it.
