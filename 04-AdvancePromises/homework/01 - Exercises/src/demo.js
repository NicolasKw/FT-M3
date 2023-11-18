//* Cuando hacemos promsesas usando la clase Promise hacemos:

const statusCode = 200;

const nuevaPromesa = new Promise((resolve, reject) => {
    setTimeout(() => {
        if(statusCode < 400) {
            resolve('Salió todo bien');
        } else {
            reject('Salió todo mal')
        }
    })}, 3000);

nuevaPromesa
    .then(value => {
        console.log(value);
        return value;
    })
    .then(value => console.log(value + ' de nuevo'))
    .catch(reason => console.log(reason))

console.log(nuevaPromesa)