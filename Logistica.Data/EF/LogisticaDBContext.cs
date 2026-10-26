using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Logistica.Data.EF;

public partial class LogisticaDBContext : DbContext
{
    public LogisticaDBContext(DbContextOptions<LogisticaDBContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Provincia> Provincias { get; set; }

    public virtual DbSet<Localidad> Localidades { get; set; }

    public virtual DbSet<Rol> Roles { get; set; }

    public virtual DbSet<MarcaVehiculo> MarcasVehiculo { get; set; }

    public virtual DbSet<ModeloVehiculo> ModelosVehiculo { get; set; }

    public virtual DbSet<EstadoPaquete> EstadosPaquete { get; set; }

    public virtual DbSet<EstadoViaje> EstadosViaje { get; set; }

    public virtual DbSet<Cliente> Clientes { get; set; }

    public virtual DbSet<Vehiculo> Vehiculos { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    public virtual DbSet<Chofer> Choferes { get; set; }

    public virtual DbSet<Paquete> Paquetes { get; set; }

    public virtual DbSet<HistorialPaquete> HistorialPaquetes { get; set; }

    public virtual DbSet<Viaje> Viajes { get; set; }

    public virtual DbSet<DetalleViaje> DetallesViaje { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_0900_ai_ci")
            .HasCharSet("utf8mb4");

        // Las columnas Activo[S|N] y LicenciaConducir[S|N] se guardan como CHAR(1) 'S'/'N'
        var siNo = new BoolToStringConverter("N", "S");

        modelBuilder.Entity<Provincia>(entity =>
        {
            entity.HasKey(e => e.IdProvincia).HasName("PRIMARY");

            entity.ToTable("Provincias");

            entity.Property(e => e.NombreProvincia).HasMaxLength(100);
        });

        modelBuilder.Entity<Localidad>(entity =>
        {
            entity.HasKey(e => e.IdLocalidad).HasName("PRIMARY");

            entity.ToTable("Localidades");

            entity.Property(e => e.NombreLocalidad).HasMaxLength(100);
            entity.Property(e => e.CodigoPostal).HasMaxLength(10);

            entity.HasOne(d => d.Provincia).WithMany(p => p.Localidades)
                .HasForeignKey(d => d.IdProvincia)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Rol>(entity =>
        {
            entity.HasKey(e => e.IdRol).HasName("PRIMARY");

            entity.ToTable("Roles");

            entity.Property(e => e.NombreRol).HasMaxLength(50);
            entity.Property(e => e.Descripcion).HasMaxLength(255);
        });

        modelBuilder.Entity<MarcaVehiculo>(entity =>
        {
            entity.HasKey(e => e.IdMarca).HasName("PRIMARY");

            entity.ToTable("MarcasVehiculo");

            entity.Property(e => e.NombreMarca).HasMaxLength(50);
        });

        modelBuilder.Entity<ModeloVehiculo>(entity =>
        {
            entity.HasKey(e => e.IdModelo).HasName("PRIMARY");

            entity.ToTable("ModelosVehiculo");

            entity.Property(e => e.NombreModelo).HasMaxLength(50);

            entity.HasOne(d => d.Marca).WithMany(p => p.Modelos)
                .HasForeignKey(d => d.IdMarca)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<EstadoPaquete>(entity =>
        {
            entity.HasKey(e => e.IdEstadoPaquete).HasName("PRIMARY");

            entity.ToTable("EstadosPaquete");

            entity.Property(e => e.IdEstadoPaquete).ValueGeneratedNever();
            entity.Property(e => e.NombreEstado).HasMaxLength(30);
        });

        modelBuilder.Entity<EstadoViaje>(entity =>
        {
            entity.HasKey(e => e.IdEstadoViaje).HasName("PRIMARY");

            entity.ToTable("EstadosViaje");

            entity.Property(e => e.IdEstadoViaje).ValueGeneratedNever();
            entity.Property(e => e.NombreEstadoViaje).HasMaxLength(30);
        });

        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasKey(e => e.IdCliente).HasName("PRIMARY");

            entity.ToTable("Clientes");

            entity.Property(e => e.RazonSocialNombre).HasMaxLength(100);
            entity.Property(e => e.Apellido).HasMaxLength(100);
            entity.Property(e => e.TipoDocumento).HasMaxLength(10);
            entity.Property(e => e.NumeroDocumento).HasMaxLength(20);
            entity.Property(e => e.Telefono).HasMaxLength(30);
            entity.Property(e => e.Calle).HasMaxLength(100);
            entity.Property(e => e.PisoDepto).HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(100);

            entity.HasOne(d => d.Localidad).WithMany(p => p.Clientes)
                .HasForeignKey(d => d.IdLocalidad)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Vehiculo>(entity =>
        {
            entity.HasKey(e => e.IdVehiculo).HasName("PRIMARY");

            entity.ToTable("Vehiculos");

            entity.Property(e => e.Patente).HasMaxLength(10);
            entity.Property(e => e.CapacidadKg).HasPrecision(10, 2);
            entity.Property(e => e.Activo)
                .HasConversion(siNo)
                .HasColumnType("char(1)");

            entity.HasOne(d => d.Modelo).WithMany(p => p.Vehiculos)
                .HasForeignKey(d => d.IdModelo)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("PRIMARY");

            entity.ToTable("Usuario");

            entity.Property(e => e.NombreUsuario).HasMaxLength(50);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.Activo)
                .HasConversion(siNo)
                .HasColumnType("char(1)");

            entity.HasOne(d => d.Rol).WithMany(p => p.Usuarios)
                .HasForeignKey(d => d.IdRol)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Chofer>(entity =>
        {
            entity.HasKey(e => e.IdChofer).HasName("PRIMARY");

            entity.ToTable("Chofer");

            entity.Property(e => e.Nombre).HasMaxLength(50);
            entity.Property(e => e.Apellido).HasMaxLength(50);
            entity.Property(e => e.Dni).HasMaxLength(15);
            entity.Property(e => e.Telefono).HasMaxLength(30);
            entity.Property(e => e.LicenciaConducir)
                .HasConversion(siNo)
                .HasColumnType("char(1)");
            entity.Property(e => e.Activo)
                .HasConversion(siNo)
                .HasColumnType("char(1)");

            entity.HasOne(d => d.Usuario).WithOne(p => p.Chofer)
                .HasForeignKey<Chofer>(d => d.IdUsuario)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Paquete>(entity =>
        {
            entity.HasKey(e => e.IdPaquete).HasName("PRIMARY");

            entity.ToTable("Paquete");

            entity.Property(e => e.CodigoSeguimiento).HasMaxLength(20);
            entity.Property(e => e.Descripcion).HasMaxLength(255);
            entity.Property(e => e.PesoKg).HasPrecision(10, 2);
            entity.Property(e => e.AltoCm).HasPrecision(8, 2);
            entity.Property(e => e.AnchoCm).HasPrecision(8, 2);
            entity.Property(e => e.LargoCm).HasPrecision(8, 2);
            entity.Property(e => e.FechaIngreso).HasColumnType("datetime");

            entity.HasOne(d => d.ClienteRem).WithMany()
                .HasForeignKey(d => d.IdClienteRem)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.ClienteDest).WithMany()
                .HasForeignKey(d => d.IdClienteDest)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.UsuarioRecepcion).WithMany()
                .HasForeignKey(d => d.IdUsuarioRecepcion)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.EstadoActual).WithMany()
                .HasForeignKey(d => d.IdEstadoActual)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<HistorialPaquete>(entity =>
        {
            entity.HasKey(e => e.IdHistorial).HasName("PRIMARY");

            entity.ToTable("HistorialPaquete");

            entity.Property(e => e.FechaHora).HasColumnType("datetime");
            entity.Property(e => e.Observacion).HasMaxLength(255);

            entity.HasOne(d => d.Paquete).WithMany(p => p.Historial)
                .HasForeignKey(d => d.IdPaquete)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.EstadoPaquete).WithMany()
                .HasForeignKey(d => d.IdEstadoPaquete)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.Usuario).WithMany()
                .HasForeignKey(d => d.IdUsuario)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Viaje>(entity =>
        {
            entity.HasKey(e => e.IdViaje).HasName("PRIMARY");

            entity.ToTable("Viaje");

            entity.Property(e => e.FechaSalida).HasColumnType("datetime");
            entity.Property(e => e.FechaLlegadaEstimada).HasColumnType("datetime");

            entity.HasOne(d => d.Vehiculo).WithMany(p => p.Viajes)
                .HasForeignKey(d => d.IdVehiculo)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.Chofer).WithMany(p => p.Viajes)
                .HasForeignKey(d => d.IdChofer)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.UsuarioDespachante).WithMany()
                .HasForeignKey(d => d.IdUsuarioDespachante)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.EstadoViaje).WithMany()
                .HasForeignKey(d => d.IdEstadoViaje)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<DetalleViaje>(entity =>
        {
            // Clave primaria compuesta (2FN en la relacion N:M Viaje-Paquete)
            entity.HasKey(e => new { e.IdViaje, e.IdPaquete }).HasName("PRIMARY");

            entity.ToTable("DetalleViaje");

            entity.HasOne(d => d.Viaje).WithMany(p => p.Detalles)
                .HasForeignKey(d => d.IdViaje)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.Paquete).WithMany(p => p.DetallesViaje)
                .HasForeignKey(d => d.IdPaquete)
                .OnDelete(DeleteBehavior.Restrict);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
