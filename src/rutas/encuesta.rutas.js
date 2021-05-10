'use strict'

const express = require('express')
const encuestaControlador = require("../controladores/encuesta.controlador");
const md_autentication = require("../middlewares/authenticated");


const api = express.Router();
api.post('/agregarEncuesta', md_autentication.ensureAuth, encuestaControlador.agregarEncuesta);
api.get('/obtenerEncuestas', md_autentication.ensureAuth, encuestaControlador.obtenerEncuestas);
api.put('/agregarComentario/:idEncuesta', md_autentication.ensureAuth, encuestaControlador.agregarComentarioEncuesta)
api.put('/editarComentario/:idEncuesta/:idComentario', md_autentication.ensureAuth, encuestaControlador.editarComentarioEncuesta);
api.get('/obtenerComentario/:idEncuesta/:idComentario', md_autentication.ensureAuth, encuestaControlador.obtenerComentario);
api.delete('/eliminarComentario/:idComentario', md_autentication.ensureAuth, encuestaControlador.eliminarComentario)
api.post('/obtenerComentarioPorTexto', md_autentication.ensureAuth, encuestaControlador.obtenerComentarioPorTexto)
api.get('/obtenerEncuestaId/:idEncuesta', md_autentication.ensureAuth, encuestaControlador.obtenerEncuestaId)

module.exports = api;