FROM mcr.microsoft.com/dotnet/sdk:7.0

WORKDIR /app

COPY Media.Presentation/*.csproj ./Media.Presentation/
COPY Media.Application/*.csproj ./Media.Application/
COPY Media.Infrastructure/*.csproj ./Media.Infrastructure/
COPY Media.Domain/*.csproj ./Media.Domain/

RUN dotnet restore Media.Presentation/Media.Presentation.csproj

COPY . .

RUN dotnet tool install --global dotnet-watch
ENV PATH="${PATH}:/root/.dotnet/tools"

CMD ["dotnet", "watch", "--project", "Media.Presentation/Media.Presentation.csproj", "run", "--urls=http://0.0.0.0:80"]
