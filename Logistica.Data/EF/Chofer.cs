using System;
using System.Collections.Generic;

namespace Logistica.Data.EF;

public partial class Chofer
{
    public int IdChofer { get; set; }

    public int IdUsuario { get; set; }

    public string Nombre { get; set; } = null!;

    public string Apellido { get; set; } = null!;

    public string Dni { get; set; } = null!;

    public bool LicenciaConducir { get; set; }

    public DateOnly? FechaVencimientoLicencia { get; set; }

    public string? Telefono { get; set; }

    public bool Activo { get; set; }

    public virtual Usuario Usuario { get; set; } = null!;

    public virtual ICollection<Viaje> Viajes { get; set; } = new List<Viaje>();
}
