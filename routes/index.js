<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const transporter = require('../helper/email');
const crypto = require('crypto');

let verificationTokens = {};

router.get('/', function(req, res) {
  res.render('registrar', { error: '' });
});

router.get('/login', function(req, res) {
  res.render('login', { error: '' });
});

router.post('/login', async function(req, res) {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.render('login', { error: 'Correo y contraseña son requeridos.' });
  }

  try {
    const existingUser = await User.findOne({ where: { id: correo } });
    if (existingUser) {
      if (verificationTokens[correo]) {
        return res.render('login', { error: 'Debe verificar su cuenta antes de iniciar sesión.' });
      }

      if (existingUser.bannedTime && new Date(existingUser.bannedTime) > new Date()) {
        const banTimeLeft = Math.round((new Date(existingUser.bannedTime) - new Date()) / 1000 / 60);
        return res.render('login', { error: `Su cuenta está bloqueada. Inténtelo de nuevo en ${banTimeLeft} minutos.` });
      }

      const passwordMatch = await bcrypt.compare(password, existingUser.password);
      if (passwordMatch) {
        req.session.userId = existingUser.id;
        await existingUser.update({ lastLogin: new Date(), nTries: 0 });
        res.redirect('/barajas');
      } else {
        let newTries = existingUser.nTries + 1;
        let bannedUntil = null;
        if (newTries >= 3) {
          bannedUntil = new Date(new Date().getTime() + 5 * 60 * 1000);
          newTries = 0;

          let mailOptions = {
            from: process.env.EMAIL_USER,
            to: existingUser.id,
            subject: 'Notificación de Cuenta Bloqueada',
            text: 'Su cuenta ha sido bloqueada temporalmente debido a múltiples intentos fallidos de inicio de sesión.',
            html: '<b>Su cuenta ha sido bloqueada temporalmente debido a múltiples intentos fallidos de inicio de sesión.</b>'
          };

          transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
              console.log('Error sending email:', error);
            } else {
              console.log('Email sent:', info.response);
            }
          });
        }

        await existingUser.update({ nTries: newTries, bannedTime: bannedUntil });
        res.render('login', { error: 'Contraseña incorrecta. Inténtelo de nuevo.' });
      }
    } else {
      res.render('login', { error: 'No existe una cuenta con este correo electrónico.' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Error processing request: ' + error.message);
  }
});

router.post('/', async function(req, res) {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.render('registrar', { error: 'Correo y contraseña son requeridos.' });
  }

  try {
    const existingUser = await User.findOne({ where: { id: correo } });
    if (existingUser) {
      return res.render('registrar', { error: 'El usuario ya está registrado. Por favor, inicie sesión.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      id: correo,
      password: hashedPassword
    });

    const token = crypto.randomBytes(32).toString('hex');
    const verificationLink = `${req.protocol}://${req.get('host')}/verify?token=${token}&email=${correo}`;

    verificationTokens[correo] = token;

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: correo,
      subject: 'Verificación de Cuenta',
      text: `Estimado/a usuario/a,Por favor, tome un momento para verificar su cuenta haciendo clic en el siguiente enlace:${verificationLink}`,
      html: `<p>Estimado/a usuario/a,</p><p>Por favor, tome un momento para verificar su cuenta haciendo clic en el siguiente enlace:</p> <a href="${verificationLink}">${verificationLink}</a>`
  };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.render('login', { error: 'Cuenta creada. Verifique su correo electrónico.' });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Error processing request: ' + error.message);
  }
});

router.get('/verify', async function(req, res) {
  const { token, email } = req.query;

  try {
    const user = await User.findOne({ where: { id: email } });
    if (user) {
      if (verificationTokens[email] === token) {
        delete verificationTokens[email];
        await user.update({ isVerified: true });
        res.render('login', { error: 'Cuenta verificada. Por favor, inicie sesión.' });
      } else {
        res.status(400).send('Token de verificación inválido o expirado.');
      }
    } else {
      res.status(400).send('Token de verificación inválido o expirado.');
    }
  } catch (error) {
    console.error('Error al verificar la cuenta:', error);
    res.status(500).send('Error al verificar la cuenta: ' + error.message);
  }
});

module.exports = router;
=======
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
>>>>>>> 0f7cc39ab820c8b06db921cf65879e2480cf5974
