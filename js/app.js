let cliente = {
  mesa: "",
  hora: "",
  pedido: [],
};

const categorias = {
  1: "comida",
  2: "bebida",
  3: "postres",
};

const btnGuardarcliente = document.querySelector("#guardar-cliente");
btnGuardarcliente.addEventListener("click", guardarCliente);

function guardarCliente() {
  const mesa = document.querySelector("#mesa").value;
  const hora = document.querySelector("#hora").value;
  const camposVacios = [mesa, hora].some((campo) => campo == "");

  if (camposVacios) {
    const existeAlerta = document.querySelector(".invalid-feedback");

    if (!existeAlerta) {
      const alerta = document.createElement("div");
      alerta.classList.add("invalid-feedback", "d-block", "text-center");
      alerta.textContent = "Todos los campos son obligatorios";
      document.querySelector(".modal-body form").appendChild(alerta);

      setTimeout(() => {
        alerta.remove();
      }, 3000);
    }
    return;
  }
  // asignar datos del formulario al cliente
  cliente = { ...cliente, mesa, hora };

  const modalFormulario = document.querySelector("#formulario");
  const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
  modalBootstrap.hide();

  mostrarSecciones();
  obtenerPlatillos();
}

function mostrarSecciones() {
  const seccionesOcultas = document.querySelectorAll(".d-none");
  seccionesOcultas.forEach((seccion) => seccion.classList.remove("d-none"));
}

function obtenerPlatillos() {
  const url = "http://localhost:3000/platillos";

  fetch(url)
    .then((respuesta) => respuesta.json())
    .then((resultado) => mostrarPlatillos(resultado))
    .catch((error) => console.log(error));
}

function mostrarPlatillos(platillos) {
  const contenido = document.querySelector("#platillos .contenido");

  platillos.forEach((platillo) => {
    const row = document.createElement("DIV");
    row.classList.add("row", "border-top");

    const nombre = document.createElement("DIV");
    nombre.classList.add("col-md-4", "py-3");
    nombre.textContent = platillo.nombre;

    const precio = document.createElement("DIV");
    precio.classList.add("col-md-3", "py-3", "fw-bold");
    precio.textContent = `$${platillo.precio}`;

    const categoria = document.createElement("DIV");
    categoria.classList.add("col-md-3", "py-3");
    categoria.textContent = categorias[platillo.categoria];

    const inputCantidad = document.createElement("INPUT");
    inputCantidad.type = "number";
    inputCantidad.min = 0;
    inputCantidad.value = 0;
    inputCantidad.id = `producto-${platillo.id}`;
    inputCantidad.classList.add("form-control");

    inputCantidad.onchange = function () {
      const cantidad = parseInt(inputCantidad.value);
      agregarPlatillo({ ...platillo, cantidad });
    };

    const agregar = document.createElement("div");
    agregar.classList.add("col-md-2");
    agregar.appendChild(inputCantidad);

    row.appendChild(nombre);
    row.appendChild(precio);
    row.appendChild(categoria);
    row.appendChild(agregar);
    contenido.appendChild(row);
  });
}

function agregarPlatillo(producto) {
  let { pedido } = cliente;

  // revisar que la cantidad sea mayor a cero
  if (producto.cantidad > 0) {
    if (pedido.some((articulo) => articulo.id === producto.id)) {
      const pedidoActualizado = pedido.map((articulo) => {
        if (articulo.id === producto.id) {
          articulo.cantidad = producto.cantidad;
        }
        return articulo;
      });
      // se asigna el nuevo array a cliente.pedido
      cliente.pedido = [...pedidoActualizado];
    } else {
      cliente.pedido = [...pedido, producto];
    }
  } else {
    // elimina los elemtos cuando la cantidad sea cero
    const resultado = pedido.filter((articulo) => articulo.id !== producto.id);
    cliente.pedido = [...resultado];
  }

  limpiarHTML();

  if (cliente.pedido.length) {
    actualizarResumen();
  } else {
    mensajePedidoVacio();
  }
}

function actualizarResumen() {
  const contenido = document.querySelector("#resumen .contenido");

  const resumen = document.createElement("DIV");
  resumen.classList.add("col-md-6", "card", "py-3", "px-3", "shadow");

  const mesa = document.createElement("P");
  mesa.textContent = "Mesa: ";
  mesa.classList.add("fw-bold");

  const mesaSpan = document.createElement("SPAN");
  mesaSpan.textContent = cliente.mesa;
  mesaSpan.classList.add("fw-normal");
  mesa.appendChild(mesaSpan);

  const hora = document.createElement("P");
  hora.textContent = "Hora: ";
  hora.classList.add("fw-bold");

  const horaSpan = document.createElement("SPAN");
  horaSpan.textContent = cliente.hora;
  horaSpan.classList.add("fw-normal");
  hora.appendChild(horaSpan);

  const heading = document.createElement("H3");
  heading.textContent = "Platillos Pedidos";
  heading.classList.add("my-4");

  mesa.appendChild(mesaSpan);
  hora.appendChild(horaSpan);

  const grupo = document.createElement("UL");
  grupo.classList.add("list-group");

  const { pedido } = cliente;
  pedido.forEach((articulo) => {
    const { nombre, cantidad, precio, id } = articulo;

    const lista = document.createElement("LI");
    lista.classList.add("list-group-item");

    const nombreEl = document.createElement("h4");
    nombreEl.classList.add("text-center", "my-4");
    nombreEl.textContent = nombre;

    const cantidadEl = document.createElement("P");
    cantidadEl.classList.add("fw-bold");
    cantidadEl.textContent = "Cantidad: ";

    const cantidadValor = document.createElement("SPAN");
    cantidadValor.classList.add("fw-normal");
    cantidadValor.textContent = cantidad;

    const precioEl = document.createElement("P");
    precioEl.classList.add("fw-bold");
    precioEl.textContent = "Precio: ";

    const precioValor = document.createElement("SPAN");
    precioValor.classList.add("fw-normal");
    precioValor.textContent = `$${precio}`;

    const subtotalEl = document.createElement("P");
    subtotalEl.classList.add("fw-bold");
    subtotalEl.textContent = "Subtotal: ";

    const subtotalValor = document.createElement("SPAN");
    subtotalValor.classList.add("fw-normal");
    subtotalValor.textContent = calcularSubtotal(precio, cantidad);

    const btnEliminar = document.createElement("BUTTON");
    btnEliminar.classList.add("btn", "btn-danger");
    btnEliminar.textContent = "Eliminar Pedido";

    btnEliminar.onclick = function () {
      eliminarProducto(id);
    };

    cantidadEl.appendChild(cantidadValor);
    precioEl.appendChild(precioValor);
    subtotalEl.appendChild(subtotalValor);

    lista.appendChild(nombreEl);
    lista.appendChild(cantidadEl);
    lista.appendChild(precioValor);
    lista.appendChild(subtotalEl);
    lista.appendChild(btnEliminar);
    grupo.appendChild(lista);
  });

  resumen.appendChild(heading);
  resumen.appendChild(mesa);
  resumen.appendChild(hora);
  resumen.appendChild(grupo);
  contenido.appendChild(resumen);

  // mostrar formulario de propinas
  formularioPropinas();
}

function limpiarHTML() {
  const contenido = document.querySelector("#resumen .contenido");

  while (contenido.firstChild) {
    contenido.removeChild(contenido.firstChild);
  }
}

function calcularSubtotal(precio, cantidad) {
  return ` $ ${precio * cantidad} `;
}

function eliminarProducto(id) {
  const { pedido } = cliente;
  const resultado = pedido.filter((articulo) => articulo.id !== id);
  cliente.pedido = [...resultado];

  limpiarHTML();

  if (cliente.pedido.length) {
    actualizarResumen();
  } else {
    mensajePedidoVacio();
  }
  const productoEliminado = `#producto-${id} `;
  const inputEliminado = document.querySelector(productoEliminado);
  inputEliminado.value = 0;
}

function mensajePedidoVacio() {
  const contenido = document.querySelector("#resumen .contenido");

  const texto = document.createElement("P");
  texto.classList.add("text-center");
  texto.textContent = "Añade Productos al Pedido";

  contenido.appendChild(texto);
}
function formularioPropinas() {
  const contenido = document.querySelector("#resumen .contenido");

  const formulario = document.createElement("DIV");
  formulario.classList.add("col-md-6", "formulario");

  const divFormulario = document.createElement("div");
  divFormulario.classList.add("card", "py-3", "px-3", "shadow");

  const heading = document.createElement("H3");
  heading.classList.add("my-4", "text-center");
  heading.textContent = "Propina";

  // Propina 10%
  const checkBox10 = document.createElement("INPUT");
  checkBox10.type = "radio";
  checkBox10.name = "propina";
  checkBox10.value = "10";
  checkBox10.classList.add("form-check-input");
  checkBox10.onclick = calcularPropina;

  const checkLabel10 = document.createElement("LABEL");
  checkLabel10.textContent = "10%";
  checkLabel10.classList.add("form-check-label");
  const checkDiv10 = document.createElement("DIV");
  checkDiv10.classList.add("form-check");

  checkDiv10.appendChild(checkBox10);
  checkDiv10.appendChild(checkLabel10);

  // Propina 25%
  const checkBox25 = document.createElement("INPUT");
  checkBox25.type = "radio";
  checkBox25.name = "propina";
  checkBox25.value = "25";
  checkBox25.classList.add("form-check-input");
  checkBox25.onclick = calcularPropina;

  const checkLabel25 = document.createElement("LABEL");
  checkLabel25.textContent = "25%";
  checkLabel25.classList.add("form-check-label");
  const checkDiv25 = document.createElement("DIV");
  checkDiv25.classList.add("form-check");

  checkDiv25.appendChild(checkBox25);
  checkDiv25.appendChild(checkLabel25);

  divFormulario.appendChild(heading);
  divFormulario.appendChild(checkDiv10);
  divFormulario.appendChild(checkDiv25);

  formulario.appendChild(divFormulario);
  contenido.appendChild(formulario);
}

function calcularPropina() {
  const { pedido } = cliente;
  let subtotal = 0;

  pedido.forEach((articulo) => {
    subtotal += articulo.cantidad * articulo.precio;
  });

  const propinaSelecionada = document.querySelector(
    '[name="propina"]:checked'
  ).value;

  const propina = (subtotal * parseInt(propinaSelecionada)) / 100;
  const total = subtotal + propina;
  mostrarHTML(subtotal, total, propina);
}

function mostrarHTML(subtotal, total, propina) {
  const divTotales = document.createElement("div");
  divTotales.classList.add("total-pagar");

  const subtotalParrafo = document.createElement("p");
  subtotalParrafo.classList.add("fs-3", "fw-bold", "mt-3");
  subtotalParrafo.textContent = "subtotal consumo ";

  const subtotalSpan = document.createElement("SPAN");
  subtotalSpan.classList.add("fw-normal");
  subtotalSpan.textContent = `$${subtotal}`;
  subtotalParrafo.appendChild(subtotalSpan);

  const propinaParrafo = document.createElement("P");
  propinaParrafo.classList.add("fs-3", "fw-bold", "mt-3");
  propinaParrafo.textContent = "Propina: ";

  const propinaSpan = document.createElement("SPAN");
  propinaSpan.classList.add("fw-normal");
  propinaSpan.textContent = `$${propina}`;
  propinaParrafo.appendChild(propinaSpan);

  // Total
  const totalParrafo = document.createElement("P");
  totalParrafo.classList.add("fs-3", "fw-bold", "mt-3");
  totalParrafo.textContent = "Total a Pagar: ";

  const totalSpan = document.createElement("SPAN");
  totalSpan.classList.add("fw-normal");
  totalSpan.textContent = `$${total}`;
  totalParrafo.appendChild(totalSpan);

  // eliminar el ultimo resultado
  const totalpagarDiv = document.querySelector(".total-pagar");
  if (totalpagarDiv) {
    totalpagarDiv.remove();
  }

  divTotales.appendChild(subtotalParrafo);
  divTotales.appendChild(propinaParrafo);
  divTotales.appendChild(totalParrafo);

  const formulario = document.querySelector(".formulario > div");
  formulario.appendChild(divTotales);
}
