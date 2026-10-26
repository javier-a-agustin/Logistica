using System;
using System.Collections.Generic;

namespace Logistica.Data.EF;

public partial class Viaje
{
    public int IdViaje { get; set; }

    public int IdVehiculo { get; set; }

    public int IdChofer { get; set; }

    public int IdUsuarioDespachante { get; set; }

    public DateTime FechaSalida { get; set; }

    public DateTime? FechaLlegadaEstimada { get; set; }

    public int IdEstadoViaje { get; set; }

    public virtual Vehiculo Vehiculo { get; set; } = null!;

    public virtual Chofer Chofer { get; set; } = null!;

    public virtual Usuario UsuarioDespachante { get; set; } = null!;

    public virtual EstadoViaje EstadoViaje { get; set; } = null!;

    public virtual ICollection<DetalleViaje> Detalles { get; set; } = new List<DetalleViaje>();
}

public partial class DetalleViaje
{
    public int IdViaje { get; set; }

    public int IdPaquete { get; set; }

    public int OrdenEntrega { get; set; }

    public virtual Viaje Viaje { get; set; } = null!;

    public virtual Paquete Paquete { get; set; } = null!;
}
