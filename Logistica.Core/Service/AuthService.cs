using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Logistica.Core.Service
{
    public class AuthService(IUsuarioRepository _usuarioRepository, IPasswordHasher<UsuarioDTO> _passwordHasher, ITokenService _tokenService) : IAuthService
    {
        public async Task<Resultado<LoginRespuestaDTO>> LoginAsync(LoginDTO login)
        {
            var usuario = await _usuarioRepository.GetCredencialesAsync(login.NombreUsuario.Trim());

            // Mismo mensaje para usuario inexistente, inactivo o password incorrecta: no revelar que usuarios existen
            if (usuario == null || !usuario.Activo)
                return CredencialesInvalidas();

            var verificacion = _passwordHasher.VerifyHashedPassword(usuario, usuario.PasswordHash, login.Password);
            if (verificacion == PasswordVerificationResult.Failed)
                return CredencialesInvalidas();

            // El hash se genero con parametros viejos (ej: menos iteraciones): se regenera
            if (verificacion == PasswordVerificationResult.SuccessRehashNeeded)
                await _usuarioRepository.UpdatePasswordAsync(usuario.IdUsuario, _passwordHasher.HashPassword(usuario, login.Password));

            return Resultado<LoginRespuestaDTO>.Ok(_tokenService.GenerateToken(usuario));
        }

        private static Resultado<LoginRespuestaDTO> CredencialesInvalidas() =>
            Resultado<LoginRespuestaDTO>.Fallo(TipoError.NoAutorizado, "Usuario o contraseña incorrectos");
    }
}
