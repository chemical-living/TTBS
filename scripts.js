// Indian Cities Data
const indianCities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad",
    "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
    "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad"
];

// Transport Classes
const transportClasses = {
    train: ["Sleeper", "3AC", "2AC", "1AC", "General"],
    bus: ["Regular", "Deluxe", "AC", "Sleeper", "Volvo"]
};

// Sample Fares
const sampleFares = {
    train: {
        Sleeper: 500,
        "3AC": 1000,
        "2AC": 1500,
        "1AC": 2000,
        General: 300
    },
    bus: {
        Regular: 400,
        Deluxe: 600,
        AC: 800,
        Sleeper: 1000,
        Volvo: 1200
    }
};

// Banks for Net Banking
const banks = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Punjab National Bank"
];

// User data and bookings
let users = JSON.parse(localStorage.getItem('travelUsers')) || [];
let bookings = JSON.parse(localStorage.getItem('travelBookings')) || {};
let currentUser = null;

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout-btn');
const usernameDisplay = document.getElementById('username-display');
const sidebarLinks = document.querySelectorAll('.sidebar li');
const contentSections = document.querySelectorAll('.content-section');
const bookingForm = document.getElementById('booking-form');
const fromCitySelect = document.getElementById('from-city');
const toCitySelect = document.getElementById('to-city');
const ticketClassSelect = document.getElementById('ticket-class');
const transportTypeRadios = document.querySelectorAll('input[name="transport-type"]');
const bookingsList = document.getElementById('bookings-list');
const bookingToCancelSelect = document.getElementById('booking-to-cancel');
const confirmCancelBtn = document.getElementById('confirm-cancel');
const availabilityModal = document.getElementById('availability-modal');
const paymentModal = document.getElementById('payment-modal');
const confirmationModal = document.getElementById('confirmation-modal');
const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
const paymentForms = document.querySelectorAll('.payment-details-form');
const paymentForm = document.getElementById('payment-form');
const viewBookingBtn = document.getElementById('view-booking');

// Initialize the app
function initApp() {
    // Populate city dropdowns
    populateCities();
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('journey-date').value = today;
    
    // Event listeners for auth tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', switchAuthTab);
    });
    
    // Auth form submissions
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    
    // Logout button
    logoutBtn.addEventListener('click', handleLogout);
    
    // Sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', switchSection);
    });
    
    // Transport type change
    transportTypeRadios.forEach(radio => {
        radio.addEventListener('change', updateTicketClasses);
    });
    
    // Booking form submission
    bookingForm.addEventListener('submit', checkAvailability);
    
    // Cancel booking
    confirmCancelBtn.addEventListener('click', cancelBooking);
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
    
    // Payment method change
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', switchPaymentMethod);
    });
    
    // Payment form submission
    paymentForm.addEventListener('submit', confirmBooking);
    
    // View booking button
    viewBookingBtn.addEventListener('click', () => {
        confirmationModal.classList.remove('active');
        switchSection({ currentTarget: document.querySelector('li[data-section="my-bookings"]') });
    });
    
    // Check if user is already logged in
    const loggedInUser = localStorage.getItem('travelCurrentUser');
    if (loggedInUser) {
        currentUser = loggedInUser;
        showDashboard();
    }
}

// Populate city dropdowns
function populateCities() {
    indianCities.forEach(city => {
        const option1 = document.createElement('option');
        option1.value = city;
        option1.textContent = city;
        fromCitySelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = city;
        option2.textContent = city;
        toCitySelect.appendChild(option2);
    });
}

// Switch between login and signup tabs
function switchAuthTab(e) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    const tab = e.currentTarget.dataset.tab;
    document.getElementById(`${tab}-form`).classList.add('active');
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = username;
        localStorage.setItem('travelCurrentUser', username);
        showDashboard();
    } else {
        alert('Invalid username or password');
    }
}

// Handle signup
function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const email = document.getElementById('signup-email').value;
    
    if (users.some(u => u.username === username)) {
        alert('Username already exists');
        return;
    }
    
    users.push({ username, password, email });
    localStorage.setItem('travelUsers', JSON.stringify(users));
    
    alert('Account created successfully! Please login.');
    document.querySelector('.tab-btn[data-tab="login"]').click();
    document.getElementById('login-username').value = username;
    document.getElementById('login-password').value = '';
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('travelCurrentUser');
    authScreen.classList.add('active');
    dashboard.classList.remove('active');
}

// Show dashboard
function showDashboard() {
    authScreen.classList.remove('active');
    dashboard.classList.add('active');
    usernameDisplay.textContent = currentUser;
    
    // Load user's bookings
    loadBookings();
    
    // Show bookings section if user has bookings
    if (bookings[currentUser] && bookings[currentUser].length > 0) {
        document.querySelector('li[data-section="my-bookings"]').click();
    } else {
        document.querySelector('li[data-section="book-tickets"]').click();
    }
}

// Switch between dashboard sections
function switchSection(e) {
    sidebarLinks.forEach(link => link.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    contentSections.forEach(section => section.classList.remove('active'));
    const sectionId = e.currentTarget.dataset.section;
    document.getElementById(sectionId).classList.add('active');
    
    if (sectionId === 'my-bookings') {
        loadBookings();
    } else if (sectionId === 'cancel-booking') {
        loadCancelOptions();
    }
}

// Update ticket classes based on transport type
function updateTicketClasses() {
    const transportType = document.querySelector('input[name="transport-type"]:checked').value;
    ticketClassSelect.innerHTML = '<option value="">Select Class</option>';
    
    transportClasses[transportType].forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls;
        ticketClassSelect.appendChild(option);
    });
}

// Check ticket availability
function checkAvailability(e) {
    e.preventDefault();
    
    const transportType = document.querySelector('input[name="transport-type"]:checked').value;
    const fromCity = fromCitySelect.value;
    const toCity = toCitySelect.value;
    const journeyDate = document.getElementById('journey-date').value;
    const ticketClass = ticketClassSelect.value;
    const passengers = parseInt(document.getElementById('passengers').value);
    
    if (!fromCity || !toCity || !journeyDate || !ticketClass || !passengers) {
        alert('Please fill all fields');
        return;
    }
    
    if (fromCity === toCity) {
        alert('Source and destination cannot be same');
        return;
    }
    
    // Calculate fare
    const farePerTicket = sampleFares[transportType][ticketClass];
    const totalFare = farePerTicket * passengers;
    
    // Format date for display
    const formattedDate = new Date(journeyDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    
    // Show availability modal
    const availabilityDetails = document.getElementById('availability-details');
    availabilityDetails.innerHTML = `
        <p><strong>${transportType === 'train' ? '🚆 Train' : '🚌 Bus'}</strong> from ${fromCity} to ${toCity}</p>
        <p>Date: ${formattedDate}</p>
        <p>Class: ${ticketClass}</p>
        <p>Passengers: ${passengers}</p>
        <p class="fare">Total Fare: ₹${totalFare}</p>
    `;
    
    // Store booking details for payment
    availabilityModal.dataset.bookingDetails = JSON.stringify({
        transportType,
        fromCity,
        toCity,
        journeyDate,
        ticketClass,
        passengers,
        totalFare
    });
    
    availabilityModal.classList.add('active');
    
    // Proceed to payment button
    document.getElementById('proceed-to-payment').onclick = () => {
        availabilityModal.classList.remove('active');
        showPaymentModal(transportType, fromCity, toCity, journeyDate, ticketClass, passengers, totalFare);
    };
}

// Show payment modal
function showPaymentModal(transportType, fromCity, toCity, journeyDate, ticketClass, passengers, totalFare) {
    const paymentSummary = document.getElementById('payment-summary-details');
    
    // Format date for display
    const formattedDate = new Date(journeyDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    
    paymentSummary.innerHTML = `
        <p><strong>${transportType === 'train' ? '🚆 Train' : '🚌 Bus'}</strong> from ${fromCity} to ${toCity}</p>
        <p>Date: ${formattedDate}</p>
        <p>Class: ${ticketClass}</p>
        <p>Passengers: ${passengers}</p>
        <p class="fare">Total Fare: ₹${totalFare}</p>
    `;
    
    paymentModal.classList.add('active');
}

// Switch payment method
function switchPaymentMethod() {
    const method = document.querySelector('
