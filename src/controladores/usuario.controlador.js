'use strict'

//IMPORTACIONES 
const Usuario = require('../modelos/usuario.model');
const bcrypt = require("bcrypt-nodejs");
const jwt = require('../servicios/jwt'); //archivo para crear token

//FUNCION EJEMPLO
// app.get('ruta', function(req,res){})
function ejemplo(req, res) {
    res.status(200).send({ mensaje: `Hola, mi nombre es ${req.user.nombre}` })

}

function registrar(req, res) {
    var usuarioModel = new Usuario();
    var params = req.body;

    if (params.usuario && params.email && params.password) {
        usuarioModel.nombre = params.nombre;
        usuarioModel.usuario = params.usuario;
        usuarioModel.email = params.email;
        usuarioModel.rol = 'ROL_USUARIO';
        usuarioModel.imagen = null;

        Usuario.find({
            $or: [
                { usuario: usuarioModel.usuario },
                { email: usuarioModel.email }
            ]
        }).exec((err, usuariosEncontrados) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion del usuario' })

            if (usuariosEncontrados && usuariosEncontrados.length >= 1) {
                return res.status(500).send({ mensaje: 'El usuario ya existe' })
            } else {
                bcrypt.hash(params.password, null, null, (err, passwordEncriptada) => {
                    usuarioModel.password = passwordEncriptada;

                    usuarioModel.save((err, usuarioGuardado) => {
                        if (err) return res.status(500).send({ mensaje: 'Error al guardar el usuario' })

                        if (usuarioGuardado) {
                            res.status(200).send(usuarioGuardado)
                        } else {
                            res.status(404).send({ mensaje: 'No se ha podido registrar el Usuario' })
                        }
                    })
                })
            }
        })
    }
}

function obtenerUsuarios(req, res) {
    Usuario.find((err, usuariosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener Usuarios' })
        if (!usuariosEncontrados) return res.status(500).send({ mensaje: 'Error en la consulta de Usuarios' })
        return res.status(200).send({ usuariosEncontrados })
    })
}

function obtenerUsuarioId(req, res) {
    var idUsuario = req.params.idUsuario

    //var columna = req.params.columna...
    //var dato = req.params.dato..
    //User.find({ columna: dato },(err,usuarioEncontrado)=>{}) <- me retorna un array = [] usuarioEncontrado[0].nombre

    //User.findOne({ columna: dato },(err,usuarioEncontrado)=>{}) <- me retorna un objeto = {} usuarioEncontrado.nombre
    Usuario.findById(idUsuario, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion del usuario' })
        if (!usuarioEncontrado) return res.status(500).send({ mensaje: 'Error en obtener los datos' })
        console.log(usuarioEncontrado.email) //como es objeto por medio del . entro a sus propiedades
        return res.status(200).send({ usuarioEncontrado })
    })
}

function login(req, res) {
    var params = req.body; //traemos datos del cuerpo de datos

    Usuario.findOne({ email: params.email }, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

        if (usuarioEncontrado) { //TRUE OR FALSE
            bcrypt.compare(params.password, usuarioEncontrado.password, (err, passCorrecta) => {
                if (passCorrecta) {
                    if (params.obtenerToken === 'true') {
                        return res.status(200).send({
                            token: jwt.createToken(usuarioEncontrado)
                        });
                    } else {
                        usuarioEncontrado.password = undefined;
                        return res.status(200).send({ usuarioEncontrado })
                    }
                } else {
                    return res.status(404).send({ mensaje: 'El usuario no se ha podido identificar' })
                }
            })
        } else {
            return res.status(404).send({ mensaje: 'El usuario no ha podido ingresar' })
        }
    })
}

function editarUsuario(req, res) {
    var idUsuario = req.params.idUsuario;
    var params = req.body

    //BORRAR LA PROPIEDAD DE PASSWORD PARA QUE NO SE PUEDA EDITAR
    delete params.password;

    //req.user.sub <--- id Usuario logeado
    if (idUsuario != req.user.sub) {
        return res.status(500).send({ mensaje: 'No posee los permisos necesarios para actualizar este usuario.' })
    }
    //Modelo.find
    Usuario.findByIdAndUpdate(idUsuario, params, { new: true }, (err, usuarioActualizado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!usuarioActualizado) return res.status(500).send({ mensaje: 'No se ha podido actualizar Usuario' });
        //usuarioActualizado.password = undefined;
        return res.status(200).send({ usuarioActualizado })
    })
}

function editarUsuarioADMIN(req, res) {
    var idUsuario = req.params.idUsuario;
    var params = req.body

    //BORRAR LA PROPIEDAD DE PASSWORD PARA QUE NO SE PUEDA EDITAR
    delete params.password;

    //req.user.sub <--- id Usuario logeado
    if (req.user.rol != 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'Solo el administrador puede editar.' })
    }
    //Modelo.find
    Usuario.findByIdAndUpdate(idUsuario, params, { new: true }, (err, usuarioActualizado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!usuarioActualizado) return res.status(500).send({ mensaje: 'No se ha podido actualizar Usuario' });
        //usuarioActualizado.password = undefined;
        return res.status(200).send({ usuarioActualizado })
    })
}

function eliminarUsuario(req, res) {
    const idUsuario = req.params.idUsuario;

    if (idUsuario != req.user.sub) {
        return res.status(500).send({ mensaje: 'No posee los permisos para eliminar a este Usuario' })
    }

    Usuario.findByIdAndDelete(idUsuario, (err, usuarioEliminado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de eliminar' })
        if (!usuarioEliminado) return res.status(500).send({ mensaje: 'Error al eliminar el usuario' })

        return res.status(200).send({ usuarioEliminado });
    })
}

function eliminarUsuarioAdmin(req, res) {
    const idUsuario = req.params.idUsuario;

    if (req.user.rol != 'ROL_ADMIN') return res.status(500).send({ mensaje: 'Solo puede eliminar el Administrador' })
    Usuario.findByIdAndDelete(idUsuario, (err, usuarioEliminado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de eliminar' })
        if (!usuarioEliminado) return res.status(500).send({ mensaje: 'Error al eliminar el usuario' })

        return res.status(200).send({ usuarioEliminado });
    })
}

module.exports = {
    ejemplo,
    registrar,
    obtenerUsuarios,
    obtenerUsuarioId,
    login,
    editarUsuario,
    eliminarUsuario,
    editarUsuarioADMIN,
    eliminarUsuarioAdmin
}