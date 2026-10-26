using System;
using System.Collections.Generic;

namespace Logistica.Data.EF;

public partial class Paquete
{
    public int IdPaquete { get; set; }

    public string CodigoSeguimiento { get; set; } = null!;

    public int IdClienteRem { get; set; }

    public int IdClienteDest { get; set; }

    public int IdUsuarioRecepcion { get; set; }

    public string? Descripcion { get; set; }

    public decimal PesoKg { get; set; }

    public decimal AltoCm { get; set; }

    public decimal AnchoCm { get; set; }

    public decimal LargoCm { get; set; }

    public int IdEstadoActual { get; set; }

    public DateTime FechaIngreso { get; set; }

    public virtual Cliente ClienteRem { get; set; } = null!;

    public virtual Cliente ClienteDest { get; set; } = null!;

    public virtual Usuario UsuarioRecepcion { get; set; } = null!;

    public virtual EstadoPaquete EstadoActual { get; set; } = null!;

    public virtual ICollection<HistorialPaquete> Historial { get; set; } = new List<HistorialPaquete>();

    public virtual ICollection<DetalleViaje> DetallesViaje { get; set; } = new List<DetalleViaje>();
}
