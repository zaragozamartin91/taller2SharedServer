function parse( {serverId , params: {userId}} ) {
    console.log(serverId);
    console.log(userId);
}

const req = { serverId: 1234, params: {  } };

parse(req);