using System;
using System.Collections.Generic;

namespace Logistica.Data.EF;

public partial class HistorialPaquete
{
    public int IdHistorial { get; set; }

    public int IdPaquete { get; set; }

    public int IdEstadoPaquete { get; set; }

    public int IdUsuario { get; set; }

    public DateTime FechaHora { get; set; }

    public string? Observacion { get; set; }

    public virtual Paquete Paquete { get; set; } = null!;

    public virtual EstadoPaquete EstadoPaquete { get; set; } = null!;

    public virtual Usuario Usuario { get; set; } = null!;
}
