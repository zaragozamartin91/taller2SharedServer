function getStatusCode({ request: { res: { statusCode = 500 } = {} } ={} }) {
    return statusCode;
}

console.log(getStatusCode({}));