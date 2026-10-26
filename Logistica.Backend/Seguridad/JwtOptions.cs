using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Logistica.Backend.Seguridad
{
    // Configuracion de la seccion "Jwt" de appsettings.json
    public class JwtOptions
    {
        public const string Seccion = "Jwt";

        // Nombre del claim con el rol del usuario (lo usa [Authorize(Roles = ...)])
        public const string RolClaim = "role";

        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;

        // Minimo 32 caracteres (256 bits) para HMAC-SHA256
        public string Key { get; set; } = string.Empty;

        public int ExpiracionMinutos { get; set; } = 480;

        public SymmetricSecurityKey GetSigningKey() => new(Encoding.UTF8.GetBytes(Key));
    }
}
