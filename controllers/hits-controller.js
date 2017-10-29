const Hit = require('../model/Hit');

const responseUtils = require('../utils/response-utils');
const sendMsgCodeResponse = responseUtils.sendMsgCodeResponse;

exports.countLastDayByHour = function (req, res) {
    const serverId = req.params.serverId;
    Hit.countLastDayByHour(serverId, (err, data) => {
        if (err) return sendMsgCodeResponse(res, err.message, 500);
        res.send(data);
    });
};