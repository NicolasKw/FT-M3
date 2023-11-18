'use strict';
/*----------------------------------------------------------------
Promises Workshop: construye la libreria de ES6 promises, pledge.js
----------------------------------------------------------------*/
// // TU CÓDIGO AQUÍ:

class $Promise {
    constructor(executor) {
        if(typeof executor !== 'function') throw new TypeError('El executor debe ser una function');

        this._state = 'pending';
        this._value = undefined;
        this._handlerGroups = [];

        executor(this._internalResolve.bind(this), this._internalReject.bind(this))
        /* Sin el bind, los métodos _internalResolve e _interlarReject se ejecutarían en el contexto de 
        la función executor. Por lo tanto, 'this' pierde referencia, o sea, no hace referencia a la instancia
        de $Promise */
    }  

    _internalResolve(data) {
        if(this._state === 'pending') {
            this._state = 'fulfilled';
            this._value = data;
            this._callHandlers();
        }
    }

    _internalReject(reason) {
        if(this._state === 'pending') {
            this._state = 'rejected';
            this._value = reason;
            this._callHandlers();
        }
    }

    then(successCb, errorCb) {
        if(typeof successCb !== 'function' && typeof errorCb !== 'function') {
            successCb = false;
            errorCb = false;
        }

        const downstreamPromise = new $Promise(() => {});

        this._handlerGroups.push({successCb, errorCb, downstreamPromise}); // Objetos literales ES6: clave y valor con mismo nombre

        if(this._state !== 'pending') this._callHandlers();

        return downstreamPromise;
    }

    _callHandlers() {
        while(this._handlerGroups.length) {
            const handler = this._handlerGroups.shift();

            //* Chequeamos si la promesa está completa:
            if(this._state === 'fulfilled') {

                //* Si tenemos successCb
                if(handler.successCb) {
                    try {
                        const resultado = handler.successCb(this._value);
    
                        //* Si es una promesa
                        if(resultado instanceof $Promise) {
                            //* Retornar una nueva promesa -> Promesa Z
                            return resultado.then(value => handler.downstreamPromise._internalResolve(value), 
                                error => handler.downstreamPromise._internalReject(error));
                        } else {
                            handler.downstreamPromise._internalResolve(resultado);
                        }
                    } catch (error) {
                        handler.downstreamPromise._internalReject(error);
                    }
                } else {
                    handler.downstreamPromise._internalResolve(this._value);
                }
            }

            if(this._state === 'rejected') {

                //* Si tenemos errorCB
                if(handler.errorCb) {
                    try {
                        const resultado = handler.errorCb(this._value);

                        //* Si es una promesa
                        if(resultado instanceof $Promise) {
                            return resultado.then(value => handler.downstreamPromise._internalResolve, 
                                error => handler.downstreamPromise._internalReject(error));
                        } else {
                            handler.downstreamPromise._internalResolve(resultado)
                        };
                    } catch (error) {
                        handler.downstreamPromise._internalReject(error);
                    }
                } else {
                    handler.downstreamPromise._internalReject(this._value)
                }
            }

            if(this._state === 'fulfilled' && handler.successCb) {
                handler.successCb(this._value);
            }

            if(this._state === 'rejected' && handler.errorCb) {
                handler.errorCb(this._value);
            }
        }
    }

    catch(errorCb) {
        return this.then(null, errorCb);
    }
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
