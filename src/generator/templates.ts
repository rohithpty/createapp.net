export const templates = {
  entity: `namespace GeneratedApp.Domain.Entities;

public class {{EntityName}}
{
{{#Properties}}
    public {{CSharpType}} {{Name}} { get; set; }
{{/Properties}}
}
`,
  dbContext: `using GeneratedApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GeneratedApp.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<{{EntityName}}> {{EntityName}}s => Set<{{EntityName}}>();
}
`,
  repositoryInterface: `using GeneratedApp.Domain.Entities;

namespace GeneratedApp.Application.Repositories;

public interface I{{EntityName}}Repository
{
    Task<List<{{EntityName}}>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<{{EntityName}}?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<{{EntityName}}> AddAsync({{EntityName}} entity, CancellationToken cancellationToken = default);
    Task UpdateAsync({{EntityName}} entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
`,
  repositoryImplementation: `using GeneratedApp.Application.Repositories;
using GeneratedApp.Domain.Entities;
using GeneratedApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GeneratedApp.Infrastructure.Repositories;

public class {{EntityName}}Repository : I{{EntityName}}Repository
{
    private readonly AppDbContext _dbContext;

    public {{EntityName}}Repository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<{{EntityName}}>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.{{EntityName}}s.AsNoTracking().ToListAsync(cancellationToken);
    }

    public async Task<{{EntityName}}?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.{{EntityName}}s.AsNoTracking().FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
    }

    public async Task<{{EntityName}}> AddAsync({{EntityName}} entity, CancellationToken cancellationToken = default)
    {
        _dbContext.{{EntityName}}s.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync({{EntityName}} entity, CancellationToken cancellationToken = default)
    {
        _dbContext.{{EntityName}}s.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.{{EntityName}}s.FindAsync([id], cancellationToken);
        if (entity is null)
        {
            return;
        }
        _dbContext.{{EntityName}}s.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
`,
  controller: `using GeneratedApp.Application.Repositories;
using GeneratedApp.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace GeneratedApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class {{EntityName}}Controller : ControllerBase
{
    private readonly I{{EntityName}}Repository _repository;

    public {{EntityName}}Controller(I{{EntityName}}Repository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<List<{{EntityName}}>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await _repository.GetAllAsync(cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<{{EntityName}}>> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await _repository.GetByIdAsync(id, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<{{EntityName}}>> Create([FromBody] {{EntityName}} entity, CancellationToken cancellationToken)
    {
        var created = await _repository.AddAsync(entity, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] {{EntityName}} entity, CancellationToken cancellationToken)
    {
        if (id != entity.Id)
        {
            return BadRequest();
        }
        await _repository.UpdateAsync(entity, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _repository.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
`,
  program: `using GeneratedApp.Application.Repositories;
using GeneratedApp.Infrastructure.Persistence;
using GeneratedApp.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("AppDb"));

builder.Services.AddScoped<I{{EntityName}}Repository, {{EntityName}}Repository>();

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();

app.Run();
`
};
