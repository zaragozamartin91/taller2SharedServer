function transform(str) {
    return 'trans-' + str;
}

const userObj = {
    name: 'martin'
};

//let { name, surname = transform(name) } = userObj;
let {newName: name} = userObj;
 
//console.log(name, surname);
console.log(name);
