using Newtonsoft.Json.Linq;
using StackExchange.Redis;

namespace ispyai_rest_api.Models;

public class JobEntry
{
    public string key { get; set; }
    public Dictionary<string, string> value { get; set; }
}
