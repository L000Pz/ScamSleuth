FROM mcr.microsoft.com/dotnet/sdk:7.0

WORKDIR /app

COPY Admin.Presentation/*.csproj ./Admin.Presentation/
COPY Admin.Application/*.csproj ./Admin.Application/
COPY Admin.Infrastructure/*.csproj ./Admin.Infrastructure/
COPY Admin.Domain/*.csproj ./Admin.Domain/

RUN dotnet restore Admin.Presentation/Admin.Presentation.csproj

COPY . .

RUN dotnet tool install --global dotnet-watch
ENV PATH="${PATH}:/root/.dotnet/tools"

CMD ["dotnet", "watch", "--project", "Admin.Presentation/Admin.Presentation.csproj", "run", "--urls=http://0.0.0.0:80"]
