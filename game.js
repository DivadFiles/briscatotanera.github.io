// ========= CONFIGURACIÓN BÁSICA =========

// Palos (puedes renombrar a tus palos personalizados)
const PALOS = ["jamones", "pencas", "pechos", "bellotas"];

// Valores de la baraja española sin 8 ni 9
const VALORES = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

// Puntuación de brisca
const PUNTOS = {
  1: 11,  // As
  3: 10,  // Tres
  12: 4,  // Rey
  11: 3,  // Caballo
  10: 2   // Sota
};

let mazo = [];
let triunfo = null;
let cartaTriunfo = null;
let manoJugador = [];
let manoIA = [];
let puntosJugador = 0;
let puntosIA = 0;
let cartaMesaJugador = null;
let cartaMesaIA = null;
let turnoJugadorEmpieza = true; // alterna quién empieza la baza

// ========= UTILIDADES =========

function crearBaraja() {
  const baraja = [];
  for (const palo of PALOS) {
    for (const valor of VALORES) {
      baraja.push({
        palo,
        valor,
        id: `${valor}-${palo}`
      });
    }
  }
  return baraja;
}

function barajar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function puntosCarta(carta) {
  return PUNTOS[carta.valor] || 0;
}

function nombreCarta(c) {
  const nombres = {
    1: "As",
    2: "Dos",
    3: "Tres",
    4: "Cuatro",
    5: "Cinco",
    6: "Seis",
    7: "Siete",
    10: "Sota",
    11: "Caballo",
    12: "Rey"
  };
  return `${nombres[c.valor]} de ${c.palo}`;
}

// Aquí es donde ENLAZAS tus imágenes personalizadas.
// Cambia esta función para que devuelva la ruta de tu imagen para cada carta.
function rutaImagenCarta(carta) {
  // Ejemplo: img/1-oros.png, img/3-bastos.png, etc.
  // Cambia la ruta y nombres según tus archivos.
 const nombreArchivo = `${carta.valor} de ${carta.palo}.png`;
  return `img/${nombreArchivo}`;
}

// Ruta del DORSO de cualquier carta
function rutaImagenDorso() {
    //Ejemplo: "img/dorso brisca totanera.png"
    return "img/dorso brisca totanera.png"
}

// ========= INICIO / REINICIO =========

function nuevaPartida() {
  mazo = crearBaraja();
  barajar(mazo);

  manoJugador = [];
  manoIA = [];
  puntosJugador = 0;
  puntosIA = 0;
  cartaMesaJugador = null;
  cartaMesaIA = null;

  // Repartir 3 cartas a cada uno
  for (let i = 0; i < 3; i++) {
    manoJugador.push(mazo.pop());
    manoIA.push(mazo.pop());
  }

  // Carta de triunfo (la siguiente del mazo) se deja boca arriba
  cartaTriunfo = mazo.pop();
  triunfo = cartaTriunfo.palo;

  actualizarUIInicio();
}

function actualizarUIInicio() {
  document.getElementById("puntos-jugador").textContent = puntosJugador;
  document.getElementById("puntos-ia").textContent = puntosIA;
  document.getElementById("mensaje").textContent = "Tu turno. Elige una carta.";
  document.getElementById("triunfo-text").textContent = triunfo;
  renderCartaTriunfo();
  renderMazo();
  renderManoJugador();
  limpiarMesa();
}

// ========= RENDER CARTAS =========

function renderCartaTriunfo() {
  const cont = document.getElementById("carta-triunfo");
  if (!cartaTriunfo) {
    cont.style.backgroundImage = "";
    cont.textContent = "";
    return;
  }
  cont.style.backgroundImage = `url('${rutaImagenCarta(cartaTriunfo)}')`;
  cont.title = nombreCarta(cartaTriunfo);
}

function renderMazo() {
  const mazoDiv = document.getElementById("mazo");
  if (mazo.length === 0) {
    mazoDiv.style.visibility = "hidden";
  } else {
    mazoDiv.style.visibility = "visible";
    mazoDiv.style.backgroundImage = `url('${rutaImagenDorso()}')`;
  }
}

function renderManoJugador() {
  const manoDiv = document.getElementById("mano-jugador");
  manoDiv.innerHTML = "";
  manoJugador.forEach((carta, index) => {
    const div = document.createElement("div");
    div.classList.add("carta");
    div.style.backgroundImage = `url('${rutaImagenCarta(carta)}')`;
    div.title = nombreCarta(carta);
    div.addEventListener("click", () => jugarCartaJugador(index));
    manoDiv.appendChild(div);
  });
}

function limpiarMesa() {
  const cj = document.getElementById("carta-jugador");
  const ci = document.getElementById("carta-ia");
  cj.style.backgroundImage = "";
  cj.textContent = "";
  ci.style.backgroundImage = "";
  ci.textContent = "";
}

// ========= LÓGICA DE TURNO =========

function jugarCartaJugador(indice) {
  if (cartaMesaJugador !== null) return; // ya ha jugado
  const carta = manoJugador[indice];
  cartaMesaJugador = carta;
  manoJugador.splice(indice, 1);

  const cj = document.getElementById("carta-jugador");
  cj.style.backgroundImage = `url('${rutaImagenCarta(carta)}')`;
  cj.title = nombreCarta(carta);

  document.getElementById("mensaje").textContent = "Juega la IA...";
  setTimeout(() => turnoIA(), 600);
}

function turnoIA() {
  // IA muy sencilla: juega la primera carta (mejorar si quieres)
  const carta = manoIA[0];
  cartaMesaIA = carta;
  manoIA.splice(0, 1);

  const ci = document.getElementById("carta-ia");
  ci.style.backgroundImage = `url('${rutaImagenCarta(carta)}')`;
  ci.title = nombreCarta(carta);

  setTimeout(() => resolverBaza(), 800);
}

function resolverBaza() {
  if (!cartaMesaJugador || !cartaMesaIA) return;

  const ganador = quienGanaBaza(cartaMesaJugador, cartaMesaIA, cartaMesaJugador); // primera carta indica palo de salida
  const puntosBaza = puntosCarta(cartaMesaJugador) + puntosCarta(cartaMesaIA);

  let mensaje = "";

  if (ganador === "jugador") {
    puntosJugador += puntosBaza;
    mensaje = `Ganas la baza (+${puntosBaza} puntos).`;
    turnoJugadorEmpieza = true;
  } else {
    puntosIA += puntosBaza;
    mensaje = `La IA gana la baza (+${puntosBaza} puntos).`;
    turnoJugadorEmpieza = false;
  }

  document.getElementById("puntos-jugador").textContent = puntosJugador;
  document.getElementById("puntos-ia").textContent = puntosIA;
  document.getElementById("mensaje").textContent = mensaje;

  // Robar nuevas cartas si quedan
  robarTrasBaza(ganador);

  cartaMesaJugador = null;
  cartaMesaIA = null;

  // Fin de partida
  if (mazo.length === 0 && manoJugador.length === 0 && manoIA.length === 0) {
    setTimeout(finDePartida, 1000);
  } else {
    setTimeout(() => {
      limpiarMesa();
      if (turnoJugadorEmpieza) {
        document.getElementById("mensaje").textContent = "Tu turno. Elige una carta.";
      } else {
        document.getElementById("mensaje").textContent = "Empieza la IA.";
        // IA empieza: juega primero
        setTimeout(() => {
          // IA juega
          const carta = manoIA[0];
          cartaMesaIA = carta;
          manoIA.splice(0, 1);
          const ci = document.getElementById("carta-ia");
          ci.style.backgroundImage = `url('${rutaImagenCarta(carta)}')`;
          ci.title = nombreCarta(carta);
          // luego jugador
          document.getElementById("mensaje").textContent = "Tu turno. Elige una carta.";
        }, 700);
      }
      renderManoJugador();
    }, 800);
  }
}

// ganador: "jugador" o "ia"
function robarTrasBaza(ganador) {
  // En brisca, roba primero quien gana la baza, luego el otro, hasta que se acabe el mazo.
  if (mazo.length === 0) return;

  if (ganador === "jugador") {
    if (mazo.length > 0) manoJugador.push(mazo.pop());
    if (mazo.length > 0) manoIA.push(mazo.pop());
  } else {
    if (mazo.length > 0) manoIA.push(mazo.pop());
    if (mazo.length > 0) manoJugador.push(mazo.pop());
  }

  // Cuando quede una carta en el mazo, se da al que robaba primero y la carta de triunfo pasa a la mano del otro según reglas clásicas,
  // pero para simplificar: dejamos la carta de triunfo donde está hasta que el mazo se acabe.
  renderMazo();
}

// ========= QUIÉN GANA LA BAZA =========
// c1 y c2 son las cartas jugadas; primera indica palo de salida.
// Reglas clásicas: gana la carta de triunfo más alta; si no hay triunfo,
// gana la carta más alta del palo de salida. [web:3][web:9][web:10]

function quienGanaBaza(cartaJ, cartaI, cartaPrimera) {
  const paloSalida = cartaPrimera.palo;

  const jEsTriunfo = cartaJ.palo === triunfo;
  const iEsTriunfo = cartaI.palo === triunfo;

  if (jEsTriunfo && !iEsTriunfo) return "jugador";
  if (iEsTriunfo && !jEsTriunfo) return "ia";
  if (jEsTriunfo && iEsTriunfo) {
    return cartaJ.valor > cartaI.valor ? "jugador" : "ia";
  }

  const jSiguePalo = cartaJ.palo === paloSalida;
  const iSiguePalo = cartaI.palo === paloSalida;

  if (jSiguePalo && !iSiguePalo) return "jugador";
  if (iSiguePalo && !jSiguePalo) return "ia";
  if (jSiguePalo && iSiguePalo) {
    return cartaJ.valor > cartaI.valor ? "jugador" : "ia";
  }

  // Ninguno triunfo ni palo de salida: gana quien salió primero
  return cartaPrimera === cartaJ ? "jugador" : "ia";
}

// ========= FIN DE PARTIDA =========

function finDePartida() {
  let mensajeFinal = "";
  if (puntosJugador > puntosIA) {
    mensajeFinal = `Fin de la partida. ¡Has ganado! (${puntosJugador} - ${puntosIA})`;
  } else if (puntosIA > puntosJugador) {
    mensajeFinal = `Fin de la partida. La IA gana. (${puntosIA} - ${puntosJugador})`;
  } else {
    mensajeFinal = `Fin de la partida. Empate a ${puntosJugador} puntos.`;
  }
  document.getElementById("mensaje").textContent = mensajeFinal;
}

// ========= EVENTOS =========

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-nueva").addEventListener("click", nuevaPartida);
  nuevaPartida();
});