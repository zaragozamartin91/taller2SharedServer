const p = Promise.resolve('pepe');
p.then(contents => {
    console.log(contents);
    return Promise.resolve('posting');
}).then(contents => {
    console.log(contents);
});

// cause.request.res.statusCode
function foo({ request: { res: { statusCode = 500 } = {} } = {} } = {}) {
    console.log(statusCode);
}

const cause = { request: {} };
foo(cause);
