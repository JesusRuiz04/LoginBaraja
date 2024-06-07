const { User } = require('./models'); 

async function borrarUsuario() {
  try {
    const usuario = await User.findOne({ where: { id: 'correodifusionjesusruiz@gmail.com' } });

    if (!usuario) {
      console.log('El usuario no fue encontrado');
      return;
    }

    await usuario.destroy();

    console.log('Usuario eliminado correctamente');
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
  }
}

borrarUsuario();
