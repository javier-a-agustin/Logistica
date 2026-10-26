using Logistica.Abstracciones.DTOs;

namespace Logistica.Abstracciones.Interfaces
{
    public interface IChoferRepository
    {
        Task<List<ChoferDTO>> GetAllAsync(bool soloActivos);
        Task<ChoferDTO?> GetByIdAsync(int id);
        Task<ChoferDTO?> GetByUsuarioAsync(int idUsuario);
        Task<bool> ExistsDniAsync(string dni, int? excluirIdChofer);
        Task<bool> ExistsUsuarioAsync(int idUsuario, int? excluirIdChofer);
        Task<ChoferDTO> CreateAsync(ChoferGuardarDTO chofer);
        Task<ChoferDTO?> UpdateAsync(int id, ChoferGuardarDTO chofer);
        Task<bool> SetActivoAsync(int id, bool activo);
        Task<List<int>> GetIdsEnViajeActivoAsync();
    }
}
