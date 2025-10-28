using Four_in_row_api.Hubs;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder =>
        {
            builder.WithOrigins("http://localhost:5173")
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowCredentials(); 
        });
});

builder.Services.AddSignalR();
var app = builder.Build();
app.UseCors("AllowReactApp");
app.UseRouting();
app.UseEndpoints(endpoints =>
{
    endpoints.MapHub<GameHub>("/gameHub");
});
app.Run();