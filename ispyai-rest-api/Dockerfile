# https://hub.docker.com/_/microsoft-dotnet
FROM --platform=linux/amd64 mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /source

# copy csproj and restore as distinct layers
COPY *.sln .
COPY ispyai-rest-api/*.csproj ./ispyai-rest-api/
RUN dotnet restore

# copy everything else and build app
COPY ispyai-rest-api/. ./ispyai-rest-api/
WORKDIR /source/ispyai-rest-api
RUN dotnet publish -c release -o /app --no-restore

# final stage/image
FROM --platform=linux/amd64 mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /app
COPY --from=build /app ./
ENTRYPOINT ["dotnet", "ispyai-rest-api.dll"]