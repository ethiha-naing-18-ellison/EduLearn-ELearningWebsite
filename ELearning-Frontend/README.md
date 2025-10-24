# E-Learning Platform Frontend

A modern, responsive React frontend for the E-Learning Platform built with Material-UI (MUI).

## 🚀 Features

### 🔐 Authentication
- **User Registration** with role selection (Student, Instructor, Admin)
- **User Login** with JWT token authentication
- **Protected Routes** for authenticated users
- **Role-based Access Control**

### 📚 Course Management
- **Browse Courses** with search and filtering
- **Course Details** with curriculum, instructor info, and reviews
- **Create Courses** (Instructors/Admins)
- **Enroll in Courses** (Students)
- **Course Progress Tracking**

### 👤 User Management
- **User Dashboard** with personalized content
- **Profile Management** with editable information
- **Role-based Navigation** and features

### 🎨 Modern UI/UX
- **Material-UI Components** for consistent design
- **Responsive Design** for all device sizes
- **Dark/Light Theme** support
- **Accessibility** compliant

## 🛠️ Technology Stack

- **React 18** - Frontend framework
- **Material-UI (MUI) 5** - UI component library
- **React Router 6** - Client-side routing
- **Axios** - HTTP client for API calls
- **Context API** - State management
- **Date-fns** - Date manipulation

## 📦 Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd ELearning-Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_APP_NAME=E-Learning Platform
```

### API Configuration
The frontend is configured to connect to the backend API at `http://localhost:5000`. Make sure your backend server is running on this port.

## 📁 Project Structure

```
ELearning-Frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   └── Layout/
│   │       └── Navbar.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── Home.js
│   │   ├── Dashboard.js
│   │   ├── Courses.js
│   │   ├── CourseDetail.js
│   │   ├── CreateCourse.js
│   │   └── Profile.js
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## 🎯 Key Components

### Authentication Context
- **AuthProvider**: Manages user authentication state
- **useAuth Hook**: Provides authentication methods and user data
- **Token Management**: Automatic token storage and refresh

### Protected Routes
- **Role-based Access**: Different features for Students, Instructors, and Admins
- **Route Guards**: Automatic redirects for unauthenticated users

### Course Management
- **Course Listing**: Search, filter, and pagination
- **Course Creation**: Rich form for instructors to create courses
- **Course Enrollment**: Students can enroll in courses
- **Progress Tracking**: Visual progress indicators

## 🔐 User Roles

### 👨‍🎓 Student
- Browse and enroll in courses
- Track learning progress
- Access course materials
- Submit assignments

### 👨‍🏫 Instructor
- Create and manage courses
- Upload course materials
- Track student progress
- Grade assignments

### 👨‍💼 Admin
- Full platform access
- User management
- Course moderation
- System analytics

## 🎨 UI/UX Features

### Responsive Design
- **Mobile-first** approach
- **Tablet and Desktop** optimized layouts
- **Touch-friendly** interactions

### Material Design
- **Consistent** component styling
- **Accessibility** features built-in
- **Theme customization** support

### User Experience
- **Intuitive navigation** with role-based menus
- **Loading states** and error handling
- **Form validation** with helpful messages
- **Success feedback** for user actions

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running on port 5000

### Development
1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Start development server**: `npm start`
4. **Open browser**: `http://localhost:3000`

### Building for Production
```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## 🔗 API Integration

The frontend integrates with the following backend endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/validate-token` - Token validation

### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (Instructors/Admins)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Enrollments
- `GET /api/enrollments` - Get user enrollments
- `POST /api/enrollments` - Enroll in course

## 🎯 Future Enhancements

### Planned Features
- **Real-time Notifications** for course updates
- **Video Player** integration for course content
- **Discussion Forums** for course interactions
- **Certificate Generation** for completed courses
- **Mobile App** using React Native

### Technical Improvements
- **State Management** with Redux Toolkit
- **Testing** with Jest and React Testing Library
- **Performance Optimization** with React.memo and useMemo
- **PWA Support** for offline functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Happy Learning! 🎓**
