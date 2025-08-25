
// Import Firebase v9+ SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Your web app's Firebase configuration (use the correct one)
const firebaseConfig = {
  apiKey: "AIzaSyDW7v4AexpNZ0XDGr7xQLCneWVyWXVDrAY",
  authDomain: "the-new-blue-wave-fffde.firebaseapp.com",
  projectId: "the-new-blue-wave-fffde",
  storageBucket: "the-new-blue-wave-fffde.appspot.com",
  messagingSenderId: "656391846128",
  appId: "1:656391846128:web:b66d467ffebef8ac9b6a35",
  measurementId: "G-00C9S9H2SH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
        
        // DOM elements
        const adminSection = document.getElementById('admin-section');
        const adminToggle = document.getElementById('admin-toggle');
        const notification = document.getElementById('notification');
        
        // Show notification
        function showNotification(message, isError = false) {
            notification.textContent = message;
            notification.style.background = isError ? '#dc3545' : '#0a558c';
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
        
        // Admin toggle
        adminToggle.addEventListener('click', function(e) {
            e.preventDefault();
            adminSection.style.display = adminSection.style.display === 'none' ? 'block' : 'none';
            if (adminSection.style.display === 'block') {
                loadBookings();
                loadReviewsForAdmin();
            }
        });
        
        // Admin tabs
        const adminTabs = document.querySelectorAll('.admin-tab');
        adminTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                adminTabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Hide all content
                document.querySelectorAll('.admin-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show corresponding content
                const tabName = this.getAttribute('data-tab');
                document.getElementById(`${tabName}-content`).classList.add('active');
            });
        });
        
        // Rating stars
        const stars = document.querySelectorAll('#review-stars .fa-star');
        let currentRating = 0;
        
        stars.forEach(star => {
            star.addEventListener('click', function() {
                currentRating = this.getAttribute('data-rating');
                stars.forEach(s => {
                    if (s.getAttribute('data-rating') <= currentRating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
        });
        
        // Review form submission
        const reviewForm = document.getElementById('add-review');
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('review-name').value;
            const email = document.getElementById('review-email').value;
            const text = document.getElementById('review-text').value;
            
            if (!name || !email || !text || currentRating === 0) {
                showNotification('Please complete all fields and provide a rating.', true);
                return;
            }
            
            // Save review to Firestore
            db.collection('reviews').add({
                name: name,
                email: email,
                rating: currentRating,
                text: text,
                date: new Date().toISOString(),
                approved: false // For moderation
            })
            .then(() => {
                showNotification('Thank you for your review! It will be published after moderation.');
                reviewForm.reset();
                
                // Reset stars
                stars.forEach(s => {
                    s.classList.remove('fas');
                    s.classList.add('far');
                });
                
                currentRating = 0;
            })
            .catch((error) => {
                showNotification('Error submitting review. Please try again.', true);
                console.error('Error adding review: ', error);
            });
        });
        
        // Load reviews from Firestore
        function loadReviews() {
            const reviewsGrid = document.getElementById('reviews-grid');
            reviewsGrid.innerHTML = ''; // Clear existing content
            
            db.collection('reviews')
                .where('approved', '==', true)
                .orderBy('date', 'desc')
                .limit(6)
                .get()
                .then((querySnapshot) => {
                    if (querySnapshot.empty) {
                        reviewsGrid.innerHTML = '<p>No reviews yet. Be the first to review!</p>';
                        return;
                    }
                    
                    querySnapshot.forEach((doc) => {
                        const review = doc.data();
                        const reviewCard = document.createElement('div');
                        reviewCard.className = 'review-card';
                        
                        // Generate star rating HTML
                        let starsHtml = '';
                        for (let i = 1; i <= 5; i++) {
                            starsHtml += `<i class="fas fa-star${i > review.rating ? '-half-alt' : ''}"></i>`;
                        }
                        
                        reviewCard.innerHTML = `
                            <div class="review-header">
                                <div class="review-avatar">
                                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=random" alt="${review.name}">
                                </div>
                                <div>
                                    <div class="review-name">${review.name}</div>
                                    <div class="review-rating">
                                        ${starsHtml}
                                    </div>
                                </div>
                            </div>
                            <p>${review.text}</p>
                        `;
                        
                        reviewsGrid.appendChild(reviewCard);
                    });
                })
                .catch((error) => {
                    console.error('Error loading reviews: ', error);
                    reviewsGrid.innerHTML = '<p>Error loading reviews. Please try again later.</p>';
                });
        }
        
        // Load reviews for admin
        function loadReviewsForAdmin() {
            const reviewsList = document.getElementById('reviews-list');
            reviewsList.innerHTML = ''; // Clear existing content
            
            db.collection('reviews')
                .orderBy('date', 'desc')
                .get()
                .then((querySnapshot) => {
                    if (querySnapshot.empty) {
                        reviewsList.innerHTML = '<p>No reviews yet.</p>';
                        return;
                    }
                    
                    querySnapshot.forEach((doc) => {
                        const review = doc.data();
                        const reviewItem = document.createElement('div');
                        reviewItem.className = 'review-item';
                        
                        // Format date
                        const reviewDate = new Date(review.date).toLocaleDateString();
                        
                        // Generate star rating HTML
                        let starsHtml = '';
                        for (let i = 1; i <= 5; i++) {
                            starsHtml += `<i class="fas fa-star${i > review.rating ? '-half-alt' : ''}"></i>`;
                        }
                        
                       reviewItem.innerHTML = `
    <h4>${review.name} <small>(${reviewDate})</small></h4>
    <div class="review-rating">${starsHtml}</div>
    <p>${review.text}</p>
    <p><strong>Email:</strong> ${review.email}</p>
    <p><strong>Status:</strong> ${review.approved ? 'Approved' : 'Pending'}</p>
    ${!review.approved ? `<button class="submit-btn" onclick="approveReview('${doc.id}')">Approve</button>` : ''}
    <button class="submit-btn" style="background:#dc3545;" onclick="deleteReview('${doc.id}')">Delete</button>
`;

                        
                        reviewsList.appendChild(reviewItem);
                    });
                })
                .catch((error) => {
                    console.error('Error loading reviews: ', error);
                    reviewsList.innerHTML = '<p>Error loading reviews. Please try again later.</p>';
                });
        }
        
        // Approve review
        function approveReview(reviewId) {
            db.collection('reviews').doc(reviewId).update({
                approved: true
            })
            .then(() => {
                showNotification('Review approved successfully!');
                loadReviewsForAdmin();
                loadReviews(); // Reload public reviews
            })
            .catch((error) => {
                showNotification('Error approving review. Please try again.', true);
                console.error('Error approving review: ', error);
            });
        }
        
        // Booking form submission
        const bookingForm = document.getElementById('booking-form');
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const checkIn = document.getElementById('check-in').value;
            const checkOut = document.getElementById('check-out').value;
            const adults = document.getElementById('adults').value;
            const children = document.getElementById('children').value;
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            
            if (new Date(checkIn) >= new Date(checkOut)) {
                showNotification('Check-out date must be after check-in date.', true);
                return;
            }
            
            // Save booking to Firestore
            db.collection('bookings').add({
                checkIn: checkIn,
                checkOut: checkOut,
                adults: adults,
                children: children,
                name: name,
                email: email,
                phone: phone,
                date: new Date().toISOString(),
                status: 'pending'
            })
            .then(() => {
                showNotification('Booking request submitted successfully! We will contact you shortly to confirm.');
                bookingForm.reset();
                
                // Set minimum date for check-in to today
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('check-in').setAttribute('min', today);
            })
            .catch((error) => {
                showNotification('Error submitting booking. Please try again.', true);
                console.error('Error adding booking: ', error);
            });
        });
        
        // Load bookings for admin
        function loadBookings() {
            const bookingsList = document.getElementById('bookings-list');
            bookingsList.innerHTML = ''; // Clear existing content
            
            db.collection('bookings')
                .orderBy('date', 'desc')
                .get()
                .then((querySnapshot) => {
                    if (querySnapshot.empty) {
                        bookingsList.innerHTML = '<p>No bookings yet.</p>';
                        return;
                    }
                    
                    querySnapshot.forEach((doc) => {
                        const booking = doc.data();
                        const bookingItem = document.createElement('div');
                        bookingItem.className = 'booking-item';
                        
                        // Format dates
                        const checkIn = new Date(booking.checkIn).toLocaleDateString();
                        const checkOut = new Date(booking.checkOut).toLocaleDateString();
                        const bookingDate = new Date(booking.date).toLocaleDateString();
                        
                        bookingItem.innerHTML = `
                            <h4>${booking.name} <small>(${bookingDate})</small></h4>
                            <p><strong>Dates:</strong> ${checkIn} to ${checkOut}</p>
                            <p><strong>Guests:</strong> ${booking.adults} Adults, ${booking.children} Children</p>
                            <p><strong>Contact:</strong> ${booking.email}, ${booking.phone}</p>
                            <p><strong>Status:</strong> ${booking.status}</p>
                            <button class="submit-btn" onclick="updateBookingStatus('${doc.id}', 'confirmed')">Confirm</button>
                            <button class="submit-btn" style="background: #dc3545;" onclick="updateBookingStatus('${doc.id}', 'cancelled')">Cancel</button>
                        `;
                        
                        bookingsList.appendChild(bookingItem);
                    });
                })
                .catch((error) => {
                    console.error('Error loading bookings: ', error);
                    bookingsList.innerHTML = '<p>Error loading bookings. Please try again later.</p>';
                });
        }
        
        // Update booking status
      function updateBookingStatus(bookingId, status) {
    db.collection('bookings').doc(bookingId).update({
        status: status
    })
    .then(() => {
        showNotification(`Booking ${status} successfully!`);
        loadBookings();

        // If confirmed, send email via EmailJS
        if (status === 'confirmed') {
            db.collection('bookings').doc(bookingId).get().then(doc => {
                const booking = doc.data();
                emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
                    to_email: booking.email,
                    name: booking.name,
                    checkIn: booking.checkIn,
                    checkOut: booking.checkOut
                })
                .then(() => {
                    showNotification("Confirmation email sent to guest!");
                })
                .catch((error) => {
                    console.error("Email error:", error);
                    showNotification("Booking confirmed, but failed to send email.", true);
                });
            });
        }
    })
    .catch((error) => {
        showNotification('Error updating booking. Please try again.', true);
        console.error('Error updating booking: ', error);
    });
}

        
        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            // Set minimum date for check-in to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('check-in').setAttribute('min', today);
            
            // Update check-out min date when check-in changes
            document.getElementById('check-in').addEventListener('change', function() {
                const checkInDate = this.value;
                document.getElementById('check-out').setAttribute('min', checkInDate);
            });
            
            // Load reviews
            loadReviews();
            
            // Smooth scrolling for navigation links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') return;
                    
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        });
        // --- Admin Authentication ---
let isAdminAuthenticated = false;
const ADMIN_PASSWORD = "admin123";

adminToggle.addEventListener('click', function(e) {
    e.preventDefault();

    if (!isAdminAuthenticated) {
        const enteredPassword = prompt("Enter Admin Password:");
        if (enteredPassword === ADMIN_PASSWORD) {
            isAdminAuthenticated = true;
            showNotification("Welcome, Admin!");
        } else {
            showNotification("Incorrect password.", true);
            return;
        }
    }

    adminSection.style.display = adminSection.style.display === 'none' ? 'block' : 'none';
    if (adminSection.style.display === 'block') {
        loadBookings();
        loadReviewsForAdmin();
    }
});

// --- Delete Review Function ---
function deleteReview(reviewId) {
    if (!confirm("Are you sure you want to delete this review?")) return;

    db.collection('reviews').doc(reviewId).delete()
        .then(() => {
            showNotification("Review deleted successfully!");
            loadReviewsForAdmin();
            loadReviews(); // refresh public reviews
        })
        .catch((error) => {
            showNotification("Error deleting review. Please try again.", true);
            console.error("Error deleting review: ", error);
        });
}

