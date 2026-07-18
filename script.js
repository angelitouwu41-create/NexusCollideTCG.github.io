const categorias = [
    'reinas', 'gatadas', 'escenas', 
    'armas', 'conmemorativas', 'poderes', 'evoluciones'
];

fetch('cartas_deckbuilder.json')
    .then(response => {
        if (!response.ok) throw new Error('Network error');
        return response.json();
    })
    .then(data => {
        const origenesUnicos = new Set();
        categorias.forEach(categoria => {
            const listContainer = document.getElementById(`lista-${categoria}`);
            
            if (listContainer && data[categoria]) {
                data[categoria].forEach(carta => {
                    
                    const listItem = document.createElement('li');
                    
                    if (carta.tags) {
                        listItem.classList.add(...carta.tags.split(" "));
                    }
                    listItem.classList.add("filtrable");
                    listItem.style.cursor = "pointer"; // Para que parezca un botón clickeable

                    if (carta.origen) {
                        const origenLimpio = carta.origen.trim();
                        listItem.dataset.origen = origenLimpio.toLowerCase();
                        origenesUnicos.add(origenLimpio); // Lo guardamos para la lista desplegable
                    } else {
                        listItem.dataset.origen = "desconocido"; // Por si alguna carta no tiene origen
                    }

                    // Evento para agregar al deckbuilder al hacer clic en la tarjeta
                    listItem.onclick = () => {
                        if (typeof agregarAlDeck === "function") {
                            agregarAlDeck(carta, categoria);
                        }
                    };
                    
                    // Nombre de la carta
                    const nameSpan = document.createElement('div');
                    nameSpan.textContent = carta.nombre;
                    nameSpan.style.fontWeight = "bold";
                    nameSpan.style.fontSize = "12px";
                    listItem.appendChild(nameSpan);
                    
                    // Asegurarnos de que exista al menos una imagen
                    if (carta.imagenes && carta.imagenes.length > 0) {
                        
                        // 1. Crear SIEMPRE solo la primera imagen por defecto
                        const imageElement = document.createElement('img');
                        imageElement.src =  carta.imagenes[0];
                        imageElement.alt = carta.nombre;
                        listItem.appendChild(imageElement);
                        
                        // 2. Si hay más de una imagen, crear botones para intercambiarlas
                        if (carta.imagenes.length > 1) {
                            const controlesDiv = document.createElement('div');
                            controlesDiv.style.display = "flex";
                            controlesDiv.style.gap = "5px";
                            controlesDiv.style.flexWrap = "wrap";
                            controlesDiv.style.justifyContent = "center";
                            
                            carta.imagenes.forEach((rutaAlterna, index) => {
                                const btnArte = document.createElement('button');
                                btnArte.textContent = index === 0 ? "Normal" : `Alt ${index}`;
                                // Usamos clases de Bootstrap para que el botón se vea bien
                                btnArte.className = "btn btn-sm btn-outline-light";
                                btnArte.style.fontSize = "10px";
                                btnArte.style.padding = "2px 6px";
                                
                                // Evento: al hacer clic, cambia la ruta de la imagen principal
                                btnArte.onclick = (e) => {
                                    e.stopPropagation(); // EVITA que se agregue al mazo al cambiar de arte
                                    imageElement.src = rutaAlterna;
                                };
                                
                                controlesDiv.appendChild(btnArte);
                            });
                            
                            listItem.appendChild(controlesDiv);
                        }

                        // 3. Botón de Descarga Directa (Ignorando CORS)
                        const btnDescarga = document.createElement('button');
                        btnDescarga.textContent = '⬇ Descargar';
                        btnDescarga.className = "btn btn-sm btn-outline-info mt-2 w-100 fw-bold";
                        btnDescarga.style.fontSize = "11px";

                        btnDescarga.onclick = (e) => {
                            e.stopPropagation(); // EVITA que la carta se vaya al deckbuilder al descargar
                            
                            const a = document.createElement('a');
                            a.href = imageElement.src;
                            a.download = carta.nombre.replace(/[^a-zA-Z0-9áéíóú ]/g, '_') + ".jpg";
                            a.target = "_blank"; // Abre en nueva pestaña si el navegador bloquea el download directo
                            
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        };

                        listItem.appendChild(btnDescarga);
                    }
                    
                    listContainer.appendChild(listItem);
                });
            }
        });
        const selectOrigen = document.getElementById('filtroOrigen');
        if (selectOrigen) {
            Array.from(origenesUnicos).sort().forEach(origen => {
                const option = document.createElement('option');
                option.value = origen.toLowerCase();
                option.textContent = origen;
                selectOrigen.appendChild(option);
            });
        }
    })
    .catch(error => console.error('Fetch error:', error));