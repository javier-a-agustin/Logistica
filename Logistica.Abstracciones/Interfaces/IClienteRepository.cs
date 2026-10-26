using Logistica.Abstracciones.DTOs;

namespace Logistica.Abstracciones.Interfaces
{
    public interface IClienteRepository
    {
        Task<List<ClienteDTO>> GetAllAsync(string? busqueda);
        Task<ClienteDTO?> GetByIdAsync(int id);
        Task<ClienteDTO?> GetByDocumentoAsync(string tipoDocumento, string numeroDocumento);
        Task<bool> ExistsDocumentoAsync(string tipoDocumento, string numeroDocumento, int? excluirIdCliente);
        Task<ClienteDTO> CreateAsync(ClienteGuardarDTO cliente);
        Task<ClienteDTO?> UpdateAsync(int id, ClienteGuardarDTO cliente);
        Task<bool> HasPaquetesAsync(int id);
        Task<bool> DeleteAsync(int id);
    }
}
