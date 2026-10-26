using System;
using System.Collections.Generic;

namespace Logistica.Data.EF;

public partial class Cliente
{
    public int IdCliente { get; set; }

    public string RazonSocialNombre { get; set; } = null!;

    public string? Apellido { get; set; }

    public string TipoDocumento { get; set; } = null!;

    public string NumeroDocumento { get; set; } = null!;

    public string? Telefono { get; set; }

    public string Calle { get; set; } = null!;

    public int Altura { get; set; }

    public string? PisoDepto { get; set; }

    public int IdLocalidad { get; set; }

    public string? Email { get; set; }

    public virtual Localidad Localidad { get; set; } = null!;
}
