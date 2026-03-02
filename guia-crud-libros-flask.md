# Guía Paso a Paso: Aplicación CRUD de Libros

## Conectando un Frontend (HTML + CSS + JS) con un Backend Orientado a Objetos en Python (Flask)

---

## ¿Qué vamos a construir?

Una aplicación web que permite **Crear, Leer, Actualizar y Eliminar** (CRUD) libros. El backend en Python expone una API REST y el frontend consume esa API usando JavaScript (`fetch`).

```
┌─────────────────────┐         HTTP (JSON)         ┌─────────────────────┐
│     FRONTEND        │ ◄──────────────────────────► │     BACKEND         │
│  HTML + CSS + JS    │   GET, POST, PUT, DELETE     │  Python + Flask     │
│  (El navegador)     │                              │  (El servidor)      │
└─────────────────────┘                              └─────────────────────┘
```

---

## Requisitos previos

- Python 3.8+ instalado
- Un editor de código (VS Code recomendado)
- Un navegador web moderno
- Conocimientos básicos de Python, HTML, CSS y JavaScript

---

## PASO 1: Crear la estructura del proyecto

Crea una carpeta para el proyecto con la siguiente estructura:

```
crud_libros/
├── backend/
│   ├── app.py
│   ├── libro.py
│   └── libro_service.py
└── frontend/
    ├── index.html
    ├── styles.css
    └── app.js
```

**En tu terminal:**

```bash
mkdir crud_libros
cd crud_libros
mkdir backend frontend
```

---

## PASO 2: Instalar Flask

Flask es un micro-framework web para Python. Nos permite crear un servidor HTTP fácilmente.

```bash
pip install flask flask-cors
```

> **¿Qué es `flask-cors`?** Cuando el frontend y el backend corren en puertos distintos, el navegador bloquea las peticiones por seguridad (política CORS). Este paquete permite que nuestro backend acepte peticiones desde otro origen.

---

## PASO 3: Crear la clase Libro (Modelo)

Este es nuestro modelo orientado a objetos. Crea el archivo `backend/libro.py`:

```python
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
```

### 💡 Conceptos clave aquí:

- `_contador_id` es un **atributo de clase** que se comparte entre todas las instancias.
- `to_dict()` es esencial: convierte el objeto Python a un diccionario, que luego Flask transforma a JSON para enviarlo al frontend.
- Usamos **encapsulamiento** al tener un método `actualizar()` que modifica los atributos de forma controlada.

---

## PASO 4: Crear el servicio (Lógica de negocio)

El servicio maneja la lógica CRUD. Crea el archivo `backend/libro_service.py`:

```python
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
```

### 💡 Conceptos clave aquí:

- **Separación de responsabilidades**: la clase `Libro` solo define qué es un libro, mientras que `LibroService` maneja la colección y las operaciones.
- `_libros` usa un guión bajo para indicar que es un atributo "privado" (convención en Python).
- Almacenamos los libros en una lista en memoria (en un proyecto real usarías una base de datos).

---

## PASO 5: Crear la API REST con Flask (Controlador)

Esta es la pieza que conecta el backend con el frontend. Crea el archivo `backend/app.py`:

```python
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
```

### 💡 Conceptos clave aquí:

| Concepto | Explicación |
|---|---|
| `@app.route` | Decorador que define una URL y el método HTTP que la activa |
| `request.get_json()` | Lee el cuerpo JSON de la petición del frontend |
| `jsonify()` | Convierte un diccionario Python a una respuesta JSON |
| Códigos HTTP | `200` = OK, `201` = Creado, `400` = Error del cliente, `404` = No encontrado |
| `<int:libro_id>` | Parámetro de ruta: Flask extrae el número de la URL y lo pasa como argumento |

### Tabla resumen de las rutas (endpoints):

| Método | URL | Acción |
|---|---|---|
| `GET` | `/api/libros` | Obtener todos los libros |
| `GET` | `/api/libros/1` | Obtener el libro con ID 1 |
| `POST` | `/api/libros` | Crear un libro nuevo |
| `PUT` | `/api/libros/1` | Actualizar el libro con ID 1 |
| `DELETE` | `/api/libros/1` | Eliminar el libro con ID 1 |

---

## PASO 6: Probar el backend (antes de crear el frontend)

1. Abre una terminal, navega a la carpeta `backend/` y ejecuta:

```bash
cd backend
python app.py
```

2. Deberías ver:
```
🚀 Servidor corriendo en http://localhost:5000
```

3. Prueba con `curl` en otra terminal (o usa Postman):

```bash
# Crear un libro
curl -X POST http://localhost:5000/api/libros \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Cien Años de Soledad", "autor": "Gabriel García Márquez", "isbn": "978-0307474728", "fecha_publicacion": "1967-05-30"}'

# Ver todos los libros
curl http://localhost:5000/api/libros
```

> **¡No avances al frontend si el backend no funciona!** Siempre prueba cada capa por separado.

---

## PASO 7: Crear el HTML (Estructura)

Crea el archivo `frontend/index.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRUD de Libros</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>📚 Gestión de Libros</h1>

        <!-- Formulario para crear/editar libros -->
        <div class="form-card">
            <h2 id="form-titulo">Agregar Nuevo Libro</h2>
            <form id="libro-form">
                <!-- Campo oculto para saber si estamos editando -->
                <input type="hidden" id="libro-id">

                <div class="form-group">
                    <label for="nombre">Nombre del libro:</label>
                    <input type="text" id="nombre" placeholder="Ej: Cien Años de Soledad" required>
                </div>

                <div class="form-group">
                    <label for="autor">Autor:</label>
                    <input type="text" id="autor" placeholder="Ej: Gabriel García Márquez" required>
                </div>

                <div class="form-group">
                    <label for="isbn">ISBN:</label>
                    <input type="text" id="isbn" placeholder="Ej: 978-0307474728" required>
                </div>

                <div class="form-group">
                    <label for="fecha_publicacion">Fecha de publicación:</label>
                    <input type="date" id="fecha_publicacion" required>
                </div>

                <div class="form-buttons">
                    <button type="submit" id="btn-submit">Guardar Libro</button>
                    <button type="button" id="btn-cancelar" class="btn-secondary" style="display:none;">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>

        <!-- Tabla de libros -->
        <div class="table-card">
            <h2>Libros Registrados</h2>
            <table id="tabla-libros">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Autor</th>
                        <th>ISBN</th>
                        <th>Fecha Publicación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tabla-body">
                    <!-- Las filas se generan dinámicamente con JavaScript -->
                </tbody>
            </table>
            <p id="sin-libros" class="mensaje-vacio">No hay libros registrados aún.</p>
        </div>
    </div>

    <!-- El JS va al final para que el HTML ya esté cargado -->
    <script src="app.js"></script>
</body>
</html>
```

---

## PASO 8: Crear los estilos CSS

Crea el archivo `frontend/styles.css`:

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f0f2f5;
    color: #333;
    padding: 20px;
}

.container {
    max-width: 900px;
    margin: 0 auto;
}

h1 {
    text-align: center;
    margin-bottom: 30px;
    color: #2c3e50;
}

/* ── Tarjetas ──────────────────────────── */
.form-card, .table-card {
    background: white;
    border-radius: 10px;
    padding: 25px;
    margin-bottom: 25px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* ── Formulario ────────────────────────── */
.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #555;
}

.form-group input {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.3s;
}

.form-group input:focus {
    outline: none;
    border-color: #3498db;
}

/* ── Botones ───────────────────────────── */
.form-buttons {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s;
}

#btn-submit {
    background-color: #27ae60;
    color: white;
}
#btn-submit:hover {
    background-color: #219a52;
}

.btn-secondary {
    background-color: #95a5a6;
    color: white;
}
.btn-secondary:hover {
    background-color: #7f8c8d;
}

.btn-editar {
    background-color: #f39c12;
    color: white;
    padding: 6px 12px;
    font-size: 13px;
}

.btn-eliminar {
    background-color: #e74c3c;
    color: white;
    padding: 6px 12px;
    font-size: 13px;
}

/* ── Tabla ──────────────────────────────── */
table {
    width: 100%;
    border-collapse: collapse;
}

thead {
    background-color: #2c3e50;
    color: white;
}

th, td {
    padding: 12px 10px;
    text-align: left;
}

tbody tr:nth-child(even) {
    background-color: #f8f9fa;
}

tbody tr:hover {
    background-color: #eaf2f8;
}

.mensaje-vacio {
    text-align: center;
    color: #999;
    padding: 20px;
    font-style: italic;
}
```

---

## PASO 9: Crear el JavaScript (¡La conexión!)

Este es el archivo más importante para entender la conexión frontend-backend. Crea `frontend/app.js`:

```javascript
// ══════════════════════════════════════════════════════════
//  CONFIGURACIÓN: URL base del backend
// ══════════════════════════════════════════════════════════
const API_URL = "http://localhost:5000/api/libros";

// ══════════════════════════════════════════════════════════
//  REFERENCIAS a elementos del DOM
// ══════════════════════════════════════════════════════════
const form = document.getElementById("libro-form");
const inputId = document.getElementById("libro-id");
const inputNombre = document.getElementById("nombre");
const inputAutor = document.getElementById("autor");
const inputIsbn = document.getElementById("isbn");
const inputFecha = document.getElementById("fecha_publicacion");
const tablaBody = document.getElementById("tabla-body");
const sinLibros = document.getElementById("sin-libros");
const formTitulo = document.getElementById("form-titulo");
const btnSubmit = document.getElementById("btn-submit");
const btnCancelar = document.getElementById("btn-cancelar");

// ══════════════════════════════════════════════════════════
//  READ: Obtener y mostrar todos los libros
// ══════════════════════════════════════════════════════════
async function cargarLibros() {
    try {
        // 👉 Petición GET al backend
        const respuesta = await fetch(API_URL);
        const libros = await respuesta.json();

        // Limpiar la tabla
        tablaBody.innerHTML = "";

        if (libros.length === 0) {
            sinLibros.style.display = "block";
            return;
        }

        sinLibros.style.display = "none";

        // Crear una fila por cada libro
        libros.forEach(libro => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${libro.id}</td>
                <td>${libro.nombre}</td>
                <td>${libro.autor}</td>
                <td>${libro.isbn}</td>
                <td>${libro.fecha_publicacion}</td>
                <td>
                    <button class="btn-editar" onclick="editarLibro(${libro.id})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarLibro(${libro.id})">Eliminar</button>
                </td>
            `;
            tablaBody.appendChild(fila);
        });
    } catch (error) {
        console.error("Error al cargar libros:", error);
        alert("No se pudo conectar con el servidor. ¿Está corriendo el backend?");
    }
}

// ══════════════════════════════════════════════════════════
//  CREATE / UPDATE: Enviar formulario
// ══════════════════════════════════════════════════════════
form.addEventListener("submit", async function (evento) {
    evento.preventDefault(); // Evita que la página se recargue

    // Construir el objeto con los datos del formulario
    const datosLibro = {
        nombre: inputNombre.value,
        autor: inputAutor.value,
        isbn: inputIsbn.value,
        fecha_publicacion: inputFecha.value
    };

    try {
        let respuesta;
        const libroId = inputId.value;

        if (libroId) {
            // 👉 MODO EDICIÓN: Petición PUT al backend
            respuesta = await fetch(`${API_URL}/${libroId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosLibro)
            });
        } else {
            // 👉 MODO CREACIÓN: Petición POST al backend
            respuesta = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosLibro)
            });
        }

        if (!respuesta.ok) {
            const error = await respuesta.json();
            alert("Error: " + error.error);
            return;
        }

        // Limpiar formulario y recargar tabla
        limpiarFormulario();
        cargarLibros();

    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Error al conectar con el servidor.");
    }
});

// ══════════════════════════════════════════════════════════
//  EDIT: Cargar datos de un libro en el formulario
// ══════════════════════════════════════════════════════════
async function editarLibro(id) {
    try {
        // 👉 Petición GET de un libro específico
        const respuesta = await fetch(`${API_URL}/${id}`);
        const libro = await respuesta.json();

        // Rellenar el formulario con los datos del libro
        inputId.value = libro.id;
        inputNombre.value = libro.nombre;
        inputAutor.value = libro.autor;
        inputIsbn.value = libro.isbn;
        inputFecha.value = libro.fecha_publicacion;

        // Cambiar la interfaz a "modo edición"
        formTitulo.textContent = "Editando Libro";
        btnSubmit.textContent = "Actualizar Libro";
        btnCancelar.style.display = "inline-block";

        // Hacer scroll hacia el formulario
        form.scrollIntoView({ behavior: "smooth" });

    } catch (error) {
        console.error("Error al obtener libro:", error);
    }
}

// ══════════════════════════════════════════════════════════
//  DELETE: Eliminar un libro
// ══════════════════════════════════════════════════════════
async function eliminarLibro(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar este libro?")) return;

    try {
        // 👉 Petición DELETE al backend
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (respuesta.ok) {
            cargarLibros(); // Recargar la tabla
        } else {
            alert("No se pudo eliminar el libro.");
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}

// ══════════════════════════════════════════════════════════
//  UTILIDADES
// ══════════════════════════════════════════════════════════
function limpiarFormulario() {
    form.reset();
    inputId.value = "";
    formTitulo.textContent = "Agregar Nuevo Libro";
    btnSubmit.textContent = "Guardar Libro";
    btnCancelar.style.display = "none";
}

btnCancelar.addEventListener("click", limpiarFormulario);

// ══════════════════════════════════════════════════════════
//  INICIO: Cargar libros al abrir la página
// ══════════════════════════════════════════════════════════
cargarLibros();
```

### 💡 Conceptos clave de la conexión:

**`fetch()`** es la función nativa de JavaScript para hacer peticiones HTTP. Así se comunica con el backend:

```
Frontend (JS)                          Backend (Python/Flask)
─────────────                          ─────────────────────
fetch(URL)                  ──GET──►   @app.route("/api/libros", methods=["GET"])
                            ◄──JSON──  return jsonify([...])

fetch(URL, {method:"POST"}) ──POST──►  @app.route("/api/libros", methods=["POST"])
     body: JSON.stringify() ◄──JSON──  datos = request.get_json()

fetch(URL/id, {method:"PUT"})──PUT──►  @app.route("/api/libros/<id>", methods=["PUT"])

fetch(URL/id, {method:"DELETE"})───►   @app.route("/api/libros/<id>", methods=["DELETE"])
```

**Puntos importantes:**

- `headers: { "Content-Type": "application/json" }` le dice al backend que estamos enviando JSON.
- `JSON.stringify(objeto)` convierte un objeto JavaScript a texto JSON para enviarlo.
- `respuesta.json()` convierte la respuesta JSON del backend a un objeto JavaScript.
- `async/await` permite escribir código asíncrono de forma legible (las peticiones HTTP toman tiempo).

---

## PASO 10: ¡Ejecutar la aplicación!

### Terminal 1 — Iniciar el backend:

```bash
cd crud_libros/backend
python app.py
```

### Terminal 2 — Abrir el frontend:

Simplemente abre el archivo `frontend/index.html` en tu navegador. Puedes hacerlo de varias formas:

**Opción A** — Doble clic en el archivo `index.html`

**Opción B** — Desde la terminal:
```bash
# En Linux/Mac:
open frontend/index.html
# En Windows:
start frontend/index.html
```

**Opción C** — Con la extensión "Live Server" de VS Code (recomendado):
1. Instala la extensión "Live Server" en VS Code
2. Clic derecho en `index.html` → "Open with Live Server"

---

## PASO 11: Verificar que todo funciona

Prueba cada operación del CRUD:

1. **CREATE** — Llena el formulario y haz clic en "Guardar Libro"
2. **READ** — La tabla debería mostrar el libro creado
3. **UPDATE** — Haz clic en "Editar", modifica algún dato y haz clic en "Actualizar Libro"
4. **DELETE** — Haz clic en "Eliminar" y confirma

Si ves errores en la consola del navegador (F12 → Console), revisa que:
- El backend esté corriendo en el puerto 5000
- No haya errores de tipeo en las URLs
- Flask-CORS esté instalado

---

## Resumen: Flujo completo de una operación

Veamos qué pasa paso a paso cuando el usuario crea un libro:

```
1. Usuario llena el formulario y presiona "Guardar"
       │
2. JavaScript captura el evento "submit"
       │
3. JS construye un objeto: { nombre: "...", autor: "...", isbn: "...", fecha_publicacion: "..." }
       │
4. JS lo convierte a JSON con JSON.stringify() y lo envía con fetch() vía POST
       │
       ▼
5. Flask recibe la petición en @app.route("/api/libros", methods=["POST"])
       │
6. Flask lee el JSON con request.get_json() → se convierte en un diccionario Python
       │
7. El servicio crea un objeto Libro con los datos
       │
8. El Libro se convierte a diccionario con libro.to_dict()
       │
9. Flask devuelve el diccionario como JSON con jsonify()
       │
       ▼
10. JS recibe la respuesta, la parsea con .json()
       │
11. JS llama a cargarLibros() que hace un GET para actualizar la tabla
       │
12. La tabla se actualiza mostrando el nuevo libro ✅
```

---

## Glosario rápido

| Término | Significado |
|---|---|
| **API REST** | Conjunto de URLs (endpoints) que permiten manipular datos usando métodos HTTP |
| **JSON** | Formato de texto para intercambiar datos (similar a un diccionario Python) |
| **fetch()** | Función de JavaScript para hacer peticiones HTTP |
| **CORS** | Política de seguridad del navegador que restringe peticiones entre distintos orígenes |
| **Endpoint** | Una URL específica del backend que realiza una acción |
| **Método HTTP** | GET (leer), POST (crear), PUT (actualizar), DELETE (eliminar) |
| **Código de estado** | Número que indica el resultado: 200 (OK), 201 (Creado), 404 (No encontrado) |

---

## Ejercicios propuestos

1. **Validación en el frontend**: Agrega validación para que el ISBN tenga exactamente 13 dígitos.
2. **Búsqueda**: Agrega un campo de búsqueda que filtre los libros por nombre o autor.
3. **Persistencia**: Investiga cómo guardar los libros en un archivo JSON para que no se pierdan al reiniciar el servidor.
4. **Nuevo atributo**: Agrega el atributo "género" (ficción, ciencia, historia, etc.) con un `<select>` en el formulario.
