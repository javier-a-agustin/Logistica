using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Logistica.Core.Service;
using Moq;

namespace xxLogistica.Tests
{
    public class ViajeServiceTests
    {
        private const int IdDespachante = 3;
        private const int IdUsuarioChofer = 4;

        private readonly Mock<IViajeRepository> _viajeRepository = new();
        private readonly Mock<IPaqueteRepository> _paqueteRepository = new();
        private readonly Mock<IVehiculoService> _vehiculoService = new();
        private readonly Mock<IChoferService> _choferService = new();
        private readonly ViajeService _service;

        private readonly VehiculoDTO _vehiculo = new() { IdVehiculo = 1, Patente = "AE123BC", CapacidadKg = 650, Activo = true };
        private readonly ChoferDTO _chofer = new()
        {
            IdChofer = 1,
            IdUsuario = IdUsuarioChofer,
            Nombre = "Juan",
            Apellido = "Pérez",
            Activo = true,
            UsuarioActivo = true,
            LicenciaConducir = true,
            FechaVencimientoLicencia = DateOnly.FromDateTime(DateTime.Today.AddYears(1))
        };

        public ViajeServiceTests()
        {
            _service = new ViajeService(_viajeRepository.Object, _paqueteRepository.Object, _vehiculoService.Object, _choferService.Object);

            _vehiculoService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(_vehiculo);
            _vehiculoService.Setup(s => s.GetDisponiblesAsync()).ReturnsAsync([_vehiculo]);
            _choferService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(_chofer);
            _choferService.Setup(s => s.GetHabilitadosAsync()).ReturnsAsync([_chofer]);
        }

        private static ViajeCrearDTO NuevoViaje(params int[] idsPaquete) => new()
        {
            IdVehiculo = 1,
            IdChofer = 1,
            Paquetes = idsPaquete.Select((id, i) => new ViajePaqueteDTO { IdPaquete = id, OrdenEntrega = i + 1 }).ToList()
        };

        private void SetupPaquetes(params PaqueteDTO[] paquetes)
        {
            _paqueteRepository.Setup(r => r.GetByIdsAsync(It.IsAny<List<int>>())).ReturnsAsync(paquetes.ToList());
        }

        private static PaqueteDTO Paquete(int id, decimal pesoKg, int idEstado = EstadosPaquete.EnDeposito) => new()
        {
            IdPaquete = id,
            CodigoSeguimiento = $"TLS-{id}",
            PesoKg = pesoKg,
            IdEstadoActual = idEstado
        };

        [Fact]
        public async Task CreateAsync_PesoSuperaCapacidad_DevuelveErrorYNoCreaElViaje()
        {
            SetupPaquetes(Paquete(1, 400), Paquete(2, 300));

            var resultado = await _service.CreateAsync(NuevoViaje(1, 2), IdDespachante);

            Assert.False(resultado.Exito);
            Assert.Equal(TipoError.Validacion, resultado.TipoError);
            Assert.Contains("supera la capacidad", resultado.Error);
            _viajeRepository.Verify(r => r.CreateAsync(It.IsAny<ViajeCrearDTO>(), It.IsAny<DateTime>(), It.IsAny<int>()), Times.Never);
        }

        [Fact]
        public async Task CreateAsync_PesoIgualACapacidad_CreaElViaje()
        {
            SetupPaquetes(Paquete(1, 400), Paquete(2, 250));
            _viajeRepository.Setup(r => r.CreateAsync(It.IsAny<ViajeCrearDTO>(), It.IsAny<DateTime>(), IdDespachante)).ReturnsAsync(10);
            _viajeRepository.Setup(r => r.GetHojaRutaAsync(10)).ReturnsAsync(new HojaRutaDTO { IdViaje = 10 });

            var resultado = await _service.CreateAsync(NuevoViaje(1, 2), IdDespachante);

            Assert.True(resultado.Exito);
            Assert.Equal(10, resultado.Datos!.IdViaje);
        }

        [Fact]
        public async Task CreateAsync_PaqueteNoEstaEnDeposito_DevuelveError()
        {
            SetupPaquetes(Paquete(1, 10), Paquete(2, 10, EstadosPaquete.EnTransito));

            var resultado = await _service.CreateAsync(NuevoViaje(1, 2), IdDespachante);

            Assert.False(resultado.Exito);
            Assert.Contains("TLS-2", resultado.Error);
        }

        [Fact]
        public async Task CreateAsync_ChoferConLicenciaVencida_DevuelveError()
        {
            _chofer.FechaVencimientoLicencia = DateOnly.FromDateTime(DateTime.Today.AddDays(-1));
            SetupPaquetes(Paquete(1, 10));

            var resultado = await _service.CreateAsync(NuevoViaje(1), IdDespachante);

            Assert.False(resultado.Exito);
            Assert.Contains("no está habilitado", resultado.Error);
        }

        [Fact]
        public async Task CreateAsync_PaquetesRepetidos_DevuelveError()
        {
            var resultado = await _service.CreateAsync(NuevoViaje(1, 1), IdDespachante);

            Assert.False(resultado.Exito);
            Assert.Equal(TipoError.Validacion, resultado.TipoError);
        }

        [Fact]
        public async Task UpdateEstadoPaqueteAsync_CanceladoSinObservacion_DevuelveError()
        {
            var estado = new ActualizarEstadoPaqueteDTO { IdEstadoPaquete = EstadosPaquete.Cancelado };

            var resultado = await _service.UpdateEstadoPaqueteAsync(10, 1, estado, IdUsuarioChofer);

            Assert.False(resultado.Exito);
            Assert.Contains("observación es obligatoria", resultado.Error);
        }

        [Fact]
        public async Task UpdateEstadoPaqueteAsync_ViajeDeOtroChofer_DevuelveProhibido()
        {
            _viajeRepository.Setup(r => r.GetHojaRutaAsync(10)).ReturnsAsync(new HojaRutaDTO { IdViaje = 10, IdUsuarioChofer = 99 });
            var estado = new ActualizarEstadoPaqueteDTO { IdEstadoPaquete = EstadosPaquete.Entregado };

            var resultado = await _service.UpdateEstadoPaqueteAsync(10, 1, estado, IdUsuarioChofer);

            Assert.False(resultado.Exito);
            Assert.Equal(TipoError.Prohibido, resultado.TipoError);
        }

        [Fact]
        public async Task FinalizarAsync_ConPaquetesEnTransito_DevuelveError()
        {
            _viajeRepository.Setup(r => r.GetHojaRutaAsync(10)).ReturnsAsync(new HojaRutaDTO
            {
                IdViaje = 10,
                IdUsuarioChofer = IdUsuarioChofer,
                IdEstadoViaje = EstadosViaje.EnCurso,
                Entregas =
                [
                    new HojaRutaItemDTO { IdPaquete = 1, CodigoSeguimiento = "TLS-1", IdEstadoActual = EstadosPaquete.Entregado },
                    new HojaRutaItemDTO { IdPaquete = 2, CodigoSeguimiento = "TLS-2", IdEstadoActual = EstadosPaquete.EnTransito }
                ]
            });

            var resultado = await _service.FinalizarAsync(10, IdUsuarioChofer);

            Assert.False(resultado.Exito);
            Assert.Contains("TLS-2", resultado.Error);
            _viajeRepository.Verify(r => r.UpdateEstadoViajeAsync(It.IsAny<int>(), It.IsAny<int>()), Times.Never);
        }
    }
}
