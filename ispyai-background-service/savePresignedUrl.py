import redis

def savePresignedUrlToRedis(userId, videoUrlHash, presigned_url):
    # add element to redis
    r = redis.Redis(
        host='redis-18674.c273.us-east-1-2.ec2.cloud.redislabs.com',
        port=18674,
        username='default',
        password='MNSwDR1UOlq20ucYUhfoaoW5OSHIuEnY')
    
    redisKey = f"{userId}-{videoUrlHash}"

    # get the value of the key
    r.hset(redisKey, "presignedUrl", presigned_url)
    r.expire(redisKey, 3600)

    # disconnect from redis
    r.close()