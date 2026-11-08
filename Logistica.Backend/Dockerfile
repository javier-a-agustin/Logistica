# =====================================================================
# Dockerfile del BACKEND (.NET 8)
# Usa "multi-stage build": una etapa para COMPILAR (imagen pesada con el SDK)
# y otra para EJECUTAR (imagen liviana solo con el runtime).
# Se construye desde la raíz del repo (ver docker-compose.yml: context: .)
# =====================================================================

# ---------- Etapa 1: compilar ----------
# Imagen oficial de Microsoft con el SDK de .NET 8 (trae "dotnet build/publish")
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiamos primero SOLO los .csproj y restauramos los paquetes NuGet.
# Truco de caché: si no cambiaste dependencias, Docker reutiliza esta capa
# y no vuelve a descargar todo en cada build.
COPY Logistica.Abstracciones/Logistica.Abstracciones.csproj Logistica.Abstracciones/
COPY Logistica.Core/Logistica.Core.csproj                   Logistica.Core/
COPY Logistica.Data/Logistica.Data.csproj                   Logistica.Data/
COPY Logistica.Backend/Logistica.Backend.csproj             Logistica.Backend/
RUN dotnet restore Logistica.Backend/Logistica.Backend.csproj

# Ahora sí copiamos todo el código y publicamos la app compilada en /app/publish
COPY . .
RUN dotnet publish Logistica.Backend/Logistica.Backend.csproj \
    -c Release -o /app/publish --no-restore /p:UseAppHost=false

# ---------- Etapa 2: ejecutar ----------
# Imagen liviana: solo el runtime de ASP.NET (sin compilador)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
# Traemos únicamente el resultado compilado de la etapa anterior
COPY --from=build /app/publish .
# Corre con un usuario sin privilegios (buena práctica de seguridad)
USER $APP_UID
# La API escucha en el puerto 8080 DENTRO del contenedor
EXPOSE 8080
# Comando que se ejecuta al iniciar el contenedor
ENTRYPOINT ["dotnet", "Logistica.Backend.dll"]
