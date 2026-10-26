using System.ComponentModel.DataAnnotations;

namespace Logistica.Abstracciones.DTOs
{
    public class ClienteDTO
    {
        public int IdCliente { get; set; }
        public string RazonSocialNombre { get; set; } = string.Empty;
        public string? Apellido { get; set; }
        public string TipoDocumento { get; set; } = string.Empty;
        public string NumeroDocumento { get; set; } = string.Empty;
        public string? Telefono { get; set; }
        public string Calle { get; set; } = string.Empty;
        public int Altura { get; set; }
        public string? PisoDepto { get; set; }
        public int IdLocalidad { get; set; }
        public string NombreLocalidad { get; set; } = string.Empty;
        public string CodigoPostal { get; set; } = string.Empty;
        public string NombreProvincia { get; set; } = string.Empty;
        public string? Email { get; set; }
    }

    public class ClienteGuardarDTO
    {
        // Nombre de la persona fisica o razon social de la persona juridica
        [Required, MaxLength(100)]
        public string RazonSocialNombre { get; set; } = string.Empty;

        // Vacio para personas juridicas
        [MaxLength(100)]
        public string? Apellido { get; set; }

        // DNI, CUIT, CUIL, PAS
        [Required, MaxLength(10)]
        public string TipoDocumento { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string NumeroDocumento { get; set; } = string.Empty;

        [MaxLength(30)]
        public string? Telefono { get; set; }

        [Required, MaxLength(100)]
        public string Calle { get; set; } = string.Empty;

        [Range(1, 99999)]
        public int Altura { get; set; }

        [MaxLength(20)]
        public string? PisoDepto { get; set; }

        [Range(1, int.MaxValue)]
        public int IdLocalidad { get; set; }

        [EmailAddress, MaxLength(100)]
        public string? Email { get; set; }
    }
}
