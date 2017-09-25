function *foo() {
    yield 1;
    yield 2;
    yield 3;
    yield 4;
    yield 5;
}

var it = foo();

var message = it.next();
console.log(message);