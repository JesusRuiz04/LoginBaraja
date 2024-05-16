const crypto = require('crypto');
const db = require('./db/database');

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.log('Por favor, proporciona un nombre de usuario y una contraseña');
  process.exit(1);
}

const hash = crypto.createHash('sha3-512').update(password).digest('hex');

db.run('INSERT INTO usuario (username, contraseña_haseada) VALUES (?, ?)', [username, hash], (err) => {
  if (err) {
    console.error('Error al crear el usuario:', err);
    process.exit(1);
  }
  console.log('Usuario creado exitosamente');
  process.exit(0);
});