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
│   ├── auth.js         # Auth API calls (login, register, profile)
│   └── posts.js        # Posts API calls
├── components/
│   ├── Usetheme.js     # Theme composable
│   └── Themetoggle.vue # Dark/light toggle component
├── stores/
│   ├── auth.js         # Auth state (Pinia)
│   └── posts.js        # Posts state (Pinia)
├── views/
│   ├── Home.vue        # Post feed with pagination
│   ├── Login.vue       # Login page
│   ├── Register.vue    # Register page
│   ├── PostDetail.vue  # Single post view
│   ├── CreatePost.vue  # Create post form
│   └── AdminDashboard.vue # Admin post management
├── router/
│   └── index.js        # Vue Router config
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