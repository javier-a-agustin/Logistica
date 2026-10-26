using System.ComponentModel.DataAnnotations;

namespace Logistica.Abstracciones.DTOs
{
    public class UsuarioDTO
    {
        public int IdUsuario { get; set; }
        public string NombreUsuario { get; set; } = string.Empty;
        public int IdRol { get; set; }
        public string NombreRol { get; set; } = string.Empty;
        public bool Activo { get; set; }
    }

    // Solo se usa internamente para el login. Nunca se devuelve al cliente
    public class UsuarioCredencialDTO : UsuarioDTO
    {
        public string PasswordHash { get; set; } = string.Empty;
    }

    public class UsuarioCrearDTO
    {
        [Required, MaxLength(50)]
        public string NombreUsuario { get; set; } = string.Empty;

        [Required, MinLength(6), MaxLength(100)]
        public string Password { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int IdRol { get; set; }
    }

    public class UsuarioActualizarDTO
    {
        [Range(1, int.MaxValue)]
        public int IdRol { get; set; }

        public bool Activo { get; set; }
    }

    public class CambiarPasswordDTO
    {
        [Required, MinLength(6), MaxLength(100)]
        public string PasswordNueva { get; set; } = string.Empty;
    }
}
