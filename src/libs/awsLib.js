import AWS from "aws-sdk";
import {COGNITO_ENV, API_GATEWAY} from '../config';
import { CognitoUserPool } from "amazon-cognito-identity-js";
import sigV4Client from "./sigV4Client";

const getAwsCredentials = (userToken) => {
    const authenticator = `cognito-idp.${COGNITO_ENV
        .REGION}.amazonaws.com/${COGNITO_ENV.USER_POOL_ID}`;
    
      AWS.config.update({ region: COGNITO_ENV.REGION });
    
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: COGNITO_ENV.IDENTITY_POOL_ID,
        Logins: {
          [authenticator]: userToken
        }
      });
    
      return AWS.config.credentials.getPromise();
}

function getCurrentUser() {
    const userPool = new CognitoUserPool({
      UserPoolId: COGNITO_ENV.USER_POOL_ID,
      ClientId: COGNITO_ENV.APP_CLIENT_ID
    });
    return userPool.getCurrentUser();
}

function getUserToken(currentUser) {
    return new Promise((resolve, reject) => {
        currentUser.getSession(function(err, session) {
            if (err) {
                reject(err);
                return;
            }
            resolve(session.getIdToken().getJwtToken());
         });
    });
}

export async function authUser() {
    if (
        AWS.config.credentials &&
        Date.now() < AWS.config.credentials.expireTime - 60000
    ) {
        return true;
    }

    const currentUser = getCurrentUser();

    if (currentUser === null) {
        return false;
    }

    const userToken = await getUserToken(currentUser);

    await getAwsCredentials(userToken);

    return true;
}

export async function invokeApig({
    path,
    method = "GET",
    headers = {},
    queryParams = {},
    body
  }) {
    if (!await authUser()) {
      throw new Error("User is not logged in");
    }
  
    const signedRequest = await sigV4Client
      .newClient({
        accessKey: AWS.config.credentials.accessKeyId,
        secretKey: AWS.config.credentials.secretAccessKey,
        sessionToken: AWS.config.credentials.sessionToken,
        region: API_GATEWAY.REGION,
        endpoint: API_GATEWAY.URL
      })
      .signRequest({
        method,
        path,
        headers,
        queryParams,
        body
      });
  
    body = body ? JSON.stringify(body) : body;
    headers = signedRequest.headers;
  
    const results = await fetch(signedRequest.url, {
      method,
      headers,
      body
    });
  
    if (results.status !== 200) {
      throw new Error(await results.text());
    }
  
    return results.json();
  }