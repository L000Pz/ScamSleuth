FROM mcr.microsoft.com/dotnet/sdk:7.0
WORKDIR /src

# Copy csproj files for all projects in the service
COPY ["Media.Presentation/*.csproj", "Media.Presentation/"]
COPY ["Media.Application/*.csproj", "Media.Application/"]
COPY ["Media.Infrastructure/*.csproj", "Media.Infrastructure/"]
COPY ["Media.Domain/*.csproj", "Media.Domain/"]
COPY ["Media.Contracts/*.csproj", "Media.Contracts/"]

# Restore as distinct layers
RUN dotnet restore "Media.Presentation/Media.Presentation.csproj"

# Copy everything else
COPY . .

# Use dotnet watch for development
ENTRYPOINT ["dotnet", "watch", "run", "--no-restore", "--project", "Media.Presentation/Media.Presentation.csproj"]