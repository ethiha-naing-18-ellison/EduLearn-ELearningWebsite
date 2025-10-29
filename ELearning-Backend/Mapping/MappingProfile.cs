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

            // Video mappings
            CreateMap<Video, VideoDto>()
                .ForMember(dest => dest.VideoType, opt => opt.MapFrom(src => src.VideoType.ToString()))
                .ForMember(dest => dest.Quality, opt => opt.MapFrom(src => src.Quality.ToString()));
            CreateMap<CreateVideoDto, Video>();
            CreateMap<UpdateVideoDto, Video>();

            // Document mappings
            CreateMap<Document, DocumentDto>()
                .ForMember(dest => dest.DocumentType, opt => opt.MapFrom(src => src.DocumentType.ToString()));
            CreateMap<CreateDocumentDto, Document>();
            CreateMap<UpdateDocumentDto, Document>();

            // Submission mappings
            CreateMap<Submission, SubmissionDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));


            // Progress mappings
            CreateMap<Progress, ProgressDto>();

            // Certificate mappings
            CreateMap<Certificate, CertificateDto>();
        }
    }
}
