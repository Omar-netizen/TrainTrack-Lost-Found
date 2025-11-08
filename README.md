TrainTrack: Lost & Found Web Application
1. Introduction

TrainTrack: Lost & Found is a web-based application designed to simplify the process of reporting and finding lost items in train stations or trains.
The platform allows users to post details of lost or found items, view other users’ reports, and use AI-based visual matching to identify similar items.
This system bridges the communication gap between passengers and authorities by creating a centralized, user-friendly solution for lost-and-found management.

2. Objectives

To provide a digital platform for reporting and tracking lost or found items.

To ensure user authentication and data security using Firebase.

To use Artificial Intelligence for image-based similarity detection between items.

To enable administrators to monitor, verify, and manage user reports effectively.

3. Technologies Used
Category	Technologies
Frontend	React.js, Tailwind CSS
Backend / Database	Firebase Authentication, Firebase Firestore
Image Hosting	ImgBB (https://imgbb.com/
)
Machine Learning	TensorFlow.js (MobileNet Model)
Admin Verification	Firestore user roles with custom rules
Deployment	Pending (to be hosted on Firebase Hosting or Vercel)
4. System Overview
User Modules

Authentication Module

Sign up, login, and logout functionalities.

Firebase Authentication integration.

Private routing for authenticated users.

Lost/Found Posting Module

Users can submit item details with image links (hosted on ImgBB).

Data stored securely in Firestore.

Dashboard Module

Displays all reported lost and found items in a grid layout.

Filtered and dynamically updated from Firestore.

Item Details & Contact Reporter

Displays full information about a selected item.

Includes “Contact Reporter” button to open an email client using mailto: link.

AI Image Matching

Uses TensorFlow.js with MobileNet to generate image embeddings.

Compares new items with existing ones using cosine similarity.

Displays top three visually similar items as “Possible Matches”.

Admin Dashboard

Admins (users with role: "admin") can view all posts and user data.

Admins can delete inappropriate or duplicate entries.

Displays key system statistics (total posts, users, lost/found ratio).

5. Firestore Security Rules

Normal users can:

Read all items.

Create or modify only their own posts.

View and update their own user document.

Admin users can:

Access all documents in items, users, and messages collections.

Delete or update any post.

Role-based access controlled using a helper isAdmin() function in Firestore rules.

6. Machine Learning Integration

The application integrates TensorFlow.js (MobileNet) to compute image embeddings for uploaded items.
Each image is converted into a vector representation, which is compared with other item embeddings using cosine similarity.
The results are displayed as “Possible Matches”, showing users items that look visually similar.
This approach is lightweight, client-side, and requires no backend computation or external API costs.

7. Folder Structure
src/
│
├── firebase.js
├── App.js
├── index.js
│
├── components/
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── Dashboard.jsx
│   ├── PostItem.jsx
│   ├── ItemCard.jsx
│   ├── ItemDetails.jsx
│   ├── PrivateRoute.jsx
│   └── AdminDashboard.jsx
│
├── layouts/
│   └── AuthLayout.jsx
│
├── utils/
│   ├── imageEmbedding.js
│   └── adminUtils.js
│
└── styles/
    └── (Tailwind CSS files)

8. Future Enhancements

Implement text-based matching using NLP embeddings for item descriptions.

Add geolocation support for nearby station detection.

Integrate push/email notifications when a potential match is found.

Deploy the application using Firebase Hosting or Vercel.

Add multi-language support for better accessibility.

9. Conclusion

TrainTrack: Lost & Found successfully demonstrates how Artificial Intelligence can enhance real-world systems for social benefit.
It provides a practical, secure, and intelligent platform that combines user-friendly design, robust authentication, and visual similarity analysis to improve lost item recovery efficiency in railway systems.

10. Credits

Project Title: TrainTrack: Lost & Found Web Application
Developed by: Md. Omar Khan

Technology Stack: React.js, Firebase, TensorFlow.js, ImgBB, Tailwind CSS
Year: 2025
