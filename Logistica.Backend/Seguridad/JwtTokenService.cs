using System.Security.Claims;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace Logistica.Backend.Seguridad
{
    public class JwtTokenService(IOptions<JwtOptions> _options) : ITokenService
    {
        private readonly JsonWebTokenHandler _tokenHandler = new();

        public LoginRespuestaDTO GenerateToken(UsuarioDTO usuario)
        {
            var opciones = _options.Value;
            var expira = DateTime.UtcNow.AddMinutes(opciones.ExpiracionMinutos);

            var descriptor = new SecurityTokenDescriptor
            {
                Issuer = opciones.Issuer,
                Audience = opciones.Audience,
                Expires = expira,
                SigningCredentials = new SigningCredentials(opciones.GetSigningKey(), SecurityAlgorithms.HmacSha256),
                Subject = new ClaimsIdentity(
                [
                    new Claim(JwtRegisteredClaimNames.Sub, usuario.IdUsuario.ToString()),
                    new Claim(JwtRegisteredClaimNames.UniqueName, usuario.NombreUsuario),
                    new Claim(JwtOptions.RolClaim, usuario.NombreRol),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                ])
            };

            return new LoginRespuestaDTO
            {
                Token = _tokenHandler.CreateToken(descriptor),
                Expira = expira,
                IdUsuario = usuario.IdUsuario,
                NombreUsuario = usuario.NombreUsuario,
                Rol = usuario.NombreRol
            };
        }
    }
}
