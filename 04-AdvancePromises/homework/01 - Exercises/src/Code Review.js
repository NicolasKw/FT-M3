"use strict";
/*----------------------------------------------------------------
Promises Workshop: construye la libreria de ES6 promises, pledge.js
----------------------------------------------------------------*/
// TU CÓDIGO AQUÍ:
function $Promise(executor) {
  if (typeof executor !== "function")
    throw TypeError("The executor must be a function");

  this._state = "pending";
  this._value = undefined;
  this._handlerGroups = []

  executor(this._internalResolve.bind(this), this._internalReject.bind(this))
}

$Promise.prototype._internalResolve = function (value) {
  if (this._state === "pending") {
    this._state = "fulfilled";
    this._value = value;
    this._callHandlers()
  }
};

$Promise.prototype._internalReject = function (value) {
    if(this._state === 'pending'){
        this._state = 'rejected';
        this._value = value
        this._callHandlers()
    }
};

$Promise.prototype.then = function(successCb, errorCb){
    if(typeof successCb !== 'function' && typeof errorCb !== 'function'){
        successCb = false;
        errorCb = false;
    }

    const downstreamPromise = new $Promise(()=>{})

    this._handlerGroups.push({successCb, errorCb, downstreamPromise})

    if(this._state !== 'pending') this._callHandlers()

    return downstreamPromise;
}

$Promise.prototype._callHandlers = function(){
    while(this._handlerGroups.length){
        const handler = this._handlerGroups.shift()

        // * Chequeamos si la promesa está completa exitosamente:
        if(this._state === 'fulfilled' ){

            // * Si tenemos successCB
            if(handler.successCb){
               try {
                const resultado = handler.successCb(this._value)

                // * Si es una promesa...
                if(resultado instanceof $Promise){
                    // ? Retornar una nueva promesa -> promesa z
                    return resultado.then((value)=> handler.downstreamPromise._internalResolve(value) ,(error)=>handler.downstreamPromise._internalReject(error))
                }else{
                    handler.downstreamPromise._internalResolve(resultado)
                }
               } catch (error) {
                    handler.downstreamPromise._internalReject(error)
               }
            }else {
                handler.downstreamPromise._internalResolve(this._value)
            }
        }

        if(this._state === 'rejected' ){
            // * si hay errorCb...
            if(handler.errorCb){
                try {
                    const resultado = handler.errorCb(this._value)

                    // ? si es una promesa...
                    if(resultado instanceof $Promise){
                        return resultado.then((value)=>handler.downstreamPromise._internalResolve(value), (error)=>handler.downstreamPromise._internalReject(error))
                    }else{
                        handler.downstreamPromise._internalResolve(resultado)
                    }
                } catch (error) {
                    handler.downstreamPromise._internalReject(error)
                }
            }else{
                handler.downstreamPromise._internalReject(this._value)
            }
        }
    }
}

$Promise.prototype.catch = function(errorCb){
    return this.then(null, errorCb)

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