'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta_IN6BM';

exports.createToken = function(usuario){
    var payload = {
        sub: usuario._id,
        nombre: usuario.nombre,
        usuario: usuario.usuario,   
        email: usuario.email,
        rol: usuario.rol,
        image: usuario.imagen,
        iat: moment.unix(),
        exp: moment().day(30, 'days').unix()
    }

    return jwt.encode(payload, secret);
}