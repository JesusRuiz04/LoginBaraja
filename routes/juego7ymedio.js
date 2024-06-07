const express = require('express');
const router = express.Router();
const Juego7yMedio = require('../models/Juego7yMedio');

const juego = new Juego7yMedio();

router.get('/', async (req, res) => {
    try {
        if (!juego.iniciado) {
            await juego.iniciarJuego();
        }
        res.render('juego7yMedio', { title: 'Juego 7 y Medio', juego: juego });
    } catch (error) {
        console.error('Error al iniciar el juego:', error);
        res.status(500).send('Error al iniciar el juego');
    }
});

router.post('/pedir', (req, res) => {
    try {
        if (juego.obtenerTotalJugador() > 7.5) {
            throw new Error('Has perdido. Tu total es mayor que 7.5');
        }

        const carta = juego.extraerCarta();
        
        if (juego.obtenerTotalJugador() > 7.5) {
            const mensaje = 'Has perdido. Tu total es mayor que 7.5';
            res.render('juego7yMedio', { title: 'Juego 7 y Medio', juego, mensaje });
        } else {
            res.render('juego7yMedio', { title: 'Juego 7 y Medio', juego });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});


router.post('/reiniciar', (req, res) => {
    juego.reiniciarJuego();
    res.render('juego7yMedio', { title: 'Juego 7 y Medio', juego });
});

module.exports = router;
