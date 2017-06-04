/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const Usuario = require('../models/usuario'),
      Utilidad = require('../ayuda/')

function indexGet(req, res) {
    // verifica si existe un usuario logeado
    (req.session.user) ? res.redirect("/almacen") : res.redirect("/login")
}

function logout(req, res) {
    // cierra la sesion del usuario
    req.session = null
    // te redirecciona al inicio
    res.redirect("/login")
}

function loginGet(req, res) {
    // si no esta logeado entra al login
    (req.session.user) ? res.redirect("/almacen") : res.render('login')
}

function loginPost(req, res) {
    // declaro variables necesarias
    let username = req.body.username,
        password = req.body.password
    Usuario.findOne({username}).populate("sucursal").exec( (error, usuario) => {
        // declaro la promesa
        let promesa = Utilidad.returnPromise(!error, true, { msg: `Error con la base de datos : ${error}`, tipo: 0 })
        // ejecuto la promesa
        promesa
                .then(() => {
                    // comprueba si se pudo obtener el usuario
                    return Utilidad.returnPromise(usuario, true, { msg: 'Error username incorrecto', tipo: 1 })
                })
                .then(() => {
                    // comprueba si el usuario esta activo
                    return Utilidad.returnPromise(usuario.status, true, { msg: 'Error usuario inactivo', tipo: 2 })
                })
                .then(() => {
                    // comprueba si la contraseña es correcta
                    return Utilidad.returnPromise(usuario.password === password, true, { msg: 'Error contraseña incorrecta', tipo: 3 })
                })
                .then(() => {
                    // inicia al usuario
                    req.session.user = usuario
                    // envia para saber que es correcto
                    res.json ({msg:'Datos correctos', tipo: 4})
                    //res.redirect('/almacen')
                })
                .catch( error => {
                    // si hubo erro lo manda
                    Utilidad.printError(res, error)
                })
          }
}

function error404(req, res) {
    res.redirect('/almacen')
}

module.exports = {
    indexGet,
    loginGet,
    loginPost,
    logout,
    error404
}
