document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/productos')
    .then(response => response.json())
    .then(productos => {
      const productosDiv = document.getElementById('productos');
      productos.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto';
        productoDiv.innerHTML = `
          <img src="/images/${producto.imagen}" alt="${producto.nombre}">
          <h2>${producto.nombre}</h2>
          <p>${producto.descripcion}</p>
          <p>Precio: ${producto.precio}€</p>
          <a href="/views/${producto.nombre.toLowerCase().replace(/ /g, '_')}.html">Ver más</a>
        `;
        productosDiv.appendChild(productoDiv);
      });
    });

  const searchBox = document.getElementById('search-box');
  const searchResults = document.getElementById('search-results');

  searchBox.addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();
    if (query.length >= 3) {
      fetch('/api/productos')
        .then(response => response.json())
        .then(productos => {
          searchResults.innerHTML = '';
          productos.filter(producto => producto.nombre.toLowerCase().includes(query))
            .forEach(producto => {
              const li = document.createElement('li');
              li.innerHTML = `<a href="/views/${producto.nombre.toLowerCase().replace(/ /g, '_')}.html">${producto.nombre}</a>`;
              searchResults.appendChild(li);
            });
        });
    } else {
      searchResults.innerHTML = '';
    }
  });

  const searchForm = document.getElementById('search-form');
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = searchBox.value.toLowerCase();
    fetch('/api/productos')
      .then(response => response.json())
      .then(productos => {
        const producto = productos.find(producto => producto.nombre.toLowerCase() === query);
        if (producto) {
          window.location.href = `/views/${producto.nombre.toLowerCase().replace(/ /g, '_')}.html`;
        }
      });
  });
});
