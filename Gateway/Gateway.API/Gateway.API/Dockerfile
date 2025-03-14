FROM mcr.microsoft.com/dotnet/sdk:7.0

WORKDIR /app

# Copy just the .csproj first to leverage Docker cache
COPY Gateway.API.csproj ./

# Restore dependencies early (avoids full re-copy on small changes)
RUN dotnet restore Gateway.API.csproj

# Copy the full source code (same structure as yours)
COPY . .

# Install dotnet-watch globally for hot reload
RUN dotnet tool install --global dotnet-watch
ENV PATH="${PATH}:/root/.dotnet/tools"

# Run the Gateway using dotnet watch on port 80
CMD ["dotnet", "watch", "--project", "Gateway.API.csproj", "run", "--urls=http://0.0.0.0:80"]
