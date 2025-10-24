using System.ComponentModel.DataAnnotations;

namespace ELearning.API.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        public string? ProfilePicture { get; set; }
        
        public string? Bio { get; set; }
        
        public DateTime DateOfBirth { get; set; }
        
        public string? PhoneNumber { get; set; }
        
        public string? Address { get; set; }
        
        public UserRole Role { get; set; } = UserRole.Student;
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<Course> Courses { get; set; } = new List<Course>();
        public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
        public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();
        public virtual ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();
        public virtual ICollection<Progress> Progress { get; set; } = new List<Progress>();
        public virtual ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
    }

    public enum UserRole
    {
        Student,
        Instructor,
        Admin
    }
}
