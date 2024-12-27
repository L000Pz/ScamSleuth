FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

# Copy solution file
COPY ["*.sln", "./"]

# Copy all project files first
COPY ["Media.Presentation/*.csproj", "Media.Presentation/"]
COPY ["Media.Application/*.csproj", "Media.Application/"]
COPY ["Media.Infrastructure/*.csproj", "Media.Infrastructure/"]
COPY ["Media.Domain/*.csproj", "Media.Domain/"]
COPY ["Media.Contracts/*.csproj", "Media.Contracts/"]

# Restore packages
RUN dotnet restore "Media.Presentation/Media.Presentation.csproj"

# Copy the rest of the files
COPY . .

# Build the projects one by one to better handle dependencies
RUN dotnet build "Media.Domain/Media.Domain.csproj" -c Release
RUN dotnet build "Media.Contracts/Media.Contracts.csproj" -c Release
RUN dotnet build "Media.Application/Media.Application.csproj" -c Release
RUN dotnet build "Media.Infrastructure/Media.Infrastructure.csproj" -c Release
RUN dotnet build "Media.Presentation/Media.Presentation.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Media.Presentation/Media.Presentation.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Media.Presentation.dll"]