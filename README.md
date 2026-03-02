# CRUD de Libros - Flask + HTML/CSS/JS

Aplicacion web CRUD (Crear, Leer, Actualizar, Eliminar) para gestionar libros. El backend expone una API REST con Flask y el frontend consume la API usando JavaScript vanilla.

## Arquitectura del Proyecto

```
┌─────────────────────┐         HTTP (JSON)         ┌─────────────────────┐
│     FRONTEND        │ ◄──────────────────────────► │     BACKEND         │
│  HTML + CSS + JS    │   GET, POST, PUT, DELETE     │  Python + Flask     │
│  (El navegador)     │                              │  (El servidor)      │
└─────────────────────┘                              └─────────────────────┘
```

### Estructura de Carpetas

```
crud_libros/
├── backend/
│   ├── app.py              # API REST (Controlador) - Rutas y endpoints
│   ├── libro.py            # Modelo - Clase Libro (POO)
│   └── libro_service.py    # Servicio - Logica de negocio CRUD
├── frontend/
│   ├── index.html          # Estructura HTML
│   ├── styles.css          # Estilos Material Design
│   └── app.js              # Logica JS - Conexion con la API (fetch)
├── requirements.txt        # Dependencias Python
└── README.md
```

### Capas del Backend

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| **Modelo** | `libro.py` | Define la clase `Libro` con sus atributos y metodos |
| **Servicio** | `libro_service.py` | Logica de negocio: crear, obtener, actualizar, eliminar libros |
| **Controlador** | `app.py` | Expone los endpoints REST y maneja las peticiones HTTP |

### Endpoints de la API

| Metodo | URL | Descripcion |
|--------|-----|-------------|
| `GET` | `/api/libros` | Obtener todos los libros |
| `GET` | `/api/libros/<id>` | Obtener un libro por ID |
| `POST` | `/api/libros` | Crear un nuevo libro |
| `PUT` | `/api/libros/<id>` | Actualizar un libro existente |
| `DELETE` | `/api/libros/<id>` | Eliminar un libro |

### Flujo de Datos

1. El usuario interactua con el formulario HTML
2. JavaScript captura el evento y construye un objeto JSON
3. `fetch()` envia la peticion HTTP al backend
4. Flask recibe la peticion y la procesa con el servicio
5. El servicio manipula los objetos `Libro` en memoria
6. Flask devuelve la respuesta JSON
7. JavaScript actualiza la interfaz con los datos recibidos

---

## Requisitos Previos

- Python 3.8 o superior
- Un navegador web moderno

---

## Instalacion de Dependencias

### Opcion 1: Usando pip

```bash
cd crud_libros
pip install -r requirements.txt
```

### Opcion 2: Usando uv (recomendado, mas rapido)

```bash
# Instalar uv si no lo tienes
curl -LsSf https://astral.sh/uv/install.sh | sh

# Crear entorno virtual e instalar dependencias
cd crud_libros
uv venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
```

### Opcion 3: Usando uv con pip sync

```bash
cd crud_libros
uv venv
source .venv/bin/activate
uv pip sync requirements.txt
```

---

## Ejecutar la Aplicacion

### 1. Iniciar el Backend

Abre una terminal y ejecuta:

```bash
cd crud_libros/backend
python app.py
```

Deberias ver:
```
Servidor corriendo en http://localhost:5000
```

> **Nota:** El servidor debe permanecer corriendo mientras uses la aplicacion.

### 2. Abrir el Frontend

Tienes varias opciones:

**Opcion A - Doble clic:**
Abre el archivo `frontend/index.html` directamente en tu navegador.

**Opcion B - Desde terminal (macOS):**
```bash
open frontend/index.html
```

**Opcion C - Desde terminal (Linux):**
```bash
xdg-open frontend/index.html
```

**Opcion D - Desde terminal (Windows):**
```bash
start frontend/index.html
```

**Opcion E - Live Server (VS Code):**
1. Instala la extension "Live Server" en VS Code
2. Clic derecho en `index.html` > "Open with Live Server"

---

## Probar la API con curl

```bash
# Crear un libro
curl -X POST http://localhost:5000/api/libros \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Cien Anos de Soledad", "autor": "Gabriel Garcia Marquez", "isbn": "978-0307474728", "fecha_publicacion": "1967-05-30"}'

# Obtener todos los libros
curl http://localhost:5000/api/libros

# Obtener un libro por ID
curl http://localhost:5000/api/libros/1

# Actualizar un libro
curl -X PUT http://localhost:5000/api/libros/1 \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Cien Anos de Soledad (Edicion Especial)", "autor": "Gabriel Garcia Marquez", "isbn": "978-0307474728", "fecha_publicacion": "1967-05-30"}'

# Eliminar un libro
curl -X DELETE http://localhost:5000/api/libros/1
```

---

## Tecnologias Utilizadas

### Backend
- **Python 3.8+** - Lenguaje de programacion
- **Flask** - Micro-framework web
- **Flask-CORS** - Manejo de politicas CORS

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos (Material Design)
- **JavaScript (ES6+)** - Logica y conexion con API
- **Google Sans** - Tipografia

---

## Notas Importantes

- Los datos se almacenan **en memoria**. Al reiniciar el servidor, los libros se pierden.
- El backend corre en el puerto **5000** por defecto.
- Flask-CORS permite que el frontend (archivo local) se comunique con el backend.

---

## Solucion de Problemas

### Error: "No se pudo conectar con el servidor"
- Verifica que el backend este corriendo (`python app.py`)
- Asegurate de que el puerto 5000 no este ocupado

### Error: "CORS policy"
- Verifica que `flask-cors` este instalado
- Reinicia el servidor backend

### El frontend no carga estilos
- Asegurate de abrir `index.html` desde la carpeta `frontend/`
- Los archivos `styles.css` y `app.js` deben estar en la misma carpeta
