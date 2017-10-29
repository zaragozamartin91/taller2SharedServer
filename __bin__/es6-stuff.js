function foo() {
    try {
        setTimeout(function () {
            throw new Error('mierda');
        }, 1000);
    } catch (error) {
        console.error('Paso error');
    }
}

foo();