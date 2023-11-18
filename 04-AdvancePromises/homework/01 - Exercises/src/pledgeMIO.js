'use strict';
/*----------------------------------------------------------------
Promises Workshop: construye la libreria de ES6 promises, pledge.js
----------------------------------------------------------------*/
// // TU CÓDIGO AQUÍ:

function $Promise(executor) {
    if(typeof executor !== 'function') throw new TypeError('executor must be a function');

    this._state = 'pending';
    this._value = undefined;
    this._handlerGroups = [];

    executor(this._internalResolve.bind(this), this._internalReject.bind(this));
    //* Debido al asincronismo, cuando se ejecute el executer podría estar en un contexto diferente y perder entonces la referencia.
    //* Por lo tanto, con bind aseguro que el this haga referencia siempre al objeto que está instanciando la clase $Promise
}

$Promise.prototype._internalResolve = function(data) {
    if(this._state === 'pending') {
        this._state = 'fulfilled';
        this._value = data;
        this._callHandlers();
    }
}

$Promise.prototype._internalReject = function(reason) {
    if(this._state === 'pending') {
        this._state = 'rejected';
        this._value = reason;
        this._callHandlers();
    }
}

$Promise.prototype.then = function(successCb, errorCb) {
    if(typeof successCb !== 'function' && typeof errorCb !== 'function') {
        successCb = false;
        errorCb = false
    }

    const downstreamPromise = new $Promise(() => {});

    this._handlerGroups.push({successCb, errorCb, downstreamPromise})

    if(this._state !== 'pending') this._callHandlers();

    return downstreamPromise;
}

$Promise.prototype._callHandlers = function() {
    while(this._handlerGroups.length) {
        const handler = this._handlerGroups.shift();

        if(this._state === 'fulfilled') {

            if(handler.successCb) {
                try {
                    const resultado = handler.successCb(this._value);

                    if(resultado instanceof $Promise) {
                        resultado.then(
                            value => handler.downstreamPromise._internalResolve(value),
                            reason => handler.downstreamPromise._internalReject(reason));
                    } else {
                        handler.downstreamPromise._internalResolve(resultado);
                    }
                } catch(error) {
                    handler.downstreamPromise._internalReject(error);
                }
            } else {
                handler.downstreamPromise._internalResolve(this._value);
            }
        }

        if(this._state === 'rejected') {

            if(handler.errorCb) {
                try {
                    const resultado = handler.errorCb(this._value);

                    if(resultado instanceof $Promise) {
                        resultado.then(
                            value => handler.downstreamPromise._internalResolve(value),
                            reason => handler.downstreamPromise._internalReject(reason));
                    } else {
                        handler.downstreamPromise._internalResolve(resultado);
                    }
                } catch(error) {
                    handler.downstreamPromise._internalReject(error);
                }
            } else {
                handler.downstreamPromise._internalReject(this._value);
            }
        }       
    }
}

$Promise.prototype.catch = function(errorCb) {
    return this.then(null, errorCb);
}



module.exports = $Promise;
/*-------------------------------------------------------
El spec fue diseñado para funcionar con Test'Em, por lo tanto no necesitamos
realmente usar module.exports. Pero aquí está para referencia:

module.exports = $Promise;

Entonces en proyectos Node podemos esribir cosas como estas:

var Promise = require('pledge');
…
var promise = new Promise(function (resolve, reject) { … });
--------------------------------------------------------*/
