using System.ComponentModel.DataAnnotations;

namespace Logistica.Abstracciones.DTOs
{
    public class ViajeDTO
    {
        public int IdViaje { get; set; }
        public int IdVehiculo { get; set; }
        public string Patente { get; set; } = string.Empty;
        public int IdChofer { get; set; }
        public string Chofer { get; set; } = string.Empty;
        public string Despachante { get; set; } = string.Empty;
        public DateTime FechaSalida { get; set; }
        public DateTime? FechaLlegadaEstimada { get; set; }
        public int IdEstadoViaje { get; set; }
        public string EstadoViaje { get; set; } = string.Empty;
        public int CantidadPaquetes { get; set; }
        public decimal PesoTotalKg { get; set; }
    }

    public class ViajeCrearDTO
    {
        [Range(1, int.MaxValue)]
        public int IdVehiculo { get; set; }

        [Range(1, int.MaxValue)]
        public int IdChofer { get; set; }

        // Si no se informa se toma la fecha/hora actual
        public DateTime? FechaSalida { get; set; }

        public DateTime? FechaLlegadaEstimada { get; set; }

        [Required, MinLength(1)]
        public List<ViajePaqueteDTO> Paquetes { get; set; } = [];
    }

    public class ViajePaqueteDTO
    {
        [Range(1, int.MaxValue)]
        public int IdPaquete { get; set; }

        [Range(1, int.MaxValue)]
        public int OrdenEntrega { get; set; }
    }

    public class HojaRutaDTO
    {
        public int IdViaje { get; set; }
        public int IdVehiculo { get; set; }
        public string Patente { get; set; } = string.Empty;
        public string Vehiculo { get; set; } = string.Empty;
        public decimal CapacidadKg { get; set; }
        public int IdChofer { get; set; }
        public int IdUsuarioChofer { get; set; }
        public string Chofer { get; set; } = string.Empty;
        public int IdUsuarioDespachante { get; set; }
        public string Despachante { get; set; } = string.Empty;
        public DateTime FechaSalida { get; set; }
        public DateTime? FechaLlegadaEstimada { get; set; }
        public int IdEstadoViaje { get; set; }
        public string EstadoViaje { get; set; } = string.Empty;
        public decimal PesoTotalKg => Entregas.Sum(e => e.PesoKg);
        public List<HojaRutaItemDTO> Entregas { get; set; } = [];
    }

    public class HojaRutaItemDTO
    {
        public int OrdenEntrega { get; set; }
        public int IdPaquete { get; set; }
        public string CodigoSeguimiento { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public decimal PesoKg { get; set; }
        public decimal AltoCm { get; set; }
        public decimal AnchoCm { get; set; }
        public decimal LargoCm { get; set; }
        public int IdEstadoActual { get; set; }
        public string EstadoActual { get; set; } = string.Empty;
        public string Destinatario { get; set; } = string.Empty;
        public string? TelefonoDestinatario { get; set; }
        public string Calle { get; set; } = string.Empty;
        public int Altura { get; set; }
        public string? PisoDepto { get; set; }
        public string Localidad { get; set; } = string.Empty;
        public string CodigoPostal { get; set; } = string.Empty;
        public string Provincia { get; set; } = string.Empty;
    }

    public class ActualizarEstadoPaqueteDTO
    {
        // Solo se admite Entregado (3) o Cancelado (4)
        [Range(1, int.MaxValue)]
        public int IdEstadoPaquete { get; set; }

        // Obligatoria cuando el estado es Cancelado
        [MaxLength(255)]
        public string? Observacion { get; set; }
    }

    // Listados que necesita el despachante para armar un viaje
    public class DisponiblesDespachoDTO
    {
        public List<PaqueteDTO> Paquetes { get; set; } = [];
        public List<VehiculoDTO> Vehiculos { get; set; } = [];
        public List<ChoferDTO> Choferes { get; set; } = [];
    }
}
