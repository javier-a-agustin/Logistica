using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;

namespace Logistica.Core.Service
{
    public class ClienteService(IClienteRepository _clienteRepository, ICatalogoRepository _catalogoRepository) : IClienteService
    {
        public async Task<List<ClienteDTO>> GetAllAsync(string? busqueda)
        {
            return await _clienteRepository.GetAllAsync(busqueda?.Trim());
        }

        public async Task<ClienteDTO?> GetByIdAsync(int id)
        {
            return await _clienteRepository.GetByIdAsync(id);
        }

        public async Task<ClienteDTO?> GetByDocumentoAsync(string tipoDocumento, string numeroDocumento)
        {
            return await _clienteRepository.GetByDocumentoAsync(tipoDocumento.Trim().ToUpperInvariant(), numeroDocumento.Trim());
        }

        public async Task<Resultado<ClienteDTO>> CreateAsync(ClienteGuardarDTO cliente)
        {
            var error = await ValidateAsync(cliente, null);
            if (error != null)
                return error;

            return Resultado<ClienteDTO>.Ok(await _clienteRepository.CreateAsync(cliente));
        }

        public async Task<Resultado<ClienteDTO>> UpdateAsync(int id, ClienteGuardarDTO cliente)
        {
            if (await _clienteRepository.GetByIdAsync(id) == null)
                return Resultado<ClienteDTO>.Fallo(TipoError.NoEncontrado, "El cliente no existe");

            var error = await ValidateAsync(cliente, id);
            if (error != null)
                return error;

            return Resultado<ClienteDTO>.Ok((await _clienteRepository.UpdateAsync(id, cliente))!);
        }

        public async Task<Resultado<bool>> DeleteAsync(int id)
        {
            if (await _clienteRepository.GetByIdAsync(id) == null)
                return Resultado<bool>.Fallo(TipoError.NoEncontrado, "El cliente no existe");

            // Se preserva la trazabilidad: un cliente con encomiendas no puede borrarse
            if (await _clienteRepository.HasPaquetesAsync(id))
                return Resultado<bool>.Fallo(TipoError.Conflicto, "El cliente tiene paquetes registrados y no puede eliminarse");

            return Resultado<bool>.Ok(await _clienteRepository.DeleteAsync(id));
        }

        private async Task<Resultado<ClienteDTO>?> ValidateAsync(ClienteGuardarDTO cliente, int? idCliente)
        {
            cliente.TipoDocumento = cliente.TipoDocumento.Trim().ToUpperInvariant();
            cliente.NumeroDocumento = cliente.NumeroDocumento.Trim();

            if (!await _catalogoRepository.ExistsLocalidadAsync(cliente.IdLocalidad))
                return Resultado<ClienteDTO>.Fallo(TipoError.Validacion, "La localidad indicada no existe");

            if (await _clienteRepository.ExistsDocumentoAsync(cliente.TipoDocumento, cliente.NumeroDocumento, idCliente))
                return Resultado<ClienteDTO>.Fallo(TipoError.Conflicto, $"Ya existe un cliente con {cliente.TipoDocumento} {cliente.NumeroDocumento}");

            return null;
        }
    }
}
