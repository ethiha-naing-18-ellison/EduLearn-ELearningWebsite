using AutoMapper;
using ELearning.API.DTOs;
using ELearning.API.Models;
using ELearning.API.Services;

namespace ELearning.API.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));
            CreateMap<CreateUserDto, User>();
            CreateMap<UpdateUserDto, User>();

            // Course mappings
            CreateMap<Course, CourseDto>()
                .ForMember(dest => dest.Level, opt => opt.MapFrom(src => src.Level.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
            CreateMap<CreateCourseDto, Course>();
            CreateMap<UpdateCourseDto, Course>();

            // Category mappings
            CreateMap<Category, CategoryDto>();
            CreateMap<CreateCategoryDto, Category>();
            CreateMap<UpdateCategoryDto, Category>();

            // Lesson mappings
            CreateMap<Lesson, LessonDto>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));
            CreateMap<CreateLessonDto, Lesson>();
            CreateMap<UpdateLessonDto, Lesson>();

            // Enrollment mappings
            CreateMap<Enrollment, EnrollmentDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

            // Assignment mappings
            CreateMap<Assignment, AssignmentDto>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));
            CreateMap<CreateAssignmentDto, Assignment>();
            CreateMap<UpdateAssignmentDto, Assignment>();

            // Submission mappings
            CreateMap<Submission, SubmissionDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

            // Quiz mappings
            CreateMap<Quiz, QuizDto>();
            CreateMap<CreateQuizDto, Quiz>();
            CreateMap<UpdateQuizDto, Quiz>();

            // QuizQuestion mappings
            CreateMap<QuizQuestion, QuizQuestionDto>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));
            CreateMap<CreateQuizQuestionDto, QuizQuestion>();
            CreateMap<UpdateQuizQuestionDto, QuizQuestion>();

            // QuizAttempt mappings
            CreateMap<QuizAttempt, QuizAttemptDto>();

            // Progress mappings
            CreateMap<Progress, ProgressDto>();

            // Certificate mappings
            CreateMap<Certificate, CertificateDto>();
        }
    }

    // Additional DTOs for Quiz, Progress, and Certificate
    public class QuizDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TimeLimit { get; set; }
        public int MaxAttempts { get; set; }
        public bool IsRandomized { get; set; }
        public bool ShowCorrectAnswers { get; set; }
        public bool ShowResultsImmediately { get; set; }
        public decimal PassingScore { get; set; }
        public DateTime? AvailableFrom { get; set; }
        public DateTime? AvailableUntil { get; set; }
        public int CourseId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateQuizDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TimeLimit { get; set; }
        public int MaxAttempts { get; set; }
        public bool IsRandomized { get; set; }
        public bool ShowCorrectAnswers { get; set; }
        public bool ShowResultsImmediately { get; set; }
        public decimal PassingScore { get; set; }
        public DateTime? AvailableFrom { get; set; }
        public DateTime? AvailableUntil { get; set; }
    }

    public class UpdateQuizDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? TimeLimit { get; set; }
        public int? MaxAttempts { get; set; }
        public bool? IsRandomized { get; set; }
        public bool? ShowCorrectAnswers { get; set; }
        public bool? ShowResultsImmediately { get; set; }
        public decimal? PassingScore { get; set; }
        public DateTime? AvailableFrom { get; set; }
        public DateTime? AvailableUntil { get; set; }
    }

    public class QuizQuestionDto
    {
        public int Id { get; set; }
        public string Question { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = string.Empty;
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? Explanation { get; set; }
        public decimal Points { get; set; }
        public int Order { get; set; }
        public string Type { get; set; } = string.Empty;
        public int QuizId { get; set; }
    }

    public class CreateQuizQuestionDto
    {
        public string Question { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = string.Empty;
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? Explanation { get; set; }
        public decimal Points { get; set; }
        public int Order { get; set; }
        public string Type { get; set; } = string.Empty;
    }

    public class UpdateQuizQuestionDto
    {
        public string? Question { get; set; }
        public string? CorrectAnswer { get; set; }
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? Explanation { get; set; }
        public decimal? Points { get; set; }
        public int? Order { get; set; }
        public string? Type { get; set; }
    }

    public class QuizAttemptDto
    {
        public int Id { get; set; }
        public decimal Score { get; set; }
        public int TimeSpent { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public bool IsPassed { get; set; }
        public string? Answers { get; set; }
        public int UserId { get; set; }
        public int QuizId { get; set; }
    }

    public class ProgressDto
    {
        public int Id { get; set; }
        public decimal CompletionPercentage { get; set; }
        public int LessonsCompleted { get; set; }
        public int TotalLessons { get; set; }
        public int AssignmentsCompleted { get; set; }
        public int TotalAssignments { get; set; }
        public int QuizzesCompleted { get; set; }
        public int TotalQuizzes { get; set; }
        public DateTime LastAccessedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int UserId { get; set; }
        public int CourseId { get; set; }
    }

    public class CertificateDto
    {
        public int Id { get; set; }
        public string CertificateNumber { get; set; } = string.Empty;
        public string? CertificateUrl { get; set; }
        public DateTime IssuedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsValid { get; set; }
        public string? VerificationCode { get; set; }
        public int UserId { get; set; }
        public int CourseId { get; set; }
    }
}
