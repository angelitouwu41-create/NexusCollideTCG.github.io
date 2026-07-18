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
        
        categorias.forEach(categoria => {
            const listContainer = document.getElementById(`lista-${categoria}`);
            
            if (listContainer && data[categoria]) {
                data[categoria].forEach(carta => {
                    
                    const listItem = document.createElement('li');
                    
                    if (carta.tags) {
                        listItem.classList.add(...carta.tags.split(" "));
                    }
                    listItem.classList.add("filtrable");
                    
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
                        imageElement.src = "https://dragtcg.neocities.org/" + carta.imagenes[0];
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
                                btnArte.onclick = () => {
                                    imageElement.src = "https://dragtcg.neocities.org/" + rutaAlterna;
                                };
                                
                                controlesDiv.appendChild(btnArte);
                            });
                            
                            listItem.appendChild(controlesDiv);
                        }
                    }
                    
                    listContainer.appendChild(listItem);
                });
            }
        });
    })
    .catch(error => console.error('Fetch error:', error));