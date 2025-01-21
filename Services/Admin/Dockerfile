FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

COPY ["Admin.Application/Admin.Application.csproj", "Admin.Application/"]
COPY ["Admin.Domain/Admin.Domain.csproj", "Admin.Domain/"]
COPY ["Admin.Contracts/Admin.Contracts.csproj", "Admin.Contracts/"]
COPY ["Admin.Infrastructure/Admin.Infrastructure.csproj", "Admin.Infrastructure/"]
COPY ["Admin.Presentation/Admin.Presentation.csproj", "Admin.Presentation/"]

RUN dotnet restore "Admin.Presentation/Admin.Presentation.csproj"
COPY . .
WORKDIR "/src/Admin.Presentation"
RUN dotnet build "Admin.Presentation.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Admin.Presentation.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Admin.Presentation.dll"]