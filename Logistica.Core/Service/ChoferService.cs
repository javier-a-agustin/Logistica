using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;

namespace Logistica.Core.Service
{
    public class ChoferService(IChoferRepository _choferRepository, IUsuarioRepository _usuarioRepository) : IChoferService
    {
        // Regla de negocio: un chofer esta habilitado si esta activo, su usuario esta activo
        // y tiene licencia de conducir vigente a la fecha indicada
        public static bool IsHabilitado(ChoferDTO chofer, DateOnly fecha)
        {
            return chofer.Activo
                && chofer.UsuarioActivo
                && chofer.LicenciaConducir
                && chofer.FechaVencimientoLicencia >= fecha;
        }

        public async Task<List<ChoferDTO>> GetAllAsync(bool soloActivos)
        {
            return await _choferRepository.GetAllAsync(soloActivos);
        }

        public async Task<ChoferDTO?> GetByIdAsync(int id)
        {
            return await _choferRepository.GetByIdAsync(id);
        }

        // Choferes habilitados que no estan asignados a un viaje programado o en curso
        public async Task<List<ChoferDTO>> GetHabilitadosAsync()
        {
            var hoy = DateOnly.FromDateTime(DateTime.Today);
            var ocupados = await _choferRepository.GetIdsEnViajeActivoAsync();
            var activos = await _choferRepository.GetAllAsync(true);

            return activos.Where(c => IsHabilitado(c, hoy) && !ocupados.Contains(c.IdChofer)).ToList();
        }

        public async Task<Resultado<ChoferDTO>> CreateAsync(ChoferGuardarDTO chofer)
        {
            var error = await ValidateAsync(chofer, null);
            if (error != null)
                return error;

            return Resultado<ChoferDTO>.Ok(await _choferRepository.CreateAsync(chofer));
        }

        public async Task<Resultado<ChoferDTO>> UpdateAsync(int id, ChoferGuardarDTO chofer)
        {
            if (await _choferRepository.GetByIdAsync(id) == null)
                return Resultado<ChoferDTO>.Fallo(TipoError.NoEncontrado, "El chofer no existe");

            var error = await ValidateAsync(chofer, id);
            if (error != null)
                return error;

            if (!chofer.Activo && await IsEnViajeActivoAsync(id))
                return Resultado<ChoferDTO>.Fallo(TipoError.Conflicto, "No se puede dar de baja un chofer con un viaje en curso");

            return Resultado<ChoferDTO>.Ok((await _choferRepository.UpdateAsync(id, chofer))!);
        }

        // Baja logica (Activo = N) para no perder el historial de viajes
        public async Task<Resultado<bool>> DeleteAsync(int id)
        {
            if (await _choferRepository.GetByIdAsync(id) == null)
                return Resultado<bool>.Fallo(TipoError.NoEncontrado, "El chofer no existe");

            if (await IsEnViajeActivoAsync(id))
                return Resultado<bool>.Fallo(TipoError.Conflicto, "No se puede dar de baja un chofer con un viaje en curso");

            return Resultado<bool>.Ok(await _choferRepository.SetActivoAsync(id, false));
        }

        private async Task<bool> IsEnViajeActivoAsync(int id)
        {
            return (await _choferRepository.GetIdsEnViajeActivoAsync()).Contains(id);
        }

        private async Task<Resultado<ChoferDTO>?> ValidateAsync(ChoferGuardarDTO chofer, int? idChofer)
        {
            chofer.Dni = chofer.Dni.Trim();

            var usuario = await _usuarioRepository.GetByIdAsync(chofer.IdUsuario);
            if (usuario == null)
                return Resultado<ChoferDTO>.Fallo(TipoError.Validacion, "El usuario indicado no existe");

            if (usuario.NombreRol != RolesSistema.Chofer)
                return Resultado<ChoferDTO>.Fallo(TipoError.Validacion, $"El usuario debe tener el rol {RolesSistema.Chofer}");

            if (await _choferRepository.ExistsUsuarioAsync(chofer.IdUsuario, idChofer))
                return Resultado<ChoferDTO>.Fallo(TipoError.Conflicto, "El usuario ya está asociado a otro chofer");

            if (await _choferRepository.ExistsDniAsync(chofer.Dni, idChofer))
                return Resultado<ChoferDTO>.Fallo(TipoError.Conflicto, $"Ya existe un chofer con DNI {chofer.Dni}");

            if (chofer.LicenciaConducir && chofer.FechaVencimientoLicencia == null)
                return Resultado<ChoferDTO>.Fallo(TipoError.Validacion, "Debe indicar la fecha de vencimiento de la licencia de conducir");

            return null;
        }
    }
}
