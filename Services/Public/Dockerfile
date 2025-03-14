FROM mcr.microsoft.com/dotnet/sdk:7.0

# Set working directory
WORKDIR /app

# Copy only .csproj files first to layer caching
COPY Public.Presentation/*.csproj ./Public.Presentation/
COPY Public.Application/*.csproj ./Public.Application/
COPY Public.Infrastructure/*.csproj ./Public.Infrastructure/
COPY Public.Domain/*.csproj ./Public.Domain/

# Restore NuGet packages (separate layer to avoid re-downloading every time)
RUN dotnet restore Public.Presentation/Public.Presentation.csproj

# Now copy the rest of the source code
COPY . .

# Install dotnet-watch (dev hot reload tool)
RUN dotnet tool install --global dotnet-watch
ENV PATH="${PATH}:/root/.dotnet/tools"

# Run the app with hot reload
CMD ["dotnet", "watch", "--project", "Public.Presentation/Public.Presentation.csproj", "run", "--urls=http://0.0.0.0:80"]
