using Amazon;
using Amazon.Batch;
using Amazon.Batch.Model;
using Amazon.Runtime;
using Amazon.Runtime.CredentialManagement;
using ispyai_rest_api.Models;
using KeyValuePair = Amazon.Batch.Model.KeyValuePair;

namespace ispyai_rest_api;

public static class Program
{
    // get aws credentials
    private static readonly CredentialProfileStoreChain Chain = new();
    private static readonly AWSCredentials Credentials = null!;
    private static bool _ = Chain.TryGetAWSCredentials("aws-osuapp", out Credentials);

    // check if in development
    private static readonly bool InDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
    
    // create aws batch client
    // docs: https://docs.aws.amazon.com/sdkfornet/v3/apidocs/items/Batch/TSubmitJobRequest.html
    private static readonly AmazonBatchClient batchClient = InDevelopment ? new AmazonBatchClient(Credentials, RegionEndpoint.USWest2) : new AmazonBatchClient(RegionEndpoint.USWest2);
    
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
        // if (app.Environment.IsDevelopment())
        // {
            app.UseSwagger();
            app.UseSwaggerUI();
        // }

        app.UseHttpsRedirection();

        app.MapPost("/submitJob", async (JobInput input) =>
        {
            try
            {
                // create random 6 digit id
                var randomId = new Random().Next(100000, 999999);
                
                var response = await batchClient.SubmitJobAsync(new SubmitJobRequest 
                {
                    JobName = $"VideoToBlogJob-{input.userId}-{randomId}",
                    JobDefinition = "VideoToBlogJobDefinition:2",
                    JobQueue = "VideoToBlogJobQueue",
                    Tags = new Dictionary<string, string>
                    {
                        { "Application", "VideoToBlog" }
                    },
                    ContainerOverrides = new ContainerOverrides
                    {
                        Environment = new List<KeyValuePair>
                        {
                            new KeyValuePair
                            {
                                Name = "userId",
                                Value = input.userId
                            },
                            new KeyValuePair
                            {
                                Name = "videoUrl",
                                Value = input.videoUrl
                            }
                        }
                    }
                });
                
                var jobId = response.JobId;
                var jobName = response.JobName;
                
                return Results.Created($"{jobId}, {jobName}", response);
            }
            catch (Exception e)
            {
                // log the error
                Logger.LogError("Error: {Error}", e);
                return Results.BadRequest(new
                {
                    error = e.Message,
                    type = e.GetType().Name,
                    trace = e.StackTrace
                });
            }
        });

        app.MapGet("/getJob/{jobId}", async (string jobId) =>
        {
            try
            {
                var response = await batchClient.DescribeJobsAsync(new DescribeJobsRequest 
                {
                    Jobs = new List<string> {
                        jobId
                    }
                });
                List<JobDetail> jobs = response.Jobs;
                
                if(jobs.Count == 0)
                {
                    var ret = new
                    {
                        error = "Job not found"
                    };
                    
                    return Results.NotFound(ret);
                }
                
                var job = jobs[0];
                var jobStatus = job.Status.Value;
                
                // create json in format of { "status": "SUCCEEDED" }
                var json = new
                {
                    status = jobStatus
                };
                
                return Results.Ok(json);
            }
            catch (Exception e)
            {
                // log the error
                Logger.LogError("Error: {Error}", e);
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

