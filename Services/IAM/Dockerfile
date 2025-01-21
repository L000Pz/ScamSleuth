FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

COPY ["IAM.Application/IAM.Application.csproj", "IAM.Application/"]
COPY ["IAM.Domain/IAM.Domain.csproj", "IAM.Domain/"]
COPY ["IAM.Contracts/IAM.Contracts.csproj", "IAM.Contracts/"]
COPY ["IAM.Infrastructure/IAM.Infrastructure.csproj", "IAM.Infrastructure/"]
COPY ["IAM.Presentation/IAM.Presentation.csproj", "IAM.Presentation/"]

RUN dotnet restore "IAM.Presentation/IAM.Presentation.csproj"
COPY . .
WORKDIR "/src/IAM.Presentation"
RUN dotnet build "IAM.Presentation.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "IAM.Presentation.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "IAM.Presentation.dll"]