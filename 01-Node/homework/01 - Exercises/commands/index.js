const fs = require("fs");
const utils = require("../utils/request");
const process = require("process");

function pwd(print) {
    print(process.cwd()); //* cwd = current working directory
}

function date(print) {
    print(Date()); //* si no le pusiera la D mayúscula estaría haciendo una recursión
}

function echo(print, args) {
    print(args);
}

function ls(print) {
    fs.readdir('.', (error, files) => {
        if(error) throw new Error(error); //* Se puede poner el new o no, es igual
        print(files.join(' '));
    });
}

function cat(print, args) {
    fs.readFile(args, 'utf-8', (error, data) => {
        if(error) throw new Error(error);
        print(data);
    })
}

function head(print, args) {
    fs.readFile(args, 'utf-8', (error, data) => {
        if(error) throw new Error(error);
        print(data.split('\n')[0]); //* Si quisiera las primeras 8 líneas, hago split('\n').slice(0, 8) y después un join('\n')
    })
}

function tail(print, args) {
    fs.readFile(args, 'utf-8', (error, data) => {
        if(error) throw new Error(error);
        const lines = data.split('\n')
        print(lines[lines.length - 1].trim()) //* Podría hacer data.split('\n').at(-1) también
    })
}

function curl(print, args) {
    utils.request(`https://${args}`, (error, response) => {
        if(error) throw new Error(error);
        print(response);
    })
}

module.exports = {
    pwd,
    date,
    echo,
    ls,
    cat,
    head,
    tail,
    curl
};
