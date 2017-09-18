function destructure({x,y,z}) {
    console.log(x,y,z);
}

function User(id,name) {
    this.id = id;
    this.name = name;
}

let user = new User(1234,'martin');
let {id,name} = user;

console.log(id,name);