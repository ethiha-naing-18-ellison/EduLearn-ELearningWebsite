# ELearning Backend API

A comprehensive .NET 8 Web API for an E-Learning platform with full CRUD operations, authentication, and advanced features.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based authorization (Student, Instructor, Admin)
- Password hashing with BCrypt
- Token validation and refresh

### 📚 Course Management
- Full CRUD operations for courses
- Course categories and organization
- Course publishing and status management
- Instructor course management
- Course search and filtering

### 👥 User Management
- User registration and login
- Profile management
- Role-based access control
- User dashboard and statistics

### 📖 Learning Management
- Lesson creation and management
- Course enrollment system
- Progress tracking
- Assignment system with submissions
- Quiz system with multiple question types
- Certificate generation

### 📊 Analytics & Reporting
- Course statistics
- Student progress tracking
- Instructor dashboard
- Enrollment analytics
- Performance metrics

## Technology Stack

- **.NET 8** - Latest .NET framework
- **Entity Framework Core** - ORM for database operations
- **SQL Server** - Database
- **JWT Bearer** - Authentication
- **AutoMapper** - Object mapping
- **BCrypt** - Password hashing
- **Swagger** - API documentation

## Project Structure

```
ELearning-Backend/
├── Controllers/          # API Controllers
├── Data/                # Database context
├── DTOs/                # Data Transfer Objects
├── Models/              # Entity models
├── Services/            # Business logic services
├── Mapping/             # AutoMapper profiles
├── Program.cs           # Application startup
├── appsettings.json     # Configuration
└── ELearning.API.csproj # Project file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/validate-token` - Token validation

### Courses
- `GET /api/courses` - Get all published courses
- `GET /api/courses/{id}` - Get course by ID
- `POST /api/courses` - Create new course
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course
- `GET /api/courses/category/{categoryId}` - Get courses by category
- `GET /api/courses/search?q={term}` - Search courses

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `GET /api/users/{id}/courses` - Get user's courses
- `GET /api/users/{id}/enrollments` - Get user's enrollments

### Enrollments
- `GET /api/enrollments/user/{userId}` - Get user enrollments
- `POST /api/enrollments/enroll` - Enroll in course
- `DELETE /api/enrollments/unenroll` - Unenroll from course
- `GET /api/enrollments/check?courseId={id}` - Check enrollment status
- `PUT /api/enrollments/status` - Update enrollment status

## Database Models

### Core Entities
- **User** - Students, instructors, and admins
- **Course** - Course information and metadata
- **Category** - Course categories
- **Lesson** - Individual lessons
- **Enrollment** - Student course enrollments
- **Assignment** - Course assignments
- **Submission** - Student assignment submissions
- **Quiz** - Course quizzes
- **QuizQuestion** - Quiz questions
- **QuizAttempt** - Student quiz attempts
- **Progress** - Student progress tracking
- **Certificate** - Course completion certificates

## Configuration

### Database Connection
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=ELearning;Database=ELearning;User Id=sa;Password=thiha1234;TrustServerCertificate=true;"
  }
}
```

### JWT Settings
```json
{
  "Jwt": {
    "Key": "ELearningSecretKey123456789012345678901234567890",
    "Issuer": "ELearningAPI",
    "Audience": "ELearningUsers",
    "ExpiryInMinutes": 60
  }
}
```

## Getting Started

### Prerequisites
- .NET 8 SDK
- SQL Server
- Visual Studio 2022 or VS Code

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ELearning-Backend
   ```

2. **Restore packages**
   ```bash
   dotnet restore
   ```

3. **Update connection string**
   - Update `appsettings.json` with your database connection string

4. **Run database migrations**
   ```bash
   dotnet ef database update
   ```

5. **Run the application**
   ```bash
   dotnet run
   ```

### API Documentation
- Swagger UI: `https://localhost:7000/swagger`
- API endpoints are documented with XML comments

## Authentication Flow

1. **Register/Login** - User provides credentials
2. **Token Generation** - Server generates JWT token
3. **Token Validation** - Client includes token in requests
4. **Authorization** - Server validates token and user permissions

## Security Features

- **Password Hashing** - BCrypt for secure password storage
- **JWT Tokens** - Stateless authentication
- **Role-based Access** - Different permissions for different user types
- **CORS Configuration** - Cross-origin request handling
- **Input Validation** - Data validation on all endpoints

## Error Handling

- **Global Exception Handling** - Centralized error management
- **HTTP Status Codes** - Proper status code responses
- **Error Messages** - User-friendly error messages
- **Logging** - Comprehensive logging for debugging

## Performance Optimizations

- **Database Indexing** - Optimized database queries
- **Entity Framework** - Efficient data access
- **Caching** - Response caching where appropriate
- **Async/Await** - Non-blocking operations

## Testing

- **Unit Tests** - Service layer testing
- **Integration Tests** - API endpoint testing
- **Database Tests** - Entity Framework testing

## Deployment

### Production Considerations
- Update connection strings
- Configure JWT secrets
- Set up HTTPS
- Configure CORS for production domains
- Set up logging and monitoring

### Docker Support
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY . .
EXPOSE 80
ENTRYPOINT ["dotnet", "ELearning.API.dll"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Roadmap

- [ ] Real-time notifications
- [ ] Video streaming integration
- [ ] Advanced analytics
- [ ] Mobile app support
- [ ] Payment integration
- [ ] Multi-language support
