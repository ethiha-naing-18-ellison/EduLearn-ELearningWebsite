using Microsoft.EntityFrameworkCore;
using ELearning.API.Data;
using ELearning.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.IIS;

var builder = WebApplication.CreateBuilder(args);

// Configure file upload limits
builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = 500 * 1024 * 1024; // 500MB
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 500 * 1024 * 1024; // 500MB
    options.ValueLengthLimit = int.MaxValue;
    options.ValueCountLimit = int.MaxValue;
    options.KeyLengthLimit = int.MaxValue;
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ELearning API", Version = "v1" });
    
    // 🔒 Enable Bearer token input box in Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' followed by your token.\nExample: Bearer eyJhbGciOiJIUzI1NiIs..."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Database
builder.Services.AddDbContext<ELearningDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ILessonService, LessonService>();
builder.Services.AddScoped<IAssignmentService, AssignmentService>();
builder.Services.AddScoped<IVideoService, VideoService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "default-key"))
        };
    });

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ELearning API v1");
    c.RoutePrefix = "swagger";
});

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// Serve static files from wwwroot
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Seed database with sample data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ELearningDbContext>();
    await SeedDatabase(context);
}

app.Run();

// Database seeding method
static async Task SeedDatabase(ELearningDbContext context)
{
    try
    {
        // Check if database has any courses
        var courseCount = await context.Courses.CountAsync();
        Console.WriteLine($"Database has {courseCount} courses");
        
        if (courseCount == 0)
        {
            Console.WriteLine("No courses found. Seeding database with sample data...");
            await SeedSampleData(context);
            
            // Check again after seeding
            var newCourseCount = await context.Courses.CountAsync();
            Console.WriteLine($"After seeding: {newCourseCount} courses in database");
        }
        else
        {
            Console.WriteLine($"Database already has {courseCount} courses");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error checking database: {ex.Message}");
    }
}

static async Task SeedSampleData(ELearningDbContext context)
{
    try
    {
        // Add sample categories
        var categories = new[]
        {
            new ELearning.API.Models.Category { Name = "Programming", Description = "Learn various programming languages and frameworks", Icon = "code", Color = "#3498db", IsActive = true },
            new ELearning.API.Models.Category { Name = "Web Development", Description = "Frontend and backend web development courses", Icon = "globe", Color = "#e74c3c", IsActive = true },
            new ELearning.API.Models.Category { Name = "Data Science", Description = "Data analysis, machine learning, and AI courses", Icon = "chart", Color = "#2ecc71", IsActive = true },
            new ELearning.API.Models.Category { Name = "Design", Description = "UI/UX design, graphic design, and creative courses", Icon = "palette", Color = "#f39c12", IsActive = true },
            new ELearning.API.Models.Category { Name = "Business", Description = "Business skills, entrepreneurship, and management", Icon = "briefcase", Color = "#9b59b6", IsActive = true },
            new ELearning.API.Models.Category { Name = "Marketing", Description = "Digital marketing, SEO, and advertising courses", Icon = "megaphone", Color = "#e67e22", IsActive = true }
        };

        foreach (var category in categories)
        {
            if (!await context.Categories.AnyAsync(c => c.Name == category.Name))
            {
                context.Categories.Add(category);
            }
        }

        await context.SaveChangesAsync();
        Console.WriteLine("Sample categories added");

        // Add sample instructor
        var instructor = new ELearning.API.Models.User
        {
            Email = "instructor@elearning.com",
            FirstName = "John",
            LastName = "Smith",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            DateOfBirth = new DateTime(1985, 5, 15),
            PhoneNumber = "+1234567890",
            Address = "123 Instructor St, City, State",
            Role = ELearning.API.Models.UserRole.Instructor,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (!await context.Users.AnyAsync(u => u.Email == instructor.Email))
        {
            context.Users.Add(instructor);
            await context.SaveChangesAsync();
            Console.WriteLine("Sample instructor added");
        }

        // Get the instructor ID
        var instructorId = await context.Users
            .Where(u => u.Email == instructor.Email)
            .Select(u => u.Id)
            .FirstOrDefaultAsync();

        // Get category IDs
        var programmingCategory = await context.Categories.FirstAsync(c => c.Name == "Programming");
        var webDevCategory = await context.Categories.FirstAsync(c => c.Name == "Web Development");
        var dataScienceCategory = await context.Categories.FirstAsync(c => c.Name == "Data Science");
        var designCategory = await context.Categories.FirstAsync(c => c.Name == "Design");

        // Add sample courses
        var courses = new[]
        {
            new ELearning.API.Models.Course
            {
                Title = "Complete Web Development Bootcamp",
                Description = "Learn HTML, CSS, JavaScript, React, Node.js, and more to become a full-stack developer",
                Thumbnail = "https://via.placeholder.com/300x200?text=Web+Development",
                Price = 299.99m,
                IsFree = false,
                Level = ELearning.API.Models.CourseLevel.Beginner,
                Status = ELearning.API.Models.CourseStatus.Published,
                Duration = 120,
                Prerequisites = "Basic computer skills",
                LearningOutcomes = "Build responsive websites, Create web applications, Understand databases",
                InstructorId = instructorId,
                CategoryId = webDevCategory.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                PublishedAt = DateTime.UtcNow
            },
            new ELearning.API.Models.Course
            {
                Title = "Python for Data Science",
                Description = "Master Python programming for data analysis, machine learning, and visualization",
                Thumbnail = "https://via.placeholder.com/300x200?text=Python+Data+Science",
                Price = 199.99m,
                IsFree = false,
                Level = ELearning.API.Models.CourseLevel.Intermediate,
                Status = ELearning.API.Models.CourseStatus.Published,
                Duration = 80,
                Prerequisites = "Basic programming knowledge",
                LearningOutcomes = "Analyze data with Python, Build machine learning models, Create data visualizations",
                InstructorId = instructorId,
                CategoryId = dataScienceCategory.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                PublishedAt = DateTime.UtcNow
            },
            new ELearning.API.Models.Course
            {
                Title = "UI/UX Design Fundamentals",
                Description = "Learn design principles, user research, wireframing, and prototyping",
                Thumbnail = "https://via.placeholder.com/300x200?text=UI+UX+Design",
                Price = 149.99m,
                IsFree = false,
                Level = ELearning.API.Models.CourseLevel.Beginner,
                Status = ELearning.API.Models.CourseStatus.Published,
                Duration = 60,
                Prerequisites = "No prerequisites",
                LearningOutcomes = "Design user interfaces, Conduct user research, Create prototypes",
                InstructorId = instructorId,
                CategoryId = designCategory.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                PublishedAt = DateTime.UtcNow
            },
            new ELearning.API.Models.Course
            {
                Title = "JavaScript Fundamentals",
                Description = "Master JavaScript from basics to advanced concepts",
                Thumbnail = "https://via.placeholder.com/300x200?text=JavaScript",
                Price = 0m,
                IsFree = true,
                Level = ELearning.API.Models.CourseLevel.Beginner,
                Status = ELearning.API.Models.CourseStatus.Published,
                Duration = 40,
                Prerequisites = "Basic HTML/CSS knowledge",
                LearningOutcomes = "Write JavaScript code, Understand DOM manipulation, Build interactive websites",
                InstructorId = instructorId,
                CategoryId = programmingCategory.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                PublishedAt = DateTime.UtcNow
            }
        };

        foreach (var course in courses)
        {
            if (!await context.Courses.AnyAsync(c => c.Title == course.Title))
            {
                context.Courses.Add(course);
            }
        }

        await context.SaveChangesAsync();
        Console.WriteLine("Sample courses added successfully!");
        
        // Verify the courses were added
        var finalCourseCount = await context.Courses.CountAsync();
        Console.WriteLine($"Final course count: {finalCourseCount}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error seeding database: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
    }
}
