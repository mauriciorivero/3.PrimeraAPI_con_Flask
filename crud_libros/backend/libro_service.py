from libro import Libro


class LibroService:
    """Servicio que gestiona la colección de libros (lógica de negocio)."""

    def __init__(self):
        self._libros: list[Libro] = []

    def crear_libro(self, nombre: str, autor: str, isbn: str, fecha_publicacion: str) -> Libro:
        """Crea un nuevo libro y lo agrega a la colección."""
        libro = Libro(nombre, autor, isbn, fecha_publicacion)
        self._libros.append(libro)
        return libro

    def obtener_todos(self) -> list[Libro]:
        """Retorna todos los libros."""
        return self._libros

    def obtener_por_id(self, libro_id: int) -> Libro | None:
        """Busca un libro por su ID."""
        for libro in self._libros:
            if libro.id == libro_id:
                return libro
        return None

    def actualizar_libro(self, libro_id: int, nombre: str, autor: str,
                         isbn: str, fecha_publicacion: str) -> Libro | None:
        """Actualiza un libro existente. Retorna None si no lo encuentra."""
        libro = self.obtener_por_id(libro_id)
        if libro:
            libro.actualizar(nombre, autor, isbn, fecha_publicacion)
        return libro

    def eliminar_libro(self, libro_id: int) -> bool:
        """Elimina un libro por ID. Retorna True si lo eliminó, False si no existía."""
        libro = self.obtener_por_id(libro_id)
        if libro:
            self._libros.remove(libro)
            return True
        return False
