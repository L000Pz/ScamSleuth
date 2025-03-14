FROM mcr.microsoft.com/dotnet/sdk:7.0

WORKDIR /app

COPY IAM.Presentation/*.csproj ./IAM.Presentation/
COPY IAM.Application/*.csproj ./IAM.Application/
COPY IAM.Infrastructure/*.csproj ./IAM.Infrastructure/
COPY IAM.Domain/*.csproj ./IAM.Domain/

RUN dotnet restore IAM.Presentation/IAM.Presentation.csproj

COPY . .

RUN dotnet tool install --global dotnet-watch
ENV PATH="${PATH}:/root/.dotnet/tools"

CMD ["dotnet", "watch", "--project", "IAM.Presentation/IAM.Presentation.csproj", "run", "--urls=http://0.0.0.0:80"]
