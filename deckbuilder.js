/* ==========================================
   ESTADO GLOBAL DEL DECK
========================================== */
const deck = {
    Personajes: [],
    Habilidad: [],
    Campos: []
};

// Variable global para almacenar todas las cartas del JSON (para el deck random y validaciones)
let catalogoCartas = { Personajes: [], Habilidades: [], Campos: [] };

// Cargar catálogo silenciosamente para que el builder sepa qué cartas existen
fetch('cartas_deckbuilder.json?v=1.1')
    .then(r => r.json())
    .then(data => { catalogoCartas = data; });

/* ==========================================
   AGREGAR Y QUITAR CARTAS
========================================== */
function agregarAlDeck(cartaObj, categoria) {
    // Validar si la categoría es válida para el deckbuilder (solo soporta estas 3 por ahora)
    if (!['Personajes', 'Habilidad', 'Campos'].includes(categoria)) return;

    // Límite por categoría
    const limites = { Personajes: 5, Habilidad: 3, Campos: 2 };
    
    // Evitar duplicados exactos
    const yaExiste = deck[categoria].some(c => c.nombre === cartaObj.nombre);
    if (yaExiste) {
        // Si ya existe y le da click en el buscador, la quitamos (toggle)
        quitarDelDeck(cartaObj.nombre, categoria);
        return;
    }

    if (deck[categoria].length >= limites[categoria]) {
        alert(`¡ALTO AHÍ! Máximo ${limites[categoria]} ${categoria}.`);
        return;
    }

    // === LÓGICA DE FAGGS Y NOFLAWWZ (Legacy port) ===
    const tags = cartaObj.tags || "";
    const esFaggs = tags.includes('faggs');
    const esNoFlawwz = tags.includes('noflawwz');
    const todasLasCartasDelDeck = [...deck.reinas, ...deck.gatadas, ...deck.escenas];

    if (esFaggs && todasLasCartasDelDeck.some(c => c.tags.includes('noflawwz'))) {
        alert('¡ALTO AHÍ! Estas cartas no se llevan (Faggs vs NoFlawwz).');
        return;
    }
    if (esNoFlawwz && todasLasCartasDelDeck.some(c => c.tags.includes('faggs'))) {
        alert('¡ALTO AHÍ! Estas cartas no se llevan (Faggs vs NoFlawwz).');
        return;
    }

    // === LÓGICA DE BRUJAS ===
    if (tags.includes('bruja') && todasLasCartasDelDeck.some(c => c.tags.includes('bruja'))) {
        alert('Solo puedes tener 1 carta Bruja en todo el mazo.');
        return;
    }

    // Añadir al estado
    deck[categoria].push(cartaObj);
    renderDeck();
}

function quitarDelDeck(nombreCarta, categoria) {
    deck[categoria] = deck[categoria].filter(c => c.nombre !== nombreCarta);
    renderDeck();
}

/* ==========================================
   RENDERIZAR EL DECK EN LA UI
========================================== */
function renderDeck() {
    ['reinas', 'gatadas', 'escenas'].forEach(categoria => {
        const contenedor = document.getElementById(`${categoria}-builder`);
        const contador = document.getElementById(`cont-${categoria}`);
        
        if (!contenedor || !contador) return;
        
        contador.textContent = deck[categoria].length;
        contenedor.innerHTML = '';

        deck[categoria].forEach(carta => {
            const div = document.createElement('div');
            // Estilos para la miniatura en el builder
            div.style.cssText = "width: 80px; cursor: pointer; transition: transform 0.2s;";
            div.onmouseover = () => div.style.transform = "scale(1.05)";
            div.onmouseout = () => div.style.transform = "scale(1)";
            
            // Al hacer clic en la miniatura del deck, se quita
            div.onclick = () => quitarDelDeck(carta.nombre, categoria);

            const img = document.createElement('img');
            img.src = carta.imagenes[0];
            img.style.cssText = "width: 100%; border-radius: 6px; border: 2px solid red;";
            img.alt = carta.nombre;

            div.appendChild(img);
            contenedor.appendChild(div);
        });
    });
}

/* ==========================================
   LOCAL STORAGE (Guardar/Cargar/Borrar)
========================================== */
function obtenerDecksGuardados() {
    return JSON.parse(localStorage.getItem('misDecks') || '{}');
}

function guardarDeck() {
    const nombre = prompt('Nombre del deck:');
    if (!nombre) return;

    const decks = obtenerDecksGuardados();
    decks[nombre] = {
        reinas: deck.Personajes,
        gatadas: deck.Habilidad,
        escenas: deck.Campos
    };

    localStorage.setItem('misDecks', JSON.stringify(decks));
    localStorage.setItem('deckActualNombre', nombre);
    actualizarListaDecks();
    alert('Deck guardado 💾');
}

function cargarDeck(nombre) {
    const decks = obtenerDecksGuardados();
    const guardado = decks[nombre];

    if (!guardado) {
        alert('Deck no encontrado');
        return;
    }

    deck.reinas = guardado.reinas || [];
    deck.gatadas = guardado.gatadas || [];
    deck.escenas = guardado.escenas || [];

    localStorage.setItem('deckActualNombre', nombre);
    renderDeck();

    alert(`Deck "${nombre}" cargado 📂`);
}

function borrarDeck(nombre) {
    const decks = obtenerDecksGuardados();
    delete decks[nombre];
    localStorage.setItem('misDecks', JSON.stringify(decks));
    actualizarListaDecks();
    alert('Deck eliminado 🗑');
}

function actualizarListaDecks() {
    const cont = document.getElementById('listaDecks');
    if (!cont) return;

    const decks = obtenerDecksGuardados();
    cont.innerHTML = '';
    const nombres = Object.keys(decks);

    if (nombres.length === 0) {
        cont.innerHTML = `<div class="text-muted text-center" style="font-size:13px;">No hay decks guardados</div>`;
        return;
    }

    nombres.forEach(nombre => {
        const div = document.createElement('div');
        div.className = "d-flex justify-content-between align-items-center p-2 mb-2 rounded";
        div.style.backgroundColor = "#1f1f1f";

        div.innerHTML = `
            <div class="fw-bold">${nombre}</div>
            <div class="d-flex gap-2">
                <button onclick="cargarDeck('${nombre}')" class="btn btn-sm" style="background:#7bffcf;">📂</button>
                <button onclick="borrarDeck('${nombre}')" class="btn btn-sm btn-danger">🗑</button>
            </div>
        `;
        cont.appendChild(div);
    });
}


/* ==========================================
   DESCARGAR IMÁGENES INDIVIDUALES
========================================== */
/* ==========================================
   DESCARGAR IMÁGENES INDIVIDUALES (FIX CORS)
========================================== */
async function descargarSoloImagenes() {
    const todas = [...deck.reinas, ...deck.gatadas, ...deck.escenas];
    
    if (todas.length === 0) {
        alert("Aún no tienes cartas en el mazo.");
        return;
    }
    
    for (let c of todas) {
        try {
            // 1. Descargamos la imagen a la memoria del navegador (Blob)
            
            const url = c.imagenes[0];
            const response = await fetch(url);
            const blob = await response.blob();
            
            // 2. Creamos una URL local temporal que el navegador SÍ permite descargar
            const urlLocal = window.URL.createObjectURL(blob);
            
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = urlLocal;
            a.download = c.nombre.replace(/[^a-zA-Z0-9áéíóú ]/g, '_') + ".jpg";
            
            document.body.appendChild(a);
            a.click();
            
            // 3. Limpiamos la memoria
            document.body.removeChild(a);
            window.URL.revokeObjectURL(urlLocal);
            
        } catch (error) {
            console.error("No se pudo descargar la carta:", c.nombre, error);
        }
        
        // Pausa entre descargas para que el navegador no colapse
        await new Promise(r => setTimeout(r, 400));
    }
}
/* ==========================================
   DECK RANDOM
========================================== */
function mezclarArray(array) {
    const copia = [...array];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

function crearDeckRandom() {
    // Verificamos que el JSON ya se haya cargado en catalogoCartas
    if (!catalogoCartas || !catalogoCartas.reinas || catalogoCartas.reinas.length === 0) {
        alert("Las cartas aún se están cargando o no se encontraron.");
        return;
    }
    
    // Llenamos el mazo respetando los límites
    deck.reinas = mezclarArray(catalogoCartas.reinas).slice(0, 5);
    deck.gatadas = mezclarArray(catalogoCartas.gatadas).slice(0, 3);
    deck.escenas = mezclarArray(catalogoCartas.escenas).slice(0, 2);
    
    renderDeck();
}


function mostrarCaptura() {
    const totalCartas = deck.reinas.length + deck.gatadas.length + deck.escenas.length;
    if (totalCartas === 0) {
        alert("Tu mazo está vacío.");
        return;
    }

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.92); 
        z-index: 9999; overflow-y: auto; padding: 20px 12px; box-sizing: border-box;
    `;

    function renderGrupoCaptura(cartas) {
        if (cartas.length === 0) return '';
        return `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 18px;">
                ${cartas.map(c => `
                    <div style="display: flex; flex-direction: column;">
                        <!-- EL FIX ESTÁ AQUÍ: crossorigin="anonymous" -->
                        <img crossorigin="anonymous" src="${c.imagenes[0]}" style="width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 10px; display: block;">
                        <div style="color: white; font-size: 10px; line-height: 1.15; text-align: center; font-family: Arial, sans-serif; margin-top: 4px; padding: 0 2px; word-break: break-word;">
                            ${c.nombre}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    modal.innerHTML = `
    <div id="deckCaptura" style="max-width: 520px; margin: auto; background-color: #0f0f0f; padding: 16px; border-radius: 12px; border: 1px solid #333;">
        <h3 class="text-center fw-bold mb-3" style="color: #ff7be5;">Mi Deck</h3>
        ${renderGrupoCaptura(deck.reinas)}
        ${renderGrupoCaptura(deck.gatadas)}
        ${renderGrupoCaptura(deck.escenas)}
        <div id="controlesCaptura" class="d-flex gap-2 justify-content-center mt-4 pt-3 border-top border-secondary">
            <button id="descargarCaptura" class="btn fw-bold" style="background: #ff7be5; color: black;">⬇ Descargar Imagen</button>
            <button id="cerrarDeckPreview" class="btn btn-secondary fw-bold">Cerrar</button>
        </div>
    </div>`;

    document.body.appendChild(modal);

    document.getElementById('cerrarDeckPreview').onclick = () => {
        modal.remove();
    };

    document.getElementById('descargarCaptura').onclick = async () => {
        if (typeof html2canvas === "undefined") {
            alert("No se encontró la librería html2canvas.");
            return;
        }

        const captura = document.getElementById('deckCaptura');
        const controles = document.getElementById('controlesCaptura');
        
        controles.style.display = 'none';

        try {
            const canvas = await html2canvas(captura, {
                backgroundColor: "#0f0f0f",
                useCORS: true,        // Fundamental para imágenes externas
                allowTaint: false,    // Evita que el canvas se corrompa
                scale: 2              // Mejora la calidad de la imagen final
            });

            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = 'mi-deck-dragtcg.png';
            a.click();
        } catch (error) {
            console.error("Error al generar captura:", error);
            alert("Hubo un problema al generar la imagen.");
        }

        controles.style.display = 'flex';
    };
}

// Inicializar lista visual de decks
window.addEventListener('DOMContentLoaded', actualizarListaDecks);