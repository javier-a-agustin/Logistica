namespace Logistica.Abstracciones.Comun
{
    public enum TipoError
    {
        Ninguno,
        Validacion,
        NoEncontrado,
        NoAutorizado,
        Prohibido,
        Conflicto
    }

    // Resultado de una operacion de negocio. Permite que el controller devuelva el codigo HTTP adecuado
    public class Resultado<T>
    {
        public bool Exito { get; private init; }
        public T? Datos { get; private init; }
        public TipoError TipoError { get; private init; }
        public string? Error { get; private init; }

        public static Resultado<T> Ok(T datos) => new() { Exito = true, Datos = datos };

        public static Resultado<T> Fallo(TipoError tipo, string error) => new() { TipoError = tipo, Error = error };
    }
}
