'use strict'

var Encuesta = require('../modelos/encuesta.model');

function agregarEncuesta(req, res) {
    var params = req.body;
    var encuestaModel = new Encuesta();
    if (params.titulo && params.descripcion) {
        encuestaModel.titulo = params.titulo;
        encuestaModel.descripcion = params.descripcion;
        encuestaModel.opinions = {
            si: 0,
            no: 0,
            ninguna: 0,
            usuariosEncuestados: []
        };
        encuestaModel.creadorEncuesta = req.user.sub;

        encuestaModel.save((err, encuestaGuardada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de la Encuesta' })
            if (!encuestaGuardada) return res.status(500).send({ mensaje: 'Error al agregar la encuesta' })

            return res.status(200).send({ encuestaGuardada })
        })
    } else {
        res.status(500).send({ mensaje: 'Rellene los datos necesarios para crear la encuesta' })
    }
}

function obtenerEncuestas(req, res) {
    Encuesta.find().populate('creadorEncuesta', 'nombre email').exec((err, encuestasEncontradas) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de encuestas' });
        if (!encuestasEncontradas) return res.status(500).send({ Mensaje: 'Error al obtener las encuestas' })
        return res.status(200).send({ encuestasEncontradas })
    })
}

function agregarComentarioEncuesta(req, res) {
    var encuestaID = req.params.idEncuesta;
    var params = req.body;
    //Busca por id la encuesta a editar    //a;adimos array tipo dato objeto, dentro del objeto 
    Encuesta.findByIdAndUpdate(encuestaID, { $push: { listaComentarios: { textoComentario: params.textoComentario, idUsuarioComentario: req.user.sub } } }, { new: true }, (err, comentarioAgregado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion del comentario' })
        if (!comentarioAgregado) return res.status(500).send({ mensaje: 'Error al agregar comentario' })

        return res.status(200).send({ comentarioAgregado });
    })
}

function editarComentarioEncuesta(req, res) {
    var encuestaId = req.params.idEncuesta;
    var idComentario = req.params.idComentario;
    var params = req.body;
    //variable encuesta para ver cual                               `                                                      , loQueVoyABuscaryActualizar $estaDiciendoQueSoloEseEditara
    Encuesta.findOneAndUpdate({ _id: encuestaId, "listaComentarios._id": idComentario, 'listaComentarios.idUsuarioComentario': req.user.sub }, { "listaComentarios.$.textoComentario": params.comentario }, { new: true, useFindAndModify: false }, (err, comentarioEditado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de comentario' });
        if (!comentarioEditado) return res.status(500).send({ mensaje: 'Error al editar el comentario de la encuesta' });

        return res.status(200).send({ comentarioEditado })
    })
}

function obtenerComentario(req, res) {
    var encuestaId = req.params.idEncuesta;
    var comentarioId = req.params.idComentario;
    //Filtro                                    ,Proyeccion :
    Encuesta.findOne({ _id: encuestaId, "listaComentarios._id": comentarioId }, { "listaComentarios.$": 1 }, (err, comentarioEncontrado) => {
        if (err) return res.status(500)({ mensaje: 'Error en la peticion de encuesta' });
        if (!comentarioEncontrado) return res.status(500).send({ mensaje: 'Error al obtener el comentario' });

        return res.status(200).send({ comentarioEncontrado })
    })
}

function eliminarComentario(req, res) {
    var idComentario = req.params.idComentario;

    Encuesta.findOneAndUpdate({ "listaComentarios._id": idComentario }, { $pull: { listaComentarios: { _id: idComentario } } }, { new: true, useFindAndModify: false }, (err, comentarioEliminado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de comentario' })
        if (!comentarioEliminado) return res.status(500).send({ mensaje: 'Error al elimiar el comentario' })

        return res.status(200).send({ comentarioEliminado })
    })
}

function obtenerComentarioPorTexto(req, res) {
    var bodyTextoComentario = req.body.textoComentario;
    Encuesta.aggregate([{
            //LISTACOMENTARIOS SE VUELVE INDEPENDIENTE
            $unwind: "$listaComentarios" //VA A BUSCAR EN EL MODELO Y CREA UN MODELO TEMPORAL SOLO CON EL PARAMETRO QUE NECESITEMOS
        },
        {
            //HACE QUE COINCIDA COMO EL FILTRO
            $match: { "listaComentarios.textoComentario": { $regex: bodyTextoComentario, $options: 'i' } }
        },
        {
            //CREA UN GRUPO DE MODELO TEMPORAL, QUE QUEREMOS QUE AGREGUE
            $group: {
                "_id": "$_id",
                "listaComentarios": { $push: "$listaComentarios" }
            }
        }
    ], (err, ok) => {
        console.log(err);
        return res.status(200).send({ ok })
    })
}

function obtenerEncuestaId(req, res) {
    var idEncuesta = req.params.idEncuesta;

    Encuesta.findById(idEncuesta).populate('creadorEncuesta listaComentarios.idUsuarioComentario', 'usuario email imagen').exec((err, encuestaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!encuestaEncontrada) return res.status(500).send({ mensaje: 'Error al obtener encuesta' })

        return res.status(200).send({ encuestaEncontrada })
    })
}
module.exports = {
    agregarEncuesta,
    obtenerEncuestas,
    agregarComentarioEncuesta,
    editarComentarioEncuesta,
    obtenerComentario,
    eliminarComentario,
    obtenerComentarioPorTexto,
    obtenerEncuestaId
}