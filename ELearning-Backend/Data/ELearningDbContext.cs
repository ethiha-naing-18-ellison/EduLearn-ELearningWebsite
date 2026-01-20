using Microsoft.EntityFrameworkCore;
using ELearning.API.Models;

namespace ELearning.API.Data
{
    public class ELearningDbContext : DbContext
    {
        public ELearningDbContext(DbContextOptions<ELearningDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<Assignment> Assignments { get; set; }
        public DbSet<Submission> Submissions { get; set; }
        public DbSet<Video> Videos { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<MultipleChoice> MultipleChoices { get; set; }
        public DbSet<MultipleChoiceQuestion> MultipleChoiceQuestions { get; set; }
        public DbSet<MultipleChoiceAttempt> MultipleChoiceAttempts { get; set; }
        public DbSet<Progress> Progress { get; set; }
        public DbSet<Certificate> Certificates { get; set; }
        public DbSet<MaterialCompletion> MaterialCompletions { get; set; }
        public DbSet<FAQCategory> FAQCategories { get; set; }
        public DbSet<FAQ> FAQs { get; set; }
        public DbSet<ChatConversation> ChatConversations { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.Role).HasConversion<string>();
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Course configuration
            modelBuilder.Entity<Course>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.Price).HasColumnType("decimal(10,2)");
                entity.Property(e => e.Level).HasConversion<string>();
                entity.Property(e => e.Status).HasConversion<string>();
                entity.HasOne(e => e.Instructor)
                      .WithMany(u => u.Courses)
                      .HasForeignKey(e => e.InstructorId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Category)
                      .WithMany(c => c.Courses)
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // Category configuration
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
            });

            // Lesson configuration
            modelBuilder.Entity<Lesson>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Content).IsRequired();
                entity.Property(e => e.Type).HasConversion<string>();
                entity.HasOne(e => e.Course)
                      .WithMany(c => c.Lessons)
                      .HasForeignKey(e => e.CourseId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Enrollment configuration
            modelBuilder.Entity<Enrollment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Status).HasConversion<string>();
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Enrollments)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Course)
                      .WithMany(c => c.Enrollments)
                      .HasForeignKey(e => e.CourseId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(e => new { e.UserId, e.CourseId }).IsUnique();
            });

            // Assignment configuration
            modelBuilder.Entity<Assignment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.MaxPoints).HasColumnType("decimal(5,2)");
                entity.Property(e => e.Type).HasConversion<string>();
                entity.HasOne(e => e.Course)
                      .WithMany(c => c.Assignments)
                      .HasForeignKey(e => e.CourseId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Submission configuration
            modelBuilder.Entity<Submission>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Content).IsRequired();
                entity.Property(e => e.Score).HasColumnType("decimal(5,2)");
                entity.HasOne(e => e.Assignment)
                      .WithMany(a => a.Submissions)
                      .HasForeignKey(e => e.AssignmentId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Submissions)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });


            // Video configuration
            modelBuilder.Entity<Video>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.VideoUrl).HasMaxLength(500);
                entity.Property(e => e.VideoFile).HasMaxLength(500);
                entity.Property(e => e.Thumbnail).HasMaxLength(500);
                entity.Property(e => e.VideoType).HasConversion<string>();
                entity.Property(e => e.Quality).HasConversion<string>();
                entity.HasOne(e => e.Course)
                      .WithMany(c => c.Videos)
                      .HasForeignKey(e => e.CourseId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Document configuration
            modelBuilder.Entity<Document>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.DocumentUrl).HasMaxLength(500);
                entity.Property(e => e.DocumentFile).HasMaxLength(500);
                entity.Property(e => e.Thumbnail).HasMaxLength(500);
                entity.Property(e => e.DocumentType).HasConversion<string>();
                entity.Property(e => e.FileFormat).HasMaxLength(10);
                entity.Property(e => e.Version).HasMaxLength(20);
                entity.Property(e => e.Language).HasMaxLength(10);
                entity.Property(e => e.FileSize).HasColumnType("bigint");
                entity.HasOne(e => e.Course)
                      .WithMany(c => c.Documents)
                      .HasForeignKey(e => e.CourseId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // MultipleChoice configuration
            modelBuilder.Entity<MultipleChoice>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Instructions).HasMaxLength(1000);
                entity.HasOne(e => e.Course)
                      .WithMany(c => c.MultipleChoices)
                      .HasForeignKey(e => e.CourseId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // MultipleChoiceQuestion configuration
            modelBuilder.Entity<MultipleChoiceQuestion>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.QuestionText).IsRequired();
                entity.Property(e => e.QuestionType).IsRequired().HasMaxLength(20);
                entity.Property(e => e.OptionA).HasMaxLength(500);
                entity.Property(e => e.OptionB).HasMaxLength(500);
                entity.Property(e => e.OptionC).HasMaxLength(500);
                entity.Property(e => e.OptionD).HasMaxLength(500);
                entity.Property(e => e.CorrectAnswer).HasMaxLength(10);
                entity.HasOne(e => e.MultipleChoice)
                      .WithMany(mc => mc.Questions)
                      .HasForeignKey(e => e.MultipleChoiceId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // MultipleChoiceAttempt configuration
            modelBuilder.Entity<MultipleChoiceAttempt>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Score).HasColumnType("decimal(5,2)");
                entity.Property(e => e.TotalPoints).HasColumnType("decimal(5,2)");
                entity.Property(e => e.Percentage).HasColumnType("decimal(5,2)");
                entity.Property(e => e.Answers).IsRequired();
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.MultipleChoice)
                      .WithMany()
                      .HasForeignKey(e => e.MultipleChoiceId)
                      .OnDelete(DeleteBehavior.Cascade);
                // Ensure one attempt record per user per quiz
                entity.HasIndex(e => new { e.UserId, e.MultipleChoiceId }).IsUnique();
            });

            // Progress configuration
            modelBuilder.Entity<Progress>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CompletionPercentage).HasColumnType("decimal(5,2)");
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Progress)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Course)
                      .WithMany(c => c.Progress)
                      .HasForeignKey(e => e.CourseId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(e => new { e.UserId, e.CourseId }).IsUnique();
            });

            // Certificate configuration
            modelBuilder.Entity<Certificate>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CertificateNumber).IsRequired().HasMaxLength(50);
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Certificates)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Course)
                      .WithMany(c => c.Certificates)
                      .HasForeignKey(e => e.CourseId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // MaterialCompletion configuration
            modelBuilder.Entity<MaterialCompletion>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.MaterialType).IsRequired().HasMaxLength(50);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Course)
                      .WithMany()
                      .HasForeignKey(e => e.CourseId)
                      .OnDelete(DeleteBehavior.Cascade);
                // Unique constraint: one completion record per user per material
                entity.HasIndex(e => new { e.UserId, e.CourseId, e.MaterialType, e.MaterialId }).IsUnique();
            });

            // FAQCategory configuration
            modelBuilder.Entity<FAQCategory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Icon).HasMaxLength(255);
            });

            // FAQ configuration
            modelBuilder.Entity<FAQ>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Question).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Answer).IsRequired();
                entity.Property(e => e.Keywords).HasMaxLength(500);
                entity.HasOne(e => e.Category)
                      .WithMany(c => c.FAQs)
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // ChatConversation configuration
            modelBuilder.Entity<ChatConversation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.SessionId).IsRequired().HasMaxLength(255);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.SetNull);
                entity.HasIndex(e => e.SessionId);
            });

            // ChatMessage configuration
            modelBuilder.Entity<ChatMessage>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Message).IsRequired();
                entity.HasOne(e => e.Conversation)
                      .WithMany(c => c.Messages)
                      .HasForeignKey(e => e.ConversationId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.FAQ)
                      .WithMany(f => f.ChatMessages)
                      .HasForeignKey(e => e.FAQId)
                      .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
