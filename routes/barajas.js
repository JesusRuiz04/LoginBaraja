const express = require('express');
const router = express.Router();
const Baraja = require('../models/baraja');

const baraja = new Baraja();
let cartasExtraidas = [];
let carta = null;

function ensureAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  } else {
    res.redirect('/login');
  }
}

router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    if (!baraja.cartas || baraja.cartas.length === 0) {
      await baraja.cargarCartas();
      baraja.ordenarCartas();
    }
    res.render('barajas', {
      title: 'Baraja de Naipes Españoles',
      cartas: baraja.cartas,
      ordenarpor: "palo-valor",
      extraida: carta,
      cartasExtraidas: cartasExtraidas,
      totalCartas: baraja.cartas.length,
    });
  } catch (error) {
    console.error('Error al cargar las cartas:', error);
    res.status(500).send('Error al mostrar las cartas.');
  }
});

router.post('/barajar', ensureAuthenticated, async (req, res) => {
  try {
    baraja.barajar();
    carta = null;
    cartasExtraidas = [];
    res.redirect('/barajas');
  } catch (error) {
    console.error('Error al barajar las cartas:', error);
    res.status(500).send('Error al barajar las cartas.');
  }
});

router.post('/ordenar', ensureAuthenticated, async (req, res) => {
  const ordenarpor = req.body.ordenarpor || 'palo-valor';
  try {
    if (ordenarpor === 'valor') {
      baraja.ordenarPorValor();
    } else {
      baraja.ordenarCartas();
    }
    res.redirect('/barajas');
  } catch (error) {
    console.error('Error al ordenar las cartas:', error);
    res.status(500).send('Error al ordenar las cartas.');
  }
});

router.post('/extraer', ensureAuthenticated, async (req, res) => {
  try {
    const tipoExtraccion = req.body.tipoExtraccion; 
    let carta = null;
    if (tipoExtraccion === 'primera') {
      carta = baraja.extraerPrimeraCarta(); 
    } else {
      carta = baraja.extraer(); 
    }
    if (carta) {
      cartasExtraidas.push({ carta, visible: true });
      if (baraja.cartas.length === 0) {
        baraja.reset();
      }
      res.redirect('/barajas');
    } else {
      res.status(404).send('No hay más cartas para extraer.');
    }
  } catch (error) {
    console.error('Error al extraer la carta:', error);
    res.status(500).send('Error al extraer la carta.');
  }
});



router.post('/extraer-cabeza', ensureAuthenticated, async (req, res) => {
  try {
    const carta = baraja.extraerDeLaCabeza();
    if (carta) {
      cartasExtraidas.push({ carta, visible: true });
      if (baraja.cartas.length === 0) {
        baraja.reset();
      }
      res.redirect('/barajas');
    } else {
      res.status(404).send('No hay más cartas para extraer de la cabeza.');
    }
  } catch (error) {
    console.error('Error al extraer la carta de la cabeza:', error);
    res.status(500).send('Error al extraer la carta de la cabeza.');
  }
});


router.post('/devolver', ensureAuthenticated, async (req, res) => {
  try {
    if (cartasExtraidas.length > 0) {
      const cartaDevuelta = cartasExtraidas.pop().carta;
      baraja.devolverCarta(cartaDevuelta);
      carta = cartasExtraidas[cartasExtraidas.length - 1]?.carta || null;

      if (cartasExtraidas.length >= 2) {
        cartasExtraidas[cartasExtraidas.length - 2].visible = true;
      }

      if (cartasExtraidas.length === 0) {
        baraja.cargarCartas();
      }
      res.redirect('/barajas');
    } else {
      baraja.reset();
      res.redirect('/barajas');
    }
  } catch (error) {
    console.error('Error al devolver la carta:', error);
    res.status(500).send('Error al devolver la carta.');
  }
});

router.post('/reset', ensureAuthenticated, async (req, res) => {
  try {
    baraja.reset();
    carta = null;
    cartasExtraidas = []
    res.redirect('/barajas');
  } catch (error) {
    console.error('Error al reiniciar la baraja:', error);
    res.status(500).send('Error al reiniciar la baraja.');
  }
});

router.post('/salir', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error al cerrar sesión.');
    }
    res.redirect('/login');
  });
});


module.exports = router;