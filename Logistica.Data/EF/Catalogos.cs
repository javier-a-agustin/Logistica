using System;
using System.Collections.Generic;

namespace Logistica.Data.EF;

public partial class Provincia
{
    public int IdProvincia { get; set; }

    public string NombreProvincia { get; set; } = null!;

    public virtual ICollection<Localidad> Localidades { get; set; } = new List<Localidad>();
}

public partial class Localidad
{
    public int IdLocalidad { get; set; }

    public int IdProvincia { get; set; }

    public string NombreLocalidad { get; set; } = null!;

    public string CodigoPostal { get; set; } = null!;

    public virtual Provincia Provincia { get; set; } = null!;

    public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();
}

public partial class Rol
{
    public int IdRol { get; set; }

    public string NombreRol { get; set; } = null!;

    public string? Descripcion { get; set; }

    public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}

public partial class MarcaVehiculo
{
    public int IdMarca { get; set; }

    public string NombreMarca { get; set; } = null!;

    public virtual ICollection<ModeloVehiculo> Modelos { get; set; } = new List<ModeloVehiculo>();
}

public partial class ModeloVehiculo
{
    public int IdModelo { get; set; }

    public int IdMarca { get; set; }

    public string NombreModelo { get; set; } = null!;

    public virtual MarcaVehiculo Marca { get; set; } = null!;

    public virtual ICollection<Vehiculo> Vehiculos { get; set; } = new List<Vehiculo>();
}

public partial class EstadoPaquete
{
    public int IdEstadoPaquete { get; set; }

    public string NombreEstado { get; set; } = null!;
}

public partial class EstadoViaje
{
    public int IdEstadoViaje { get; set; }

    public string NombreEstadoViaje { get; set; } = null!;
}
