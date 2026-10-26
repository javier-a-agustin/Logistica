using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Logistica.Core.Service;
using Microsoft.AspNetCore.Identity;
using Moq;

namespace xxLogistica.Tests
{
    public class AuthServiceTests
    {
        private readonly Mock<IUsuarioRepository> _usuarioRepository = new();
        private readonly Mock<ITokenService> _tokenService = new();
        private readonly PasswordHasher<UsuarioDTO> _passwordHasher = new();
        private readonly AuthService _service;

        public AuthServiceTests()
        {
            _service = new AuthService(_usuarioRepository.Object, _passwordHasher, _tokenService.Object);
            _tokenService.Setup(t => t.GenerateToken(It.IsAny<UsuarioDTO>())).Returns(new LoginRespuestaDTO { Token = "token" });
        }

        private void SetupUsuario(bool activo)
        {
            var usuario = new UsuarioCredencialDTO { IdUsuario = 1, NombreUsuario = "recepcion", NombreRol = RolesSistema.Recepcionista, Activo = activo };
            usuario.PasswordHash = _passwordHasher.HashPassword(usuario, "Dev123!");
            _usuarioRepository.Setup(r => r.GetCredencialesAsync("recepcion")).ReturnsAsync(usuario);
        }

        [Fact]
        public async Task LoginAsync_CredencialesValidas_DevuelveToken()
        {
            SetupUsuario(activo: true);

            var resultado = await _service.LoginAsync(new LoginDTO { NombreUsuario = "recepcion", Password = "Dev123!" });

            Assert.True(resultado.Exito);
            Assert.Equal("token", resultado.Datos!.Token);
        }

        [Fact]
        public async Task LoginAsync_PasswordIncorrecta_DevuelveNoAutorizado()
        {
            SetupUsuario(activo: true);

            var resultado = await _service.LoginAsync(new LoginDTO { NombreUsuario = "recepcion", Password = "otra" });

            Assert.False(resultado.Exito);
            Assert.Equal(TipoError.NoAutorizado, resultado.TipoError);
        }

        [Fact]
        public async Task LoginAsync_UsuarioInactivo_DevuelveNoAutorizado()
        {
            SetupUsuario(activo: false);

            var resultado = await _service.LoginAsync(new LoginDTO { NombreUsuario = "recepcion", Password = "Dev123!" });

            Assert.False(resultado.Exito);
            Assert.Equal(TipoError.NoAutorizado, resultado.TipoError);
        }
    }
}
