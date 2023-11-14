const process = require('process');
const { Z_ASCII } = require('zlib');
const commands = require('./commands/index.js');

function print(output) {
   process.stdout.write(output); //* Imprimo el output
   process.stdout.write('\nprompt > '); //* Imprimo el salto de línea para que el cliente pueda escribir otro prompt
}

function bash() {
   process.stdout.write('prompt > '); //* Igual que antes pero sin el salto de línea
   process.stdin.on('data', data => { //* stdin.on es como un AddEventListener para interactuar con la consola
      let args = data.toString().trim().split(' ');
      const cmd = args.shift(); //* Quiero que args quede como un array sin el comando
      if(commands.hasOwnProperty(cmd)) commands[cmd](print, args.join(' '));
      else print(`command not found: ${cmd}`);
   });
}

bash();
module.exports = {
   print,
   bash,
};