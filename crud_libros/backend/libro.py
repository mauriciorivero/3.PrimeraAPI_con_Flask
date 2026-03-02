class Libro:
    """Representa un libro en nuestro sistema."""

    # Contador de clase para generar IDs únicos
    _contador_id = 0

    def __init__(self, nombre: str, autor: str, isbn: str, fecha_publicacion: str):
        Libro._contador_id += 1
        self.id = Libro._contador_id
        self.nombre = nombre
        self.autor = autor
        self.isbn = isbn
        self.fecha_publicacion = fecha_publicacion

    def to_dict(self) -> dict:
        """Convierte el objeto Libro a un diccionario (para enviar como JSON)."""
        return {
            "id": self.id,
            "nombre": self.nombre,
            "autor": self.autor,
            "isbn": self.isbn,
            "fecha_publicacion": self.fecha_publicacion
        }

    def actualizar(self, nombre: str, autor: str, isbn: str, fecha_publicacion: str):
        """Actualiza los atributos del libro."""
        self.nombre = nombre
        self.autor = autor
        self.isbn = isbn
        self.fecha_publicacion = fecha_publicacion

    def __repr__(self):
        return f"Libro(id={self.id}, nombre='{self.nombre}', autor='{self.autor}')"
