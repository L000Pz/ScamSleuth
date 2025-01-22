FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

COPY ["Public.Application/Public.Application.csproj", "Public.Application/"]
COPY ["Public.Domain/Public.Domain.csproj", "Public.Domain/"]
COPY ["Public.Infrastructure/Public.Infrastructure.csproj", "Public.Infrastructure/"]
COPY ["Public.Presentation/Public.Presentation.csproj", "Public.Presentation/"]

RUN dotnet restore "Public.Presentation/Public.Presentation.csproj"
COPY . .
WORKDIR "/src/Public.Presentation"
RUN dotnet build "Public.Presentation.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Public.Presentation.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Public.Presentation.dll"]