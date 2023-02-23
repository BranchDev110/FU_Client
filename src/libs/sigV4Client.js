/*
 * Copyright (c) 2018 Florian Klampfer <https://qwtel.com/>
 *
 * This software uses portions of `sigV4Client.js`,
 * which is Apache-2.0 licensed with the following copyright:
 *
 * > Copyright 2010-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Changes:
 * * Replaced "crypto-js" with Web Cryptography API
 * * Promisified API
 * * Replaced `let` with `const` where applicable
 *
 * A copy of the Apache-2.0 license is located at:
 * <http://aws.amazon.com/apache2.0>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/* eslint max-len: ["error", 100]*/

import SHA256 from "crypto-js/sha256";
import encHex from "crypto-js/enc-hex";
import HMACSHA256 from "crypto-js/hmac-sha256";

const sigV4Client = {};
sigV4Client.newClient = function(config) {
  const AWS_SHA_256 = "AWS4-HMAC-SHA256";
  const AWS4_REQUEST = "aws4_request";
  const AWS4 = "AWS4";
  const X_AMZ_DATE = "x-amz-date";
  const X_AMZ_SECURITY_TOKEN = "x-amz-security-token";
  const HOST = "host";
  const AUTHORIZATION = "Authorization";

  const utf8TextEncoder = new TextEncoder("utf-8");

  function toBuffer(value) {
    // Convert strings to buffers via utf-8
    if (typeof value === 'string') return utf8TextEncoder.encode(value);

    // To enable chaining, e.g. hash(hash(value))
    if (value instanceof Uint8Array) return value;

    // There is no default way to represent arbitrary values as buffers
    throw Error(`${value} not one of string or Uint8Array`);
  }

  async function hash(value) {
    if (!global.crypto) return SHA256(value);

    // See: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
    const msgBuffer = toBuffer(value);
    const hashBuffer = await global.crypto.subtle.digest("SHA-256", msgBuffer);
    return new Uint8Array(hashBuffer);
  }

  function hexEncode(value) {
    if (!global.crypto) return value.toString(encHex);

    // See: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
    return Array.from(value).map(b => ("00" + b.toString(16)).slice(-2)).join("");
  }

  async function hmac(secret, value) {
    if (!global.crypto) return HMACSHA256(value, secret, { asBytes: true });

    const msgBuffer = toBuffer(value);
    const secBuffer = toBuffer(secret);

    // See: https://github.com/diafygi/webcrypto-examples#hmac
    const secKey = await global.crypto.subtle.importKey("raw", secBuffer, {
      name: "HMAC",
      hash: { name: "SHA-256" },
    }, false, ["sign"]);

    const hashBuffer = await global.crypto.subtle.sign({
      name: "HMAC"
    }, secKey, msgBuffer);

    return new Uint8Array(hashBuffer);
  }

  async function buildCanonicalRequest(method, path, queryParams, headers, payload) {
    return (
      method +
      "\n" +
      buildCanonicalUri(path) +
      "\n" +
      buildCanonicalQueryString(queryParams) +
      "\n" +
      buildCanonicalHeaders(headers) +
      "\n" +
      buildCanonicalSignedHeaders(headers) +
      "\n" +
      hexEncode(await hash(payload))
    );
  }

  async function hashCanonicalRequest(request) {
    return hexEncode(await hash(request));
  }

  function buildCanonicalUri(uri) {
    return encodeURI(uri);
  }

  function buildCanonicalQueryString(queryParams) {
    if (Object.keys(queryParams).length < 1) {
      return "";
    }

    const sortedQueryParams = [];
    for (const property in queryParams) {
      if (queryParams.hasOwnProperty(property)) {
        sortedQueryParams.push(property);
      }
    }
    sortedQueryParams.sort();

    let canonicalQueryString = "";
    for (let i = 0; i < sortedQueryParams.length; i++) {
      canonicalQueryString +=
        sortedQueryParams[i] +
        "=" +
        encodeURIComponent(queryParams[sortedQueryParams[i]]) +
        "&";
    }
    return canonicalQueryString.substr(0, canonicalQueryString.length - 1);
  }

  function buildCanonicalHeaders(headers) {
    let canonicalHeaders = "";
    const sortedKeys = [];
    for (const property in headers) {
      if (headers.hasOwnProperty(property)) {
        sortedKeys.push(property);
      }
    }
    sortedKeys.sort();

    for (let i = 0; i < sortedKeys.length; i++) {
      canonicalHeaders +=
        sortedKeys[i].toLowerCase() + ":" + headers[sortedKeys[i]] + "\n";
    }
    return canonicalHeaders;
  }

  function buildCanonicalSignedHeaders(headers) {
    const sortedKeys = [];
    for (const property in headers) {
      if (headers.hasOwnProperty(property)) {
        sortedKeys.push(property.toLowerCase());
      }
    }
    sortedKeys.sort();

    return sortedKeys.join(";");
  }

  function buildStringToSign(
    datetime,
    credentialScope,
    hashedCanonicalRequest
  ) {
    return (
      AWS_SHA_256 +
      "\n" +
      datetime +
      "\n" +
      credentialScope +
      "\n" +
      hashedCanonicalRequest
    );
  }

  function buildCredentialScope(datetime, region, service) {
    return (
      datetime.substr(0, 8) + "/" + region + "/" + service + "/" + AWS4_REQUEST
    );
  }

  async function calculateSigningKey(secretKey, datetime, region, service) {
    return await hmac(
      await hmac(
        await hmac(
          await hmac(AWS4 + secretKey, datetime.substr(0, 8)),
          region
        ),
        service
      ),
      AWS4_REQUEST
    );
  }

  async function calculateSignature(key, stringToSign) {
    return hexEncode(await hmac(key, stringToSign));
  }

  function extractHostname(url) {
    var hostname;

    if (url.indexOf("://") > -1) {
      hostname = url.split('/')[2];
    }
    else {
      hostname = url.split('/')[0];
    }

    hostname = hostname.split(':')[0];
    hostname = hostname.split('?')[0];

    return hostname;
  }

  function buildAuthorizationHeader(
    accessKey,
    credentialScope,
    headers,
    signature
  ) {
    return (
      AWS_SHA_256 +
      " Credential=" +
      accessKey +
      "/" +
      credentialScope +
      ", SignedHeaders=" +
      buildCanonicalSignedHeaders(headers) +
      ", Signature=" +
      signature
    );
  }

  const awsSigV4Client = {};
  if (config.accessKey === undefined || config.secretKey === undefined) {
    return awsSigV4Client;
  }
  awsSigV4Client.accessKey = config.accessKey;
  awsSigV4Client.secretKey = config.secretKey;
  awsSigV4Client.sessionToken = config.sessionToken;
  awsSigV4Client.serviceName = config.serviceName || "execute-api";
  awsSigV4Client.region = config.region || "us-east-1";
  awsSigV4Client.defaultAcceptType =
    config.defaultAcceptType || "application/json";
  awsSigV4Client.defaultContentType =
    config.defaultContentType || "application/json";

  const invokeUrl = config.endpoint;
  const endpoint = /(^https?:\/\/[^/]+)/g.exec(invokeUrl)[1];
  const pathComponent = invokeUrl.substring(endpoint.length);
  awsSigV4Client.endpoint = endpoint;
  awsSigV4Client.pathComponent = pathComponent;

  awsSigV4Client.signRequest = async function(request) {
    const verb = request.method.toUpperCase();
    const path = awsSigV4Client.pathComponent + request.path;
    const queryParams = { ...request.queryParams };
    const headers = { ...request.headers };

    // If the user has not specified an override for Content type the use default
    if (headers["Content-Type"] === undefined) {
      headers["Content-Type"] = awsSigV4Client.defaultContentType;
    }

    // If the user has not specified an override for Accept type the use default
    if (headers["Accept"] === undefined) {
      headers["Accept"] = awsSigV4Client.defaultAcceptType;
    }

    let body = { ...request.body };
    // override request body and set to empty when signing GET requests
    if (request.body === undefined || verb === "GET") {
      body = "";
    } else {
      body = JSON.stringify(body);
    }

    // If there is no body remove the content-type header so it is not
    // included in SigV4 calculation
    if (body === "" || body === undefined || body === null) {
      delete headers["Content-Type"];
    }

    const datetime = new Date()
      .toISOString()
      .replace(/\.\d{3}Z$/, "Z")
      .replace(/[:-]|\.\d{3}/g, "");
    headers[X_AMZ_DATE] = datetime;
    headers[HOST] = extractHostname(awsSigV4Client.endpoint);

    const canonicalRequest = await buildCanonicalRequest(
      verb,
      path,
      queryParams,
      headers,
      body
    );
    const hashedCanonicalRequest = await hashCanonicalRequest(canonicalRequest);
    const credentialScope = buildCredentialScope(
      datetime,
      awsSigV4Client.region,
      awsSigV4Client.serviceName
    );
    const stringToSign = buildStringToSign(
      datetime,
      credentialScope,
      hashedCanonicalRequest
    );
    const signingKey = await calculateSigningKey(
      awsSigV4Client.secretKey,
      datetime,
      awsSigV4Client.region,
      awsSigV4Client.serviceName
    );
    const signature = await calculateSignature(signingKey, stringToSign);
    headers[AUTHORIZATION] = buildAuthorizationHeader(
      awsSigV4Client.accessKey,
      credentialScope,
      headers,
      signature
    );
    if (
      awsSigV4Client.sessionToken !== undefined &&
      awsSigV4Client.sessionToken !== ""
    ) {
      headers[X_AMZ_SECURITY_TOKEN] = awsSigV4Client.sessionToken;
    }
    delete headers[HOST];

    let url = awsSigV4Client.endpoint + path;
    const queryString = buildCanonicalQueryString(queryParams);
    if (queryString !== "") {
      url += "?" + queryString;
    }

    // Need to re-attach Content-Type if it is not specified at this point
    if (headers["Content-Type"] === undefined) {
      headers["Content-Type"] = awsSigV4Client.defaultContentType;
    }

    return {
      headers: headers,
      url: url
    };
  };

  return awsSigV4Client;
};

export default sigV4Client;