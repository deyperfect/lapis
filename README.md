# LAPIS

A thoughtful, literary blog platform where anyone can write and share stories, essays, and ideas. Built with Vue 3 and powered by the [Blog Post API](https://github.com/deyperfect/blogpostAPI).

🔗 **Live:** [lapis-blush.vercel.app](https://lapis-blush.vercel.app)

---

## ✨ Features

- 📖 Browse and read posts from all users
- ✍️ Write and publish your own posts
- 🔐 Register and log in with JWT authentication
- 🌗 Light / dark theme toggle
- 📄 Paginated post feed
- 🛡 Admin dashboard to manage and delete posts

---

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Vue 3 (Composition API) |
| Routing | Vue Router |
| State Management | Pinia |
| HTTP Client | Axios |
| Build Tool | Vite |
| Hosting | Vercel |

---

## 📁 Project Structure

```
src/
├── api/
│   ├── api.js          # Axios Setup
│   ├── auth.js         # Auth API calls (login, register, profile)
│   └── posts.js        # Posts API calls
│   └── comments.js     # Comments API calls
├── assets/
│   └── main.css        # Global CSS
├── components/
│   ├── Admindasbhoard.vue    # Admin Dashboard component
│   ├── Createpost.vue        # Create Post component
│   ├── Home.vue              # Home Page component
│   ├── Navbar.vue            # Navbar component
│   ├── Postdetail.vue        # Post Details component
│   ├── Profile.vue           # Profile component
│   ├── Register.vue          # Register component
│   ├── Signin.vue            # Login component
│   └── Themetoggle.vue       # Dark/light toggle component
│   ├── Usetheme.js           # Theme composable
├── router/
│   └── index.js        # Vue Router config
├── stores/
│   ├── auth.js         # Auth state (Pinia)
│   └── posts.js        # Posts state (Pinia)
├── views/
│   ├── HomePage.vue          # Post feed with pagination
│   ├── LoginView.vue         # Login page
│   ├── Register.vue          # Register page
│   ├── CreatePostView.vue    # Create post page
│   ├── PostDetailView.vue    # Single post view
│   ├── CreatePostView.vue    # Create post form
│   └── AdminDashboard.vue    # Admin post management
└── App.vue
└── main.js
```

---

## 🚀 Getting Started

## 🧪 Test Credentials

Try the app using these demo accounts:

### 👤 Regular User
| Field | Value |
| --- | --- |
| Email | slowreader@example.com |
| Password | admin1234 |

### 🛡 Admin
| Field | Value |
| --- | --- |
| Email | edrylp@gmail.com |
| Password | admin1234 |

## 🛡 Admin Access

Users with `role: "admin"` in the database can access the admin dashboard at `/admin`. From there, admins can delete any post on the platform.

---

## 🔗 Related

- **Backend API:** [github.com/deyperfect/blogpostAPI](https://github.com/deyperfect/blogpostAPI)
- **API Docs:** [View on Postman](https://documenter.getpostman.com/view/51751420/2sBXcHieYs)