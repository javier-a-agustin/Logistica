using System.ComponentModel.DataAnnotations;

namespace Logistica.Abstracciones.DTOs
{
    public class ChoferDTO
    {
        public int IdChofer { get; set; }
        public int IdUsuario { get; set; }
        public string NombreUsuario { get; set; } = string.Empty;
        public bool UsuarioActivo { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string Dni { get; set; } = string.Empty;
        public bool LicenciaConducir { get; set; }
        public DateOnly? FechaVencimientoLicencia { get; set; }
        public string? Telefono { get; set; }
        public bool Activo { get; set; }
    }

    public class ChoferGuardarDTO
    {
        // Usuario del sistema (con rol Chofer) con el que se autentica
        [Range(1, int.MaxValue)]
        public int IdUsuario { get; set; }

        [Required, MaxLength(50)]
        public string Nombre { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Apellido { get; set; } = string.Empty;

        [Required, MaxLength(15)]
        public string Dni { get; set; } = string.Empty;

        public bool LicenciaConducir { get; set; }

        public DateOnly? FechaVencimientoLicencia { get; set; }

        [MaxLength(30)]
        public string? Telefono { get; set; }

        public bool Activo { get; set; } = true;
    }
}
