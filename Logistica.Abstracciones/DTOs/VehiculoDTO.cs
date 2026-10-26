using System.ComponentModel.DataAnnotations;

namespace Logistica.Abstracciones.DTOs
{
    public class VehiculoDTO
    {
        public int IdVehiculo { get; set; }
        public string Patente { get; set; } = string.Empty;
        public int IdModelo { get; set; }
        public string NombreModelo { get; set; } = string.Empty;
        public int IdMarca { get; set; }
        public string NombreMarca { get; set; } = string.Empty;
        public decimal CapacidadKg { get; set; }
        public bool Activo { get; set; }
    }

    public class VehiculoGuardarDTO
    {
        [Required, MaxLength(10)]
        public string Patente { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int IdModelo { get; set; }

        [Range(typeof(decimal), "0.01", "100000")]
        public decimal CapacidadKg { get; set; }

        public bool Activo { get; set; } = true;
    }
}
