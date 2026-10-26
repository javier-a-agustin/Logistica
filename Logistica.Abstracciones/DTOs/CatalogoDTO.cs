using System.ComponentModel.DataAnnotations;

namespace Logistica.Abstracciones.DTOs
{
    public class ProvinciaDTO
    {
        public int IdProvincia { get; set; }
        public string NombreProvincia { get; set; } = string.Empty;
    }

    public class LocalidadDTO
    {
        public int IdLocalidad { get; set; }
        public int IdProvincia { get; set; }
        public string NombreProvincia { get; set; } = string.Empty;
        public string NombreLocalidad { get; set; } = string.Empty;
        public string CodigoPostal { get; set; } = string.Empty;
    }

    public class RolDTO
    {
        public int IdRol { get; set; }
        public string NombreRol { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
    }

    public class MarcaDTO
    {
        public int IdMarca { get; set; }
        public string NombreMarca { get; set; } = string.Empty;
    }

    public class ModeloDTO
    {
        public int IdModelo { get; set; }
        public int IdMarca { get; set; }
        public string NombreMarca { get; set; } = string.Empty;
        public string NombreModelo { get; set; } = string.Empty;
    }

    // Sirve tanto para EstadosPaquete como para EstadosViaje
    public class EstadoDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
    }

    public class MarcaCrearDTO
    {
        [Required, MaxLength(50)]
        public string NombreMarca { get; set; } = string.Empty;
    }

    public class ModeloCrearDTO
    {
        [Range(1, int.MaxValue)]
        public int IdMarca { get; set; }

        [Required, MaxLength(50)]
        public string NombreModelo { get; set; } = string.Empty;
    }
}
