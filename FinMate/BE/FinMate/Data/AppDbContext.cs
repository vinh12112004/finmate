using FinMate.Models;
using Microsoft.EntityFrameworkCore;

namespace FinMate.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<User> Users => Set<User>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Goal> Goals => Set<Goal>();
    public DbSet<GoalContribution> GoalContributions => Set<GoalContribution>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Budget>()
            .Property(x => x.MonthlyBudget)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Expense>()
            .Property(x => x.Amount)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Goal>()
            .Property(x => x.TargetAmount)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<GoalContribution>()
            .Property(x => x.Amount)
            .HasColumnType("decimal(18,2)");
    }
}
