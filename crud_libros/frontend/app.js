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
