using System.ComponentModel.DataAnnotations;

namespace Logistica.Abstracciones.DTOs
{
    public class PaqueteDTO
    {
        public int IdPaquete { get; set; }
        public string CodigoSeguimiento { get; set; } = string.Empty;
        public int IdClienteRem { get; set; }
        public string Remitente { get; set; } = string.Empty;
        public int IdClienteDest { get; set; }
        public string Destinatario { get; set; } = string.Empty;
        public int IdUsuarioRecepcion { get; set; }
        public string UsuarioRecepcion { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public decimal PesoKg { get; set; }
        public decimal AltoCm { get; set; }
        public decimal AnchoCm { get; set; }
        public decimal LargoCm { get; set; }
        public int IdEstadoActual { get; set; }
        public string EstadoActual { get; set; } = string.Empty;
        public DateTime FechaIngreso { get; set; }
    }

    public class PaqueteCrearDTO
    {
        [Range(1, int.MaxValue)]
        public int IdClienteRem { get; set; }

        [Range(1, int.MaxValue)]
        public int IdClienteDest { get; set; }

        [MaxLength(255)]
        public string? Descripcion { get; set; }

        [Range(typeof(decimal), "0.01", "100000")]
        public decimal PesoKg { get; set; }

        // Las dimensiones son informativas para el despachante (sin calculo de cubicaje)
        [Range(typeof(decimal), "0.1", "10000")]
        public decimal AltoCm { get; set; }

        [Range(typeof(decimal), "0.1", "10000")]
        public decimal AnchoCm { get; set; }

        [Range(typeof(decimal), "0.1", "10000")]
        public decimal LargoCm { get; set; }
    }

    public class HistorialPaqueteDTO
    {
        public int IdHistorial { get; set; }
        public int IdEstadoPaquete { get; set; }
        public string Estado { get; set; } = string.Empty;
        public int IdUsuario { get; set; }
        public string Usuario { get; set; } = string.Empty;
        public DateTime FechaHora { get; set; }
        public string? Observacion { get; set; }
    }

    public class SeguimientoDTO
    {
        public PaqueteDTO Paquete { get; set; } = new();
        public List<HistorialPaqueteDTO> Historial { get; set; } = [];
    }
}
