'use strict';

var uniq = require('array-uniq');
var assert = require('assert');
var difference = require('interset/difference');
var cuid = require('cuid');

var SCHEMA_BRAND = '$schemaBrand-' + cuid();
var allowedMethods = [
    'GET', 'POST', 'PUT', 'DELETE'
];
var allowedHttpRequestKeys = [
    'method', 'query', 'headers', 'body'
];
var allowedHttpResponseKeys = [
    'statusCode', 'headers', 'body'
];
var validStringOptions = [
    'minLength', 'maxLength'
];
var validStructoptions = [
    'additionalProperties'
];

var V = {
    struct: struct,
    enum: $enum,
    string: string,
    email: email,
    number: number,
    union: union,
    object: object,
    'null': $null,
    http: {
        Request: HttpRequest,
        Response: HttpResponse
    }
};

module.exports = V;

function SchemaBrand(obj) {
    Object.defineProperty(obj, '$schemaBrand', {
        writable: false,
        enumerable: false,
        configurable: true,
        value: SCHEMA_BRAND
    });

    return obj;
}

function isSchemaBranded(o) {
    return o.$schemaBrand === SCHEMA_BRAND;
}

function struct(props, options) {
    var keys = Object.keys(props);

    assert(keys.length > 0, 'props is required');

    var values = keys.map(function toValue(k) {
        return props[k];
    });
    var notBranded = values.filter(function isBranded(v) {
        return !isSchemaBranded(v);
    });

    assert(notBranded.length === 0,
        'expected all props to be schemas');

    if (options) {
        assert(typeof options === 'object',
            'options arg must be an object');

        var oKeys = Object.keys(options);

        assert(oKeys.length > 0 &&
            difference(oKeys, validStructoptions).length === 0,
            'expected only valid options');

        assert(!('additionalProperties' in options) ||
            typeof options.additionalProperties === 'boolean',
            'expected additionalProperties to be a boolean');
    }

    return SchemaBrand({
        'type': 'object',
        properties: props,
        required: keys,
        additionalProperties:
            (options && 'additionalProperties' in options) ?
                options.additionalProperties : false
    });
}

function $enum(xs) {
    assert(Array.isArray(xs) && xs.length > 0,
        'xs is required');

    var types = xs.map(function toTypeOf(x) {
        return typeof x;
    });
    var uniqueTypes = uniq(types);

    assert(uniqueTypes.length === 1, 'must have unique types');

    return SchemaBrand({
        'type': uniqueTypes[0],
        'enum': xs
    });
}

function string(expected, options) {
    function check() {
        assert(expected === undefined ||
            typeof expected === 'string',
            'expectedValue must be string');
        assert(options === undefined ||
            (typeof options === 'object' && options !== null),
            'expected options to be an object');

        if (options) {
            var keys = Object.keys(options);

            assert(!options || (
                keys.length > 0 &&
                difference(keys, validStringOptions).length === 0
            ), 'expected only valid option keys');

            assert(!options ||
                !('maxLength' in options) ||
                (typeof options.maxLength === 'number' &&
                options.maxLength > 0),
                'expected options.maxLength to be positive'
            );

            assert(!options ||
                !('minLength' in options) ||
                (typeof options.minLength === 'number' &&
                options.minLength > 0),
                'expected options.minLength to be positive'
            );
        }
    }

    if (typeof expected === 'object' && expected !== null) {
        options = expected;
        expected = undefined;
    }

    check();

    var doc = SchemaBrand({
        'type': 'string'
    });

    if (expected !== undefined) {
        doc.enum = [expected];
    }
    if (options && options.maxLength) {
        doc.maxLength = options.maxLength;
    }
    if (options && options.minLength) {
        doc.minLength = options.minLength;
    }

    return doc;
}

function email() {
    return SchemaBrand({
        type: 'string',
        format: 'email'
    });
}

function number(expected) {
    assert(expected === undefined ||
        typeof expected === 'number',
        'expectedValue must be a number');

    var doc = SchemaBrand({
        'type': 'number'
    });

    if (expected !== undefined) {
        doc.enum = [expected];
    }

    return doc;
}

function union(records) {
    assert(Array.isArray(records) && records.length > 0,
        'records must be non-empty array');

    var notBranded = records.filter(function isBranded(v) {
        return !isSchemaBranded(v);
    });

    assert(notBranded.length === 0,
        'expected all records to be schemas');

    return SchemaBrand({
        'oneOf': records
    });
}

function object(item) {
    assert(item, 'expected item argument');
    assert(item && isSchemaBranded(item),
        'expected item to be a schema');

    return SchemaBrand({
        'type': 'object',
        'additionalProperties': item
    });
}

function $null() {
    return SchemaBrand({
        type: 'null'
    });
}

function HttpRequest(req) {
    assert(req, 'req is required');

    var keys = Object.keys(req);

    assert(keys &&
        keys.length > 0 &&
        difference(keys, allowedHttpRequestKeys).length === 0,
        'expected only valid HttpRequest properties');

    assert(req.method &&
        typeof req.method === 'string' &&
        allowedMethods.indexOf(req.method) > 0,
        'req.method must be valid HTTP method'
    );

    assert(!req.query || typeof req.query === 'object',
        'req.query must be an object');

    assert(!req.headers || typeof req.headers === 'object',
        'req.headers must be an object');

    assert(!req.body || typeof req.body === 'object',
        'req.body must be an object');

    var opts = {
        method: V.string(req.method),
        url: V.string(),
        httpVersion: V.string(),
        query: req.query ?
            V.struct(req.query) :
            V.object(V.string()),
        headers: req.headers ?
            V.struct(req.headers, {
                additionalProperties: true
            }) :
            V.object(V.string())
    };

    if (req.body) {
        opts.body = V.struct(req.body);
    }

    return V.struct(opts);
}

function HttpResponse(res) {
    assert(res, 'res is required');

    var keys = Object.keys(res);

    assert(keys &&
        keys.length > 0 &&
        difference(keys, allowedHttpResponseKeys).length === 0,
        'expected only valid HttpResponse properties');

    assert(res.statusCode &&
        typeof res.statusCode === 'number' &&
        res.statusCode >= 100 &&
        res.statusCode <= 999,
        'req.statusCode must be a valid HTTP statusCode');

    assert(!res.headers || typeof res.headers === 'object',
        'res.headers must be an object');

    assert(!res.body || typeof res.body === 'object',
        'res.body must be an object');

    var opts = {
        statusCode: V.number(res.statusCode),
        headers: res.headers ?
            V.struct(res.headers) :
            V.object(V.string())
    };

    if (res.body) {
        opts.body = V.struct(res.body);
    }

    return V.struct(opts);
}
