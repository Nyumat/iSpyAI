using System.Collections;
using System.Security.Cryptography;
using System.Text;
using Amazon;
using Amazon.Batch;
using Amazon.Batch.Model;
using Amazon.Runtime;
using Amazon.Runtime.CredentialManagement;
using ispyai_rest_api.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using StackExchange.Redis;
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
    
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        
        // Configure CORS
        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });
        });

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        // if (app.Environment.IsDevelopment())
        // {
            app.UseSwagger();
            app.UseSwaggerUI();
        // }

        app.UseHttpsRedirection();
        
        // Enable CORS
        app.UseCors();
        
        // init redis connection
        var configuration = new ConfigurationOptions
        {
            EndPoints = { "redis-18674.c273.us-east-1-2.ec2.cloud.redislabs.com:18674" }, // Replace with your Redis host and port
            Password = "MNSwDR1UOlq20ucYUhfoaoW5OSHIuEnY", // Replace with your Redis password
            User = "default" // Replace with your Redis username if applicable
        };
        await using var redis = await ConnectionMultiplexer.ConnectAsync(configuration);
        var database = redis.GetDatabase();

        // this endpoint is for health check only
        app.MapGet("/", () =>
        {
            return Results.Ok("HEALTH OK");
        });

        app.MapPost("/submitJob", async (JobInput input) =>
        {
            try
            {
                // create hash of videoUrl
                string videoUrl = "your_video_url";
                SHA256 sha256 = SHA256.Create();
                byte[] bytes = Encoding.UTF8.GetBytes(videoUrl);
                byte[] hashBytes = sha256.ComputeHash(bytes);
                string videoUrlHash = BitConverter.ToString(hashBytes).Replace("-", string.Empty).ToLower();
                
                var response = await batchClient.SubmitJobAsync(new SubmitJobRequest 
                {
                    JobName = $"VideoToBlogJob-{input.userId}-{videoUrlHash}",
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
                            },
                            new KeyValuePair
                            {
                                Name = "videoUrlHash",
                                Value = videoUrlHash
                            }
                        }
                    }
                });
                
                var jobId = response.JobId;
                var jobName = response.JobName;
                
                // save userId-videoUrlHash to redis
                var redisKey = $"{input.userId}-{videoUrlHash}";
                await database.HashSetAsync(redisKey, new HashEntry[] {
                    new HashEntry("jobId", jobId),
                    new HashEntry("jobName", jobName),
                    new HashEntry("videoUrlHash", videoUrlHash),
                    new HashEntry("videoUrl", input.videoUrl),
                    new HashEntry("userId", input.userId)
                });
                // set expiration to 1 hour
                await database.KeyExpireAsync(redisKey, TimeSpan.FromHours(1));
                
                var json = new 
                {
                    jobId = jobId,
                    jobName = jobName,
                    redisKey = redisKey,
                    videoUrlHash = videoUrlHash,
                    videoUrl = input.videoUrl,
                    userId = input.userId
                };

                return Results.Created($"{jobId}", json);
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

        app.MapGet("/getJobEntries/{userId}", async (string userId) =>
        {
            // get all redis keys and data for userId
            // var redisKeys = database.Execute("return redis.call('keys', ARGV[1])", new RedisKey[] { $"{userId}-*" });
            var keys = (RedisKey[]) database.Execute("KEYS", $"{userId}-*")!;
            
            var data = new List<JobEntry>();
            
            // Iterate over the key results and retrieve their hash values
            foreach (var keyResult in keys)
            {
                var key = keyResult.ToString();
                var hashEntries = database.HashGetAll(key);
                
                var hashEntriesToJsonString = JsonConvert.SerializeObject(hashEntries);
                // var hashEntriesToJson = JsonConvert.DeserializeObject(hashEntriesToJsonString);
                // // get first element of hashEntriesToJson
                // var hashEntriesToJsonFirstElement = ((JArray) hashEntriesToJson!).First;
                
                data.Add(new JobEntry
                {
                    key = key,
                    value = hashEntriesToJsonString
                });

                Logger.LogInformation($"Hash values for key: {key}");
                foreach (HashEntry entry in hashEntries)
                {
                    Logger.LogInformation($"Field: {entry.Name}, Value: {entry.Value}");
                }
            }
            
            return Results.Ok(data);
        });

        app.Run();
    }
}

