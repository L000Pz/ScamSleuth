FROM mcr.microsoft.com/dotnet/sdk:7.0
WORKDIR /src

# Copy the project file from the correct nested location
COPY ["Gateway.API/*.csproj", "Gateway.API/"]
RUN dotnet restore "Gateway.API/Gateway.API.csproj"

# Copy everything else
COPY . .

# Use dotnet watch for development, specify the project path
ENTRYPOINT ["dotnet", "watch", "run", "--no-restore", "--project", "Gateway.API/Gateway.API.csproj"]