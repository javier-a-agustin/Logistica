using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;

namespace Logistica.Core.Service
{
    public class VehiculoService(IVehiculoRepository _vehiculoRepository, ICatalogoRepository _catalogoRepository) : IVehiculoService
    {
        public async Task<List<VehiculoDTO>> GetAllAsync(bool soloActivos)
        {
            return await _vehiculoRepository.GetAllAsync(soloActivos);
        }

        public async Task<VehiculoDTO?> GetByIdAsync(int id)
        {
            return await _vehiculoRepository.GetByIdAsync(id);
        }

        // Vehiculos activos que no estan asignados a un viaje programado o en curso
        public async Task<List<VehiculoDTO>> GetDisponiblesAsync()
        {
            var ocupados = await _vehiculoRepository.GetIdsEnViajeActivoAsync();
            var activos = await _vehiculoRepository.GetAllAsync(true);

            return activos.Where(v => !ocupados.Contains(v.IdVehiculo)).ToList();
        }

        public async Task<Resultado<VehiculoDTO>> CreateAsync(VehiculoGuardarDTO vehiculo)
        {
            var error = await ValidateAsync(vehiculo, null);
            if (error != null)
                return error;

            return Resultado<VehiculoDTO>.Ok(await _vehiculoRepository.CreateAsync(vehiculo));
        }

        public async Task<Resultado<VehiculoDTO>> UpdateAsync(int id, VehiculoGuardarDTO vehiculo)
        {
            if (await _vehiculoRepository.GetByIdAsync(id) == null)
                return Resultado<VehiculoDTO>.Fallo(TipoError.NoEncontrado, "El vehículo no existe");

            var error = await ValidateAsync(vehiculo, id);
            if (error != null)
                return error;

            if (!vehiculo.Activo && await IsEnViajeActivoAsync(id))
                return Resultado<VehiculoDTO>.Fallo(TipoError.Conflicto, "No se puede dar de baja un vehículo con un viaje en curso");

            return Resultado<VehiculoDTO>.Ok((await _vehiculoRepository.UpdateAsync(id, vehiculo))!);
        }

        // Baja logica (Activo = N) para no perder el historial de viajes
        public async Task<Resultado<bool>> DeleteAsync(int id)
        {
            if (await _vehiculoRepository.GetByIdAsync(id) == null)
                return Resultado<bool>.Fallo(TipoError.NoEncontrado, "El vehículo no existe");

            if (await IsEnViajeActivoAsync(id))
                return Resultado<bool>.Fallo(TipoError.Conflicto, "No se puede dar de baja un vehículo con un viaje en curso");

            return Resultado<bool>.Ok(await _vehiculoRepository.SetActivoAsync(id, false));
        }

        private async Task<bool> IsEnViajeActivoAsync(int id)
        {
            return (await _vehiculoRepository.GetIdsEnViajeActivoAsync()).Contains(id);
        }

        private async Task<Resultado<VehiculoDTO>?> ValidateAsync(VehiculoGuardarDTO vehiculo, int? idVehiculo)
        {
            vehiculo.Patente = vehiculo.Patente.Replace(" ", "").Trim().ToUpperInvariant();

            if (!await _catalogoRepository.ExistsModeloAsync(vehiculo.IdModelo))
                return Resultado<VehiculoDTO>.Fallo(TipoError.Validacion, "El modelo indicado no existe");

            if (await _vehiculoRepository.ExistsPatenteAsync(vehiculo.Patente, idVehiculo))
                return Resultado<VehiculoDTO>.Fallo(TipoError.Conflicto, $"Ya existe un vehículo con patente {vehiculo.Patente}");

            return null;
        }
    }
}
