# StreakSync Frontend - claude.md

## 🎯 Project Overview
StreakSync is a habit tracking app with group-based streaks, leaderboards, and integrations (LeetCode, GitHub).

**Frontend Stack**: React (Vite) + Tailwind CSS + Zustand
**Purpose**: Web interface for user authentication, group management, task completion, and streak visualization

---

## 🏗️ Project Structure

```
streaksync-frontend/
├── src/
│   ├── main.jsx                 # React entry point
│   ├── App.jsx                  # Main router & layout
│   ├── api.js                   # Axios HTTP client
│   │
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Register.jsx     # Sign up page
│   │   │   ├── Login.jsx        # Sign in page
│   │   │   └── PasswordReset.jsx
│   │   │
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx    # Main dashboard
│   │   │   ├── StreakCalendar.jsx
│   │   │   └── TaskList.jsx
│   │   │
│   │   ├── Groups/
│   │   │   ├── GroupList.jsx    # All user's groups
│   │   │   ├── GroupDetail.jsx  # Single group view
│   │   │   ├── GroupCreate.jsx  # Create new group
│   │   │   ├── Leaderboard.jsx  # Group leaderboard
│   │   │   └── InviteLink.jsx   # Join via invite
│   │   │
│   │   ├── Profile/
│   │   │   └── Profile.jsx      # User profile & stats
│   │   │
│   │   └── NotFound.jsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx       # Top navigation
│   │   │   ├── Sidebar.jsx      # Left sidebar
│   │   │   └── MainLayout.jsx   # Page wrapper
│   │   │
│   │   ├── common/
│   │   │   ├── Button.jsx       # Reusable button
│   │   │   ├── Card.jsx         # Card container
│   │   │   ├── Modal.jsx        # Modal dialog
│   │   │   ├── Toast.jsx        # Notifications
│   │   │   ├── Input.jsx        # Text input
│   │   │   └── Loading.jsx      # Spinner
│   │   │
│   │   ├── features/
│   │   │   ├── StreakBadge.jsx  # Show current streak
│   │   │   ├── TaskCard.jsx     # Individual task UI
│   │   │   ├── GroupCard.jsx    # Group preview
│   │   │   └── LeaderboardRow.jsx
│   │   │
│   │   └── forms/
│   │       ├── LoginForm.jsx
│   │       ├── RegisterForm.jsx
│   │       ├── CreateGroupForm.jsx
│   │       └── AddTaskForm.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js           # Auth state & methods
│   │   ├── useGroups.js         # Group data & methods
│   │   ├── useTasks.js          # Task data & methods
│   │   ├── useToast.js          # Toast notifications
│   │   └── useApi.js            # Generic API calls
│   │
│   ├── store/
│   │   ├── authStore.js         # Zustand: auth state
│   │   ├── groupStore.js        # Zustand: group state
│   │   ├── taskStore.js         # Zustand: task state
│   │   └── uiStore.js           # Zustand: UI state (modals, toasts)
│   │
│   ├── styles/
│   │   ├── globals.css          # Tailwind imports & custom
│   │   └── theme.css            # Color variables
│   │
│   └── utils/
│       ├── formatters.js        # Format dates, numbers
│       ├── validators.js        # Email, password validation
│       └── constants.js         # API URLs, error messages
│
├── public/
│   └── favicon.svg
│
├── .env.example
├── index.html                    # HTML entry point
├── package.json
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js
└── README.md
```

---

## 🎨 Page Breakdown

### 1. Auth Pages

#### Login Page (`/login`)
```jsx
// Layout: Centered card
// Components: LoginForm
// Fields: email, password
// Actions: 
//   - Login (POST /auth/login)
//   - Forgot password link
//   - Sign up link
// Validation: Email format, password required
```

#### Register Page (`/register`)
```jsx
// Layout: Centered card
// Components: RegisterForm
// Fields: username, email, password, confirm password
// Actions:
//   - Register (POST /auth/register)
//   - Login link
// Validation: 
//   - Username: 3-50 chars, alphanumeric + underscore
//   - Email: valid format
//   - Password: min 8 chars, mixed case, special char
```

#### Password Reset Page (`/reset-password`)
```jsx
// Step 1: Request reset (email input)
//   - POST /auth/reset-password with email
//   - Show "Check your email" message
// Step 2: Reset form (shown after email link clicked)
//   - POST /auth/reset-password/:token with new password
//   - Redirect to login on success
```

---

### 2. Dashboard Page (`/dashboard`)

#### Layout
```
┌─────────────────────────────────────┐
│         Navbar (always visible)     │
├──────────┬──────────────────────────┤
│          │                          │
│ Sidebar  │    Main Content          │
│ (Groups) │  - Streak badge          │
│          │  - Calendar heatmap      │
│          │  - Today's tasks         │
│          │  - Group list            │
│          │                          │
└──────────┴──────────────────────────┘
```

#### Components
```jsx
// Dashboard.jsx
// ├─ StreakSummary (show current/longest streak)
// ├─ StreakCalendar (GitHub-style heatmap)
// ├─ TaskListToday (list today's tasks)
// └─ GroupOverview (quick group stats)

// StreakCalendar.jsx
// - Grid of dates (past 12 weeks or ~85 days)
// - Color coding:
//   - Light green: completed
//   - Gray: missed
//   - White: future/no data
// - Hover: show "X tasks completed on [date]"

// TaskListToday.jsx
// - List all tasks due today across all groups
// - Each task shows:
//   - Name
//   - Group name
//   - Status (completed/pending)
//   - Complete button (if pending)
// - Filter by group (optional)
```

---

### 3. Groups Pages

#### Group List Page (`/groups`)
```jsx
// Layout: Grid of group cards
// Components: GroupCard, CreateGroupButton
// Shows:
//   - Group name
//   - Current streak
//   - Member count
//   - Leaderboard position
// Actions:
//   - Click card → GroupDetail
//   - Create Group button → GroupCreate
```

#### Create Group Page (`/groups/create`)
```jsx
// Layout: Form card (centered)
// Components: CreateGroupForm
// Fields:
//   - Name (required, 100 chars max)
//   - Description (optional)
//   - Visibility (radio: public/private)
//   - Tasks (add multiple tasks)
//     - Task name (required)
//     - Task type (dropdown: manual/leetcode/github)
//     - Is required (checkbox)
//     - Config (based on type)
// Actions:
//   - Create (POST /groups)
//   - Cancel (back to groups)
// Validation: Name required, at least 1 task
```

#### Group Detail Page (`/groups/:id`)
```jsx
// Layout: Two columns or tabs
// Left: Group info + members
// Right: Leaderboard + tasks
//
// Components:
//   ├─ GroupHeader (name, desc, invite button)
//   ├─ GroupTasks (list group tasks)
//   ├─ Leaderboard (ranked members)
//   └─ MemberList (thumbnails)
//
// Actions:
//   - Complete task (POST /tasks/:id/complete)
//   - Copy invite link
//   - View member profile
//   - Edit group (if owner)
```

#### Leaderboard Component
```jsx
// Table format:
// Rank | Username | Current Streak | Total Completions | View Profile
// 
// Sorted by:
//   1. Current streak (descending)
//   2. Total completions (descending)
// 
// Update: Daily (or real-time in Phase 2)
// Show: User's rank highlighted
```

#### Invite Link Page (`/join/:token`)
```jsx
// Layout: Card
// Shows:
//   - Group name
//   - Group description
//   - Member count
// Actions:
//   - Join Group (POST /groups/:id/join with token)
//   - View as guest (optional)
```

---

### 4. Profile Page (`/profile`)
```jsx
// Layout: Card-based
// Sections:
//   ├─ User Info (username, email, joined date)
//   ├─ Streak Stats
//   │   - Current streak (global)
//   │   - Longest streak (global)
//   │   - Total days completed
//   ├─ Groups Stats
//   │   - Streaks by group (table)
//   │   - Total completions by group
//   └─ Account Settings
//       - Change password
//       - Logout
//
// Actions:
//   - Edit profile (Phase 2)
//   - Change password
//   - Logout
```

---

## 🎣 Custom Hooks

### useAuth
```javascript
const useAuth = () => {
  // Returns:
  // - user: { id, username, email, created_at }
  // - isAuthenticated: bool
  // - loading: bool
  // - register: (username, email, password) → Promise
  // - login: (email, password) → Promise
  // - logout: () → void
  // - resetPassword: (email) → Promise
}
```

### useGroups
```javascript
const useGroups = () => {
  // Returns:
  // - groups: Group[]
  // - loading: bool
  // - getGroups: () → Promise
  // - getGroupDetail: (id) → Promise
  // - createGroup: (data) → Promise
  // - joinGroup: (id, token) → Promise
  // - getLeaderboard: (id) → Promise
}
```

### useTasks
```javascript
const useTasks = () => {
  // Returns:
  // - tasks: Task[]
  // - loading: bool
  // - getTodaysTasks: () → Promise
  // - completeTask: (id) → Promise
  // - getStreakCalendar: () → Promise
}
```

### useToast
```javascript
const useToast = () => {
  // Returns:
  // - showToast: (message, type) → void
  //   type: 'success' | 'error' | 'info' | 'warning'
  // - showSuccess: (message) → void
  // - showError: (message) → void
}
```

### useApi
```javascript
const useApi = (url, options) => {
  // Returns:
  // - data: any
  // - loading: bool
  // - error: Error | null
  // - refetch: () → Promise
}
```

---

## 🏪 Zustand Store Structure

### authStore
```javascript
{
  user: { id, username, email, created_at } | null,
  token: string | null,
  isAuthenticated: bool,
  
  setUser: (user) => void,
  setToken: (token) => void,
  logout: () => void,
  clearAuth: () => void
}
```

### groupStore
```javascript
{
  groups: Group[],
  currentGroup: Group | null,
  leaderboard: Member[],
  
  setGroups: (groups) => void,
  setCurrentGroup: (group) => void,
  setLeaderboard: (members) => void,
  addGroup: (group) => void,
  updateGroup: (id, group) => void
}
```

### taskStore
```javascript
{
  todaysTasks: Task[],
  streakCalendar: { date: string, status: 'completed' | 'missed' }[],
  
  setTodaysTasks: (tasks) => void,
  setStreakCalendar: (calendar) => void,
  updateTaskStatus: (taskId, status) => void
}
```

### uiStore
```javascript
{
  toasts: Toast[],
  modals: { [key: string]: bool },
  
  addToast: (toast) => void,
  removeToast: (id) => void,
  openModal: (key) => void,
  closeModal: (key) => void
}
```

---

## 🛣️ Routing Setup

```jsx
// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const router = (
  <BrowserRouter>
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<PasswordReset />} />
      <Route path="/join/:token" element={<InviteLink />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/groups" element={<GroupList />} />
        <Route path="/groups/create" element={<GroupCreate />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
```

---

## 🎨 Tailwind Theme

### Colors
```css
/* Primary */
--color-primary: #4F46E5      /* Indigo */
--color-primary-light: #E0E7FF

/* Success */
--color-success: #10B981      /* Green */
--color-success-light: #D1FAE5

/* Danger */
--color-danger: #EF4444       /* Red */
--color-danger-light: #FEE2E2

/* Gray */
--color-gray: #6B7280
--color-gray-light: #F3F4F6
--color-gray-dark: #1F2937

/* Streak Calendar */
--color-contribution-0: #EBEDF0    /* Empty */
--color-contribution-1: #C6E48B    /* Light green */
--color-contribution-2: #7BC96F    /* Medium */
--color-contribution-3: #239A3B    /* Dark green */
--color-contribution-4: #196127    /* Very dark */
```

### Component Sizing
```css
/* Buttons */
--btn-height: 40px
--btn-padding: 10px 20px

/* Cards */
--card-padding: 20px
--card-radius: 8px

/* Typography */
--h1: 32px bold
--h2: 24px bold
--h3: 20px bold
--body: 16px normal
--small: 14px normal
```

---

## 📡 API Integration (api.js)

```javascript
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                 'http://localhost:8000/api/v1';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Auto-add JWT token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired)
client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export methods
export const api = {
  // Auth
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  resetPassword: (email) => client.post('/auth/reset-password', { email }),
  
  // User
  getMe: () => client.get('/users/me'),
  getDashboard: () => client.get('/users/dashboard'),
  
  // Groups
  getGroups: () => client.get('/groups'),
  getGroup: (id) => client.get(`/groups/${id}`),
  createGroup: (data) => client.post('/groups', data),
  joinGroup: (id, token) => client.post(`/groups/${id}/join`, { invite_token: token }),
  getInvite: (id) => client.post(`/groups/${id}/invite`),
  
  // Tasks
  getTodaysTasks: () => client.get('/tasks/today'),
  completeTask: (id) => client.post(`/tasks/${id}/complete`, { status: 'completed' })
};
```

---

## 🧪 Form Validation

### Validators
```javascript
validators.email = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

validators.password = (password) => {
  return password.length >= 8 &&
         /[a-z]/.test(password) &&
         /[A-Z]/.test(password) &&
         /[0-9]/.test(password)
}

validators.username = (username) => {
  return username.length >= 3 &&
         username.length <= 50 &&
         /^[a-zA-Z0-9_]+$/.test(username)
}
```

---

## 🎯 Key Implementation Notes

1. **Auth Flow**:
   - Store JWT in localStorage
   - Check token expiry before every API call
   - Auto-redirect to login on 401 error
   
2. **State Management**:
   - Use Zustand for global state
   - Use React hooks for component-local state
   - Sync localStorage with authStore
   
3. **Error Handling**:
   - Show toast for every error
   - Provide clear, user-friendly messages
   - Log errors to console in dev
   
4. **Loading States**:
   - Show spinner while fetching
   - Disable buttons while submitting
   - Optimistic updates where possible
   
5. **Streak Calendar**:
   - Show past 12 weeks (84 days)
   - Use GitHub-style colors
   - Tooltip on hover with completion count
   
6. **Responsive Design**:
   - Mobile-first approach
   - Breakpoints: sm (640px), md (768px), lg (1024px)
   - Stack layout on mobile, side-by-side on desktop

---

## 📱 Mobile Considerations (Phase 2)

- Sidebar → collapsible hamburger menu
- Cards → full-width on mobile
- Leaderboard table → vertical layout on mobile
- Forms → larger touch targets (44px minimum)
- Calendar → horizontal scroll or paginated

---

## ✅ Implementation Checklist (Phase 1)

### Pages
- [ ] Login & Register pages
- [ ] Dashboard with calendar & tasks
- [ ] Group list & detail pages
- [ ] Create group page
- [ ] Leaderboard component
- [ ] Profile page
- [ ] Invite link page

### Components
- [ ] Button, Card, Modal, Input, Toast
- [ ] StreakBadge, TaskCard, GroupCard
- [ ] StreakCalendar heatmap
- [ ] LeaderboardTable

### Hooks & Store
- [ ] useAuth, useGroups, useTasks, useToast
- [ ] Zustand stores (auth, groups, tasks, ui)
- [ ] ProtectedRoute wrapper

### Features
- [ ] Register & Login flow
- [ ] Token persistence & refresh
- [ ] Logout functionality
- [ ] Create & join groups
- [ ] Complete tasks
- [ ] View streak calendar
- [ ] View leaderboard
- [ ] Form validation

---

## 🔗 Environment Variables

```
# .env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=StreakSync
```

---

## 📞 Development Tips

### Debug API Calls
```javascript
// Open Network tab in DevTools
// Look for XHR requests to see request/response
// Check localStorage for token: console.log(localStorage.getItem('token'))
```

### Debug State
```javascript
// Install Redux DevTools extension
// Or log Zustand store: store.subscribe(state => console.log(state))
```

### Styling Issues
```javascript
// Check Tailwind config: tailwind.config.js
// Verify class names are correct
// Use Tailwind intellisense VSCode extension
```

---

**Version**: 1.0 | **Last Updated**: March 2025