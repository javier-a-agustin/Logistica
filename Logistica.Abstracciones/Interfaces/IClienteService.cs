using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;

namespace Logistica.Abstracciones.Interfaces
{
    public interface IClienteService
    {
        Task<List<ClienteDTO>> GetAllAsync(string? busqueda);
        Task<ClienteDTO?> GetByIdAsync(int id);
        Task<ClienteDTO?> GetByDocumentoAsync(string tipoDocumento, string numeroDocumento);
        Task<Resultado<ClienteDTO>> CreateAsync(ClienteGuardarDTO cliente);
        Task<Resultado<ClienteDTO>> UpdateAsync(int id, ClienteGuardarDTO cliente);
        Task<Resultado<bool>> DeleteAsync(int id);
    }
}
