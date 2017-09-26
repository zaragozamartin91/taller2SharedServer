function foo(tok) {
    let { token, owner, expiresAt = tok.expiresat } = tok;
    console.log(token, owner, expiresAt);
}

foo({token:'pepe',owner:'martin',expiresat:'12313'});
foo({token:'pepe',owner:'martin',expiresAt:'12313'});