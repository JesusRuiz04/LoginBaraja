var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const db = require('../db/database');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Login' });
});

router.get('/baraja', function(req, res, next) {
  res.render('baraja');
});

router.post('/login', function(req, res, next) {
  const { username, password } = req.body;

  db.get('SELECT * FROM usuario WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).send('Error al acceder a la base de datos');
    }
    if (!user) {
      return res.status(400).send('Contraseña o usuario incorrecta');
    }

    const hash = crypto.createHash('sha3-512').update(password).digest('hex');
    if (hash !== user.contraseña_haseada) {
      return res.status(400).send('Contraseña o usuario incorrecta');
    }

    const now = new Date().toISOString();
    db.run('UPDATE usuario SET ultimo_login = ? WHERE id = ?', [now, user.id], (err) => {
      if (err) {
        return res.status(500).send('Error al actualizar el último login');
      }
      
      res.render('baraja');
    });
  });
});

router.get('/random-card', function(req, res, next) {
  const palos = ['oros', 'copas', 'espadas', 'bastos'];
  const numeros = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  
  const randomPalo = palos[Math.floor(Math.random() * palos.length)];
  const randomNumero = numeros[Math.floor(Math.random() * numeros.length)];
  const randomCarta = `${randomNumero}${randomPalo.charAt(0).toUpperCase()}`;

  res.render('random-card', { carta: randomCarta, palo: randomPalo, numero: randomNumero });
});


module.exports = router;
