from flask import Flask, request, jsonify
from flask_cors import CORS
from libro_service import LibroService

app = Flask(__name__)
CORS(app)  # Permite peticiones desde el frontend

# Instancia del servicio (nuestro "almacén" de libros)
servicio = LibroService()


# ── CREATE: Crear un libro ──────────────────────────────
@app.route("/api/libros", methods=["POST"])
def crear_libro():
    datos = request.get_json()  # Lee el JSON que envía el frontend

    # Validación básica
    campos = ["nombre", "autor", "isbn", "fecha_publicacion"]
    for campo in campos:
        if campo not in datos or not datos[campo].strip():
            return jsonify({"error": f"El campo '{campo}' es obligatorio"}), 400

    libro = servicio.crear_libro(
        nombre=datos["nombre"],
        autor=datos["autor"],
        isbn=datos["isbn"],
        fecha_publicacion=datos["fecha_publicacion"]
    )
    return jsonify(libro.to_dict()), 201  # 201 = Creado exitosamente


# ── READ: Obtener todos los libros ──────────────────────
@app.route("/api/libros", methods=["GET"])
def obtener_libros():
    libros = servicio.obtener_todos()
    return jsonify([libro.to_dict() for libro in libros])


# ── READ: Obtener un libro por ID ───────────────────────
@app.route("/api/libros/<int:libro_id>", methods=["GET"])
def obtener_libro(libro_id):
    libro = servicio.obtener_por_id(libro_id)
    if libro is None:
        return jsonify({"error": "Libro no encontrado"}), 404
    return jsonify(libro.to_dict())


# ── UPDATE: Actualizar un libro ─────────────────────────
@app.route("/api/libros/<int:libro_id>", methods=["PUT"])
def actualizar_libro(libro_id):
    datos = request.get_json()

    campos = ["nombre", "autor", "isbn", "fecha_publicacion"]
    for campo in campos:
        if campo not in datos or not datos[campo].strip():
            return jsonify({"error": f"El campo '{campo}' es obligatorio"}), 400

    libro = servicio.actualizar_libro(
        libro_id=libro_id,
        nombre=datos["nombre"],
        autor=datos["autor"],
        isbn=datos["isbn"],
        fecha_publicacion=datos["fecha_publicacion"]
    )
    if libro is None:
        return jsonify({"error": "Libro no encontrado"}), 404
    return jsonify(libro.to_dict())


# ── DELETE: Eliminar un libro ────────────────────────────
@app.route("/api/libros/<int:libro_id>", methods=["DELETE"])
def eliminar_libro(libro_id):
    eliminado = servicio.eliminar_libro(libro_id)
    if not eliminado:
        return jsonify({"error": "Libro no encontrado"}), 404
    return jsonify({"mensaje": "Libro eliminado exitosamente"})


# ── Iniciar el servidor ─────────────────────────────────
if __name__ == "__main__":
    print("🚀 Servidor corriendo en http://localhost:5000")
    app.run(debug=True, port=5000)
