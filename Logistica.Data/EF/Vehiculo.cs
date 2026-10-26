using System;
using System.Collections.Generic;

namespace Logistica.Data.EF;

public partial class Vehiculo
{
    public int IdVehiculo { get; set; }

    public string Patente { get; set; } = null!;

    public int IdModelo { get; set; }

    public decimal CapacidadKg { get; set; }

    public bool Activo { get; set; }

    public virtual ModeloVehiculo Modelo { get; set; } = null!;

    public virtual ICollection<Viaje> Viajes { get; set; } = new List<Viaje>();
}
