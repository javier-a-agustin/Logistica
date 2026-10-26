using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Logistica.Core.Service
{
    public class UsuarioService(IUsuarioRepository _usuarioRepository, ICatalogoRepository _catalogoRepository, IPasswordHasher<UsuarioDTO> _passwordHasher) : IUsuarioService
    {
        public async Task<List<UsuarioDTO>> GetAllAsync()
        {
            return await _usuarioRepository.GetAllAsync();
        }

        public async Task<UsuarioDTO?> GetByIdAsync(int id)
        {
            return await _usuarioRepository.GetByIdAsync(id);
        }

        public async Task<Resultado<UsuarioDTO>> CreateAsync(UsuarioCrearDTO usuario)
        {
            if (await _catalogoRepository.GetRolByIdAsync(usuario.IdRol) == null)
                return Resultado<UsuarioDTO>.Fallo(TipoError.Validacion, "El rol indicado no existe");

            var nombreUsuario = usuario.NombreUsuario.Trim();
            if (await _usuarioRepository.ExistsNombreUsuarioAsync(nombreUsuario))
                return Resultado<UsuarioDTO>.Fallo(TipoError.Conflicto, $"Ya existe el usuario '{nombreUsuario}'");

            var passwordHash = _passwordHasher.HashPassword(new UsuarioDTO { NombreUsuario = nombreUsuario }, usuario.Password);

            return Resultado<UsuarioDTO>.Ok(await _usuarioRepository.CreateAsync(nombreUsuario, passwordHash, usuario.IdRol));
        }

        public async Task<Resultado<UsuarioDTO>> UpdateAsync(int id, UsuarioActualizarDTO usuario)
        {
            if (await _catalogoRepository.GetRolByIdAsync(usuario.IdRol) == null)
                return Resultado<UsuarioDTO>.Fallo(TipoError.Validacion, "El rol indicado no existe");

            var actualizado = await _usuarioRepository.UpdateAsync(id, usuario);
            if (actualizado == null)
                return Resultado<UsuarioDTO>.Fallo(TipoError.NoEncontrado, "El usuario no existe");

            return Resultado<UsuarioDTO>.Ok(actualizado);
        }

        public async Task<Resultado<bool>> UpdatePasswordAsync(int id, CambiarPasswordDTO cambio)
        {
            var usuario = await _usuarioRepository.GetByIdAsync(id);
            if (usuario == null)
                return Resultado<bool>.Fallo(TipoError.NoEncontrado, "El usuario no existe");

            await _usuarioRepository.UpdatePasswordAsync(id, _passwordHasher.HashPassword(usuario, cambio.PasswordNueva));

            return Resultado<bool>.Ok(true);
        }
    }
}
