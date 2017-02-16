'use strict';

// PACKAGES
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const configFile = require('./config.json');
const AuthPolicy = require('./authPolicy');
const config = loadConfiguration();
const certFilePath = path.resolve(__dirname, config.certName);
const cert = fs.readFileSync(certFilePath);

// Regular expression pattern for authorization header
const bearerTokenPattern = /^Bearer[ ]+([^ ]+)[ ]*$/i;

/**
 * Load configuration based on SERVERLESS_STAGE
 * @returns {Object}
 */
function loadConfiguration() {
    if (process.env.SERVERLESS_STAGE === 'prod') {
        console.log('Loading prod configurations.');
        return configFile.prod;
    } else {
        console.log('Loading staging configurations.');
        return configFile.stage;
    }
}

/**
 * A function to extract an access token from Authorization header.
 *
 * This function assumes the value complies with the format described
 * in "RFC 6750, 2.1. Authorization Request Header Field". For example,
 * if "Bearer 123" is given to this function, "123" is returned.
 *
 * @param {String} authorization
 * @returns {String}
 */
function extractAccessToken(authorization) {
    // If the value of Authorization header is not available.
    if (!authorization) {
        // No access token.
        return null;
    }

    // Check if it matches the pattern "Bearer {access-token}".
    const result = bearerTokenPattern.exec(authorization);

    // If the Authorization header does not match the pattern.
    if (!result) {
        // No access token.
        return null;
    }

    // Return the access token.
    return result[1];
}

/**
 * Check if the scope requirement is fulfilled.
 *
 * @param {String[]} requiredScopes
 * @param {String[]} tokenScopes
 * @returns {boolean}
 */
function checkScopeRequirement(requiredScopes, tokenScopes) {
    if (!tokenScopes) {
        console.log('Missing token scopes.');
        return false;
    }

    if (!requiredScopes) {
        console.log('Missing required scopes.');
        return false;
    }

    for (let i = 0; i < requiredScopes.length; i++) {
        if (tokenScopes.indexOf(requiredScopes[i]) === -1) {
            console.log('Missing ' + requiredScopes[i] + ' scope.');
            return false;
        }
    }

    return true;
}

exports.handler = function (event, context, callback) {
    console.log(`Client token: ${event.authorizationToken}`);
    console.log(`Method ARN: ${event.methodArn}`);

    // validate the incoming token
    // and produce the principal user identifier associated with the token

    // this could be accomplished in a number of ways:
    // 1. Call out to OAuth provider
    // 2. Decode a JWT token inline
    // 3. Lookup in a self-managed DB

    // you can send a 401 Unauthorized response to the client by failing like so:
    // context.fail("Unauthorized");

    // if the token is valid, a policy must be generated which will allow or deny access to the client

    // if access is denied, the client will recieve a 403 Access Denied response
    // if access is allowed, API Gateway will proceed with the backend integration
    // configured on the method that was called.

    // build apiOptions for the AuthPolicy
    const apiOptions = {};
    const tmp = event.methodArn.split(':');
    const apiGatewayArnTmp = tmp[5].split('/');
    const awsAccountId = tmp[4];
    apiOptions.region = tmp[3];
    apiOptions.restApiId = apiGatewayArnTmp[0];
    apiOptions.stage = apiGatewayArnTmp[1];
    const httpMethod = apiGatewayArnTmp[2];
    let resource = '/'; // root resource
    if (apiGatewayArnTmp[3]) {
        resource += apiGatewayArnTmp[3];
    }

    // The access token presented by the client application.
    const token = extractAccessToken(event.authorizationToken);

    if (!token) {
        console.log('No access token.');
        callback('Unauthorized', null);
        return;
    }

    // this function must generate a policy that is associated with the recognized principal user identifier.
    // depending on your use case, you might store policies in a DB, or generate them on the fly

    // keep in mind, the policy is cached for 5 minutes by default (TTL is configurable in the authorizer)
    // and will apply to subsequent calls to any method/resource in the RestApi
    // made with the same token

    jwt.verify(token, cert, {
        algorithms: config.algorithm,
        issuer: config.issuer
    }, (err, decoded) => {
        if (err) {
            console.log('Jwt verify error: ', err.message);
            // context.fail(err.message); // this will return a http status code of 500
            callback('Unauthorized', null); // this will return a status code of 401
        } else {
            const principalId = decoded.sub || null;
            const clientId = decoded['client_id'] || null;
            const policy = new AuthPolicy(principalId, clientId, awsAccountId, apiOptions);

            if (!checkScopeRequirement(config.scope, decoded.scope)) {
                // policy.denyMethod(httpMethod, resource);
                policy.denyAllMethods();
            } else {
                // policy.allowMethod(httpMethod, resource);
                policy.allowAllMethods();
            }

            console.log('AuthPolicy: ', policy);
            // finally, build the policy and exit the function using context.succeed()
            const policyDocument = policy.build();
            console.log('Policy Document: ', JSON.stringify(policyDocument));

            callback(null, policyDocument);
        }
    });
};
