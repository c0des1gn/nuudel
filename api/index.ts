import fastify, { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import { nextPlugin, oauthPlugin, oauth2 } from 'nuudel-main';
import { Server, IncomingMessage, ServerResponse } from 'http';
//import { Http2Server, Http2ServerRequest, Http2ServerResponse } from 'http2';
import { ApolloServer } from 'apollo-server-fastify';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from 'apollo-server-core';
import jwt, { FastifyJWTOptions } from 'fastify-jwt';
import makeSchema from './makeSchema';
import { makeContext, ConnectDB } from 'nuudel-main';
import fastifyCron from 'fastify-cron';
import { defaultJob } from './service/jobs/rates';
import { Verification, Reset } from './controller';
import {
  ProfileCallback,
  Upload,
  Remove,
  SentNotification,
  Recapcha,
} from 'nuudel-main';

import fastifyMultipart from 'fastify-multipart';
import fastifyCompress from 'fastify-compress';
import cookie, { FastifyCookieOptions } from 'fastify-cookie';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import { setTranslate } from 'nuudel-main';
import { t } from './loc/I18n';

setTranslate(t);

const {
  PORT,
  JWT_SECRET,
  FB_CLIENT_ID,
  FB_CLIENT_SECRET,
  WEB = '',
  NODE_ENV,
  COOKIE_SECRET,
} = process.env;

const app: FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse,
  FastifyLoggerInstance
> = fastify({
  logger: {
    prettyPrint: { translateTime: 'yyyy-mm-dd HH:MM:ss' },
  },
  pluginTimeout: 60000,
  //http2: true,
  /*
  https: {
    allowHTTP1: true, // fallback support for HTTP1
    //key: fs.readFileSync(path.join(__dirname, '../keys', 'private.key')),
    //cert: fs.readFileSync(path.join(__dirname, '../keys', 'cert.pem')),
  }, // */
});

const HOST = '0.0.0.0'; // replace with own server IP

const bootstrap = async () => {
  ConnectDB(async dbURL => {
    app.log.info(`Mongoose Connected at ${dbURL}`);
    try {
      const schema = await makeSchema();
      app.log.info('Graphql Schema Generated');
      //listen subscription WebSocket
      const subscriptionServer = SubscriptionServer.create(
        { schema, execute, subscribe },
        {
          server: app.server,
          path: '/api/graphql',
          /*
          onConnect: (connectionParams: any, webSocket) => {
            try {
              const decoded: any = app.jwt.verify(
                connectionParams.authToken.split(' ').pop(),
              );
              return;
            } catch (err) {
              throw new Error('Missing auth token!');
            }
          }, // */
        },
      );

      const server = new ApolloServer({
        schema,
        context: ctx => makeContext(app, ctx),
        introspection: true,
        /*
        formatResponse(response, { context }: any) {
          if (!context.deviceId) {
            return {};
          }
          return response;
        }, // */
        plugins: [
          process.env.NODE_ENV !== 'development'
            ? ApolloServerPluginLandingPageProductionDefault({ footer: false })
            : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
          {
            async serverWillStart() {
              return {
                async drainServer() {
                  subscriptionServer.close();
                },
              };
            },
          },
        ],
      });

      await server.start();
      app.register(
        server.createHandler({
          path: '/api/graphql',
        }),
      );

      //*
      app.register(fastifyMultipart, {
        addToBody: false,
        sharedSchemaId: 'MultipartFileType',
        onFile: (fieldName, stream, filename, encoding, mimetype, body) => {
          stream.resume();
        },
        limits: {
          fieldNameSize: 100, // Max field name size in bytes
          fieldSize: 1000000, // Max field value size in bytes
          fields: 20, // Max number of non-file fields
          fileSize: 1000000, // 1Mb the max file size
          files: 1, // Max number of file fields
          //headerPairs: 2000   // Max number of header key=>value pairs
        },
      }); // */

      app.register(fastifyCompress, {
        global: false,
        threshold: 512,
        //inflateIfDeflated: true,
        encodings: ['gzip', 'deflate', 'br'],
      });

      // dev mode only graphql backend
      if (NODE_ENV !== 'development') {
        app.register(nextPlugin);
      }

      app.register(oauth2, {
        name: 'facebookOAuth2',
        scope: ['public_profile', 'email'],
        credentials: {
          client: {
            id: FB_CLIENT_ID,
            secret: FB_CLIENT_SECRET,
          },
          auth: oauthPlugin.FACEBOOK_CONFIGURATION,
        },
        startRedirectPath: '/login/facebook',
        callbackUri: `${WEB}/login/facebook/callback`,
      });

      app.register(cookie, {
        secret: COOKIE_SECRET, // for cookies signature
        parseOptions: {}, // options for parsing cookies
      } as FastifyCookieOptions);

      await app.listen(parseInt(PORT, 10), HOST);
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  });
};

// ideally this function would do a query against some sort of storage to determine its outcome
async function validateToken(request, decodedToken) {
  const denylist = ['token1', 'token2'];

  return !denylist.includes(decodedToken.jti);
}

app.register(jwt, {
  secret: JWT_SECRET,
  credentialsRequired: false,
  //trusted: validateToken,
  //cookie: {
  //  cookieName: 'token',
  //  signed: false,
  //},
} as FastifyJWTOptions);

app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

app.post('/recapcha', Recapcha);
app.post('/upload', { preValidation: [(app as any).authenticate] }, Upload);
app.post('/remove', { preValidation: [(app as any).authenticate] }, Remove);
app.post(
  '/sent',
  { preValidation: [(app as any).authenticate] },
  SentNotification,
);
app.get('/login/facebook/callback', ProfileCallback);
app.get('/verification', Verification);
app.get('/reset', Reset);
/* // test cookie
app.get('/cookies', async (request, reply) => {
  const token = await reply.jwtSign({
    _id: '60c887edacf1713fc77d7f8c',
    username: 'damii',
    type: 'User',
    roles: ['User'],
    status: 'Active',
  });
  reply
    .setCookie('token', token, {
      domain: '*',
      path: '/',
      secure: true,
      signed: false,
      httpOnly: true,
      sameSite: true,
    })
    .code(200)
    .send('Cookie sent: ' + !!token);
}); // */

app.register(fastifyCron, {
  jobs: [
    {
      // Only these two properties are required,
      // the rest is from the node-cron API:
      // https://github.com/kelektiv/node-cron#api
      cronTime: '0 */60 9-19 * * *', // Every hour between 9-19:

      // Note: the callbacks (onTick & onComplete) take the server
      // as an argument, as opposed to nothing in the node-cron API:
      onTick: async () => {
        await defaultJob();
        // at 9am
      },
      onComplete: undefined,
      start: true,
      timeZone: 'Asia/Ulaanbaatar',
    },
  ],
});

app.addHook('onRequest', async (request, reply) => {
  if (request.cookies) {
    const result = reply.unsignCookie(request.cookies.token);
    if (result.valid && result.renew) {
      reply.setCookie('token', result.value, {
        domain: '*',
        path: '/',
        secure: true,
        signed: false,
        httpOnly: true,
        sameSite: true,
      });
    } else {
      reply.clearCookie('token', { path: '/' });
    }
  }
  try {
    await request.jwtVerify();
  } catch (err) {
    //reply.send(err);
    return;
  }
});

process.on('uncaughtException', error => {
  console.error(error);
});
process.on('unhandledRejection', error => {
  console.error(error);
});

bootstrap();
