var crypto = require('crypto');
var zlib = require('zlib');

var base64url = {};

var newBuffer = function (fill, encoding) {
    return Buffer.from ? Buffer.from(fill, encoding) : new Buffer(fill, encoding)
};

base64url.unescape = function unescape(str) {
    return (str + Array(5 - str.length % 4))
        .replace(/_/g, '=')
        .replace(/\-/g, '/')
        .replace(/\*/g, '+');
};

base64url.escape = function escape(str) {
    return str.replace(/\+/g, '*')
        .replace(/\//g, '-')
        .replace(/=/g, '_');
};

base64url.encode = function encode(str) {
    return this.escape(newBuffer(str).toString('base64'));
};

base64url.decode = function decode(str) {
    return newBuffer(this.unescape(str), 'base64').toString();
};

function base64encode(str) {
    return newBuffer(str).toString('base64')
}

function base64decode(str) {
    return newBuffer(str, 'base64').toString()
}

var Api = function (sdkappid, key) {
    this.sdkappid = sdkappid;
    this.key = key;
};
/**
 * 通过传入参数生成 base64 的 hmac 值
 * @param identifier
 * @param currTime
 * @param expire
 * @returns {string}
 * @private
 */
Api.prototype._hmacsha256 = function (identifier, currTime, expire, base64UserBuf) {
    var contentToBeSigned = "TLS.identifier:" + identifier + "\n";
    contentToBeSigned += "TLS.sdkappid:" + this.sdkappid + "\n";
    contentToBeSigned += "TLS.time:" + currTime + "\n";
    contentToBeSigned += "TLS.expire:" + expire + "\n";
    if (null != base64UserBuf) {
        contentToBeSigned += "TLS.userbuf:" + base64UserBuf + "\n";
    }
    const hmac = crypto.createHmac("sha256", this.key);
    return hmac.update(contentToBeSigned).digest('base64');
};


Api.prototype.genSig = function (userid, expire, userBuf) {
    var currTime = Math.floor(Date.now() / 1000);

    var sigDoc = {
        'TLS.ver': "2.0",
        'TLS.identifier': "" + userid,
        'TLS.sdkappid': Number(this.sdkappid),
        'TLS.time': Number(currTime),
        'TLS.expire': Number(expire)
    };

    var sig = '';
    if (null != userBuf) {
        var base64UserBuf = base64encode(userBuf);
        sigDoc['TLS.userbuf'] = base64UserBuf;
        sig = this._hmacsha256(userid, currTime, expire, base64UserBuf);
    } else {
        sig = this._hmacsha256(userid, currTime, expire, null);
    }
    sigDoc['TLS.sig'] = sig;

    var compressed = zlib.deflateSync(newBuffer(JSON.stringify(sigDoc))).toString('base64');
    return base64url.escape(compressed);
}
/**
 *【功能说明】用于签发 TRTC 和 IM 服务中必须要使用的 UserSig 鉴权票据
 *
 *【参数说明】
 * @param userid - 用户id，限制长度为32字节，只允许包含大小写英文字母（a-zA-Z）、数字（0-9）及下划线和连词符。
 * @param expire - UserSig 票据的过期时间，单位是秒，比如 86400 代表生成的 UserSig 票据在一天后就无法再使用了。
 */
Api.prototype.genUserSig = function (userid, expire) {
    return this.genSig(userid, expire, null);
};

exports.Api = Api;