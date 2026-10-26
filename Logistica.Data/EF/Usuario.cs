using System;
using System.Collections.Generic;

namespace Logistica.Data.EF;

public partial class Usuario
{
    public int IdUsuario { get; set; }

    public string NombreUsuario { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public int IdRol { get; set; }

    public bool Activo { get; set; }

    public virtual Rol Rol { get; set; } = null!;

    public virtual Chofer? Chofer { get; set; }
}
