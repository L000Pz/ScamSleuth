FROM mcr.microsoft.com/dotnet/sdk:7.0
WORKDIR /src

# Copy csproj files for all projects in the service
COPY ["IAM.Presentation/*.csproj", "IAM.Presentation/"]
COPY ["IAM.Application/*.csproj", "IAM.Application/"]
COPY ["IAM.Infrastructure/*.csproj", "IAM.Infrastructure/"]
COPY ["IAM.Domain/*.csproj", "IAM.Domain/"]
COPY ["IAM.Contracts/*.csproj", "IAM.Contracts/"]

# Restore as distinct layers
RUN dotnet restore "IAM.Presentation/IAM.Presentation.csproj"

# Copy everything else
COPY . .

# Use dotnet watch for development
ENTRYPOINT ["dotnet", "watch", "run", "--no-restore", "--project", "IAM.Presentation/IAM.Presentation.csproj"]