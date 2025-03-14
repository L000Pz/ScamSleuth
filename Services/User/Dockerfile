FROM mcr.microsoft.com/dotnet/sdk:7.0

WORKDIR /app

COPY User.Presentation/*.csproj ./User.Presentation/
COPY User.Application/*.csproj ./User.Application/
COPY User.Infrastructure/*.csproj ./User.Infrastructure/
COPY User.Domain/*.csproj ./User.Domain/

RUN dotnet restore User.Presentation/User.Presentation.csproj

COPY . .

RUN dotnet tool install --global dotnet-watch
ENV PATH="${PATH}:/root/.dotnet/tools"

CMD ["dotnet", "watch", "--project", "User.Presentation/User.Presentation.csproj", "run", "--urls=http://0.0.0.0:80"]
