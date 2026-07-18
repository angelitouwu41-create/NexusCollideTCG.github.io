// Algoritmo matemático para contar errores de dedo (Typos)
function levenshtein(a, b) {
    if (a.length === 0) return b.length; 
    if (b.length === 0) return a.length; 
    const matrix = [];
    for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, 
                    matrix[i][j - 1] + 1, 
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

// Función principal de validación (Fuzzyness y Acentos)
function coincideFuzzy(query, texto) {
    // Quita acentos y pasa a minúsculas
    const normalizar = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const q = normalizar(query);
    const t = normalizar(texto);

    if (q === "") return true; // Si el buscador está vacío, pasa la prueba
    if (t.includes(q)) return true; // Coincidencia exacta o parcial perfecta (ej: "van" encuentra "Vanth")

    if (q.length < 3) return false; // Si es muy cortita, no perdonamos typos para no arrojar basura

    // Separar por palabras para perdonar typos individuales (ej: "cavrita vant")
    const palabrasTexto = t.split(" ");
    const palabrasQuery = q.split(" ");

    // Validar que cada palabra escrita coincida (con max 2 errores) con alguna palabra de la carta
    return palabrasQuery.every(pq => {
        return palabrasTexto.some(pt => levenshtein(pq, pt) <= 1);
    });
}
// Asegúrate de atrapar también el nuevo Select al inicio
const inputBuscador = document.getElementById('buscadorNombre');
const selectFiltro = document.getElementById('filtro');
const selectOrigen = document.getElementById('filtroOrigen'); // <-- NUEVO

function aplicarFiltrosUnificados() {
    // Si alguno de los inputs no existe (por si te falta en el HTML), prevenimos errores
    const query = inputBuscador ? inputBuscador.value : '';
    const categoria = selectFiltro ? selectFiltro.value : 'todos';
    const origenFiltro = selectOrigen ? selectOrigen.value : 'todos'; // <-- NUEVO
    
    const items = document.querySelectorAll('.filtrable');

    items.forEach(item => {
        const nombreCarta = item.querySelector('div').textContent;
        
        // 1. ¿Pasa la prueba del Select de Categoría?
        let pasaSelect = false;
        if (categoria === 'todos' || item.classList.contains(categoria)) {
            pasaSelect = true;
        }

        // 2. ¿Pasa la prueba del Buscador de texto (fuzzy)?
        let pasaBuscador = coincideFuzzy(query, nombreCarta);

        // 3. ¿Pasa la prueba del Select de Origen? <-- NUEVO
        let pasaOrigen = true;
        if (origenFiltro !== 'todos') {
            const origenCarta = item.dataset.origen || "desconocido";
            if (origenCarta !== origenFiltro) {
                pasaOrigen = false;
            }
        }

        // Evaluamos las tres condiciones. Si falla alguna, se oculta.
        if (pasaSelect && pasaBuscador && pasaOrigen) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Agregamos el "listener" para el nuevo Select de Origen
if (inputBuscador) inputBuscador.addEventListener('input', aplicarFiltrosUnificados);
if (selectFiltro) selectFiltro.addEventListener('change', aplicarFiltrosUnificados);
if (selectOrigen) selectOrigen.addEventListener('change', aplicarFiltrosUnificados); // <-- NUEVO