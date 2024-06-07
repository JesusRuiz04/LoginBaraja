const Baraja = require('./Baraja'); 

class Juego7yMedio {
    constructor() {
        this.baraja = new Baraja();
        this.cartasJugador = [];
        this.totalJugador = 0;
    }

    iniciarJuego() {
        this.baraja.reset();
        this.cartasJugador = [];
        this.totalJugador = 0;
    }

    extraerCarta() {
        let carta;
        do {
            carta = this.baraja.extraer();
        } while (carta && (carta.valor === 8 || carta.valor === 9));
    
        if (carta) {
            this.cartasJugador.push(carta);
            this.totalJugador += this.calcularPuntaje(carta);
            return carta;
        } else {
            throw new Error('No hay más cartas adecuadas para extraer.');
        }
    }

    calcularPuntaje(carta) {
        return carta.valor >= 10 ? 0.5 : carta.valor;
    }

    reiniciarJuego() {
        this.baraja.reset();
        this.cartasJugador = [];
        this.totalJugador = 0;
    }

    obtenerTotalJugador() {
        return this.totalJugador;
    }

    obtenerCartasJugador() {
        return this.cartasJugador;
    }
}

module.exports = Juego7yMedio;
