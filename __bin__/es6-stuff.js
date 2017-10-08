const p = Promise.resolve('pepe');
p.then(contents => {
    console.log(contents);
    return Promise.resolve('posting');
}).then( contents => {
    console.log(contents);
});
