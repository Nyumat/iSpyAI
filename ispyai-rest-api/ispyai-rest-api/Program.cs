namespace ispyai_rest_api;

public static class Program
{
    // https://learn.microsoft.com/en-us/aspnet/core/fundamentals/logging/?view=aspnetcore-7.0
    private static readonly ILogger Logger = LoggerFactory.Create(config =>
    {
        config.AddConsole();
    }).CreateLogger("ispyai_rest_api");
    
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();

        app.MapGet("/submitJob", async () =>
        {
            try
            {
                return Results.Ok("Hello World!");
            }
            catch (Exception e)
            {
                // log the error
                Logger.LogError("Error: {Error}", e);
                // return json in format: { "error": "Failed to update shadow" }
                return Results.BadRequest(new
                {
                    error = e.Message,
                    type = e.GetType().Name,
                    trace = e.StackTrace
                });
            }
        });

        app.Run();
    }
}

