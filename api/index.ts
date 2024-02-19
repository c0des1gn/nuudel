import Fastify, {FastifyInstance, FastifyBaseLogger} from 'fastify';
import {oauthPlugin, oauth2} from 'nuudel-main';
import FastifyNext from '@fastify/nextjs';
import {Server, IncomingMessage, ServerResponse} from 'http';
import {ApolloServer, BaseContext} from '@apollo/server';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import fastifyApollo, {
  fastifyApolloDrainPlugin,
  fastifyApolloHandler,
  ApolloFastifyContextFunction,
} from '@as-integrations/fastify';
//import {startServerAndCreateNextHandler} from '@as-integrations/next';
import jwt, {FastifyJWTOptions} from '@fastify/jwt';
import fastifyCors, {FastifyCorsOptions} from '@fastify/cors';
import makeSchema from './makeSchema';
import {makeContext, ConnectDB, IContext} from 'nuudel-main';
import fastifyCron from 'fastify-cron';
import {defaultJob} from './service/jobs/rates';
import {Verification, Reset} from './controller';
import {
  GoogleCallback,
  ProfileCallback,
  Upload,
  Remove,
  SentNotification,
  //Recaptcha,
} from 'nuudel-main';
import fastifyMultipart from '@fastify/multipart';
import fastifyCompress from '@fastify/compress';
import cookie, {FastifyCookieOptions} from '@fastify/cookie';
import {SubscriptionServer} from 'subscriptions-transport-ws';
import {execute, subscribe} from 'graphql';
import {setTranslate} from 'nuudel-main';
import {t} from './loc/I18n';

setTranslate(t);

const {
  PORT,
  JWT_SECRET,
  FB_CLIENT_ID,
  FB_CLIENT_SECRET,
  APPLE_CLIENT_ID,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  WEB = '',
  NODE_ENV,
  COOKIE_SECRET,
  DOMAIN,
} = process?.env;
const tokenName = 'token'; // 'USER_TOKEN'

const _corsOptions: FastifyCorsOptions = {
  // This is NOT recommended for production as it enables reflection exploits
  //origin: new RegExp(`^(https?:\/\/(?:[^\.]+\.){0,255}?${DOMAIN}(?:\:\d{1,5})?)$`), // or '*' or true
  origin:
    NODE_ENV !== 'development'
      ? /^https?:\/\/(?:[^\.]+\.){0,255}?mart\.mn(?:\:\d{1,5})?\/?$/
      : /^https?:\/\/localhost(?:\:\d{1,5})?$/,
  allowedHeaders: [
    'Deviceuniqid',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'Accept',
    'Content-Type',
    'Content-Length',
    'Authorization',
    'Origin',
    'Host',
    'X-Requested-With',
    'X-Auth-Token',
    'X-Args',
    'User-Agent',
    'Allow',
    'Pragma',
    'Cache-Control',
    'Expires',
    'Referer',
  ],
  //exposedHeaders: 'X-Content-Range',
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'OPTIONS', 'POST', 'DELETE', 'PATCH'],
};

const app: FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse,
  FastifyBaseLogger
> = Fastify({
  logger: true,
  //disableRequestLogging: true,
  pluginTimeout: 90000,
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
        {schema, execute, subscribe},
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

      const server: ApolloServer<any | BaseContext> =
        new ApolloServer<IContext>({
          schema,
          introspection: true,
          csrfPrevention: process.env.NODE_ENV !== 'development',
          ...{cors: _corsOptions},
          cache: 'bounded',
          plugins: [
            //fastifyApolloDrainPlugin(app),
            process.env.NODE_ENV !== 'development'
              ? ApolloServerPluginLandingPageProductionDefault({
                  //graphRef: 'my-graph-id@my-graph-variant',
                  footer: false,
                })
              : ApolloServerPluginLandingPageLocalDefault({footer: false}),
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

      const myContextFunction: ApolloFastifyContextFunction<IContext> = async (
        request,
        reply,
      ) => makeContext(app, {request, reply});

      app.register(fastifyApollo(server), {
        path: '/api/graphql',
        context: myContextFunction,
      }); // app.post(  '/api/graphql',  fastifyApolloHandler(server, {context: myContextFunction}), );

      //*
      app.register(fastifyMultipart, {
        //attachFieldsToBody: false,
        sharedSchemaId: 'MultipartFileType',
        //onFile: async part => { await pump(part.file, fs.createWriteStream(part.filename)) },
        limits: {
          fieldNameSize: 219, // Max field name size in bytes
          fieldSize: 20000, // Max field value size in bytes
          fields: 20, // Max number of non-file fields
          fileSize: 1500000, // 1.5Mb the max file size
          files: 1, // Max number of file fields
          //headerPairs: 2000   // Max number of header key=>value pairs
          //parts: 1000         // For multipart forms, the max number of parts (fields + files)
        },
      }); // */

      app.register(fastifyCompress, {
        global: false,
        threshold: 512,
        //inflateIfDeflated: true,
        encodings: ['gzip', 'deflate', 'br'],
      });

      // dev mode only graphql backend
      if (process.env?.NODE_ENV !== 'development') {
        app
          .register(FastifyNext, {
            //underPressure: { exposeStatusRoute: true },
            //dev: true,
          })
          .after(() => {
            app.next('*');
          });
      }

      app.register(oauth2, {
        name: 'facebookOAuth2',
        scope: ['public_profile', 'email'], //'user_birthday'
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
      /*
      app.register(oauth2, {
        name: 'appleOAuth2',
        scope: ['email name'],
        credentials: {
          client: {
            id: APPLE_CLIENT_ID,
            // See https://github.com/Techofficer/node-apple-signin/blob/master/source/index.js
            // for how to create the secret.
            secret: apple.getClientSecret(),
          },
          auth: oauthPlugin.APPLE_CONFIGURATION,
        },
        startRedirectPath: '/login/apple',
        callbackUri: `${WEB}/login/apple/callback`,
      }); // */

      app.register(oauth2, {
        name: 'googleOAuth2',
        scope: [
          'profile', //'https://www.googleapis.com/auth/userinfo.profile',
          'email', //'https://www.googleapis.com/auth/userinfo.email',
        ],
        credentials: {
          client: {
            id: GOOGLE_CLIENT_ID,
            secret: GOOGLE_CLIENT_SECRET,
          },
          auth: oauthPlugin.GOOGLE_CONFIGURATION,
        },
        startRedirectPath: '/login/google',
        callbackUri: `${WEB}/login/google/callback`,
        //callbackUriParams: { access_type: 'online' }, // offline
      });

      /*
      app.register(oauth2, {
        name: 'facebookOAuth2',
        scope: ['public_profile', 'email'], //'user_birthday'
        credentials: {
          client: {
            id: FB_CLIENT_ID,
            secret: FB_CLIENT_SECRET,
          },
          auth: oauthPlugin.FACEBOOK_CONFIGURATION,
        },
        startRedirectPath: '/login/facebook',
        callbackUri: `${WEB}/login/facebook/callback`,
      });// */

      /*
      app.register(oauth2, {
        name: 'googleOAuth2',
        scope: [
          'profile', //'https://www.googleapis.com/auth/userinfo.profile',
          'email', //'https://www.googleapis.com/auth/userinfo.email',
        ],
        credentials: {
          client: {
            id: GOOGLE_CLIENT_ID,
            secret: GOOGLE_CLIENT_SECRET,
          },
          auth: oauthPlugin.GOOGLE_CONFIGURATION,
        },
        startRedirectPath: '/login/google',
        callbackUri: `${WEB}/login/google/callback`,
        //callbackUriParams: { access_type: 'online' }, // offline
      });// */

      //*
      app.register(fastifyCors, instance => {
        return (req, callback) => {
          let corsOptions = {..._corsOptions}; //console.log('origin===', req.raw?.url, req.headers.origin);
          // do not include CORS headers for requests
          if (
            /^\/provider(\/|\?)?[^\/]*$/i.test(req.raw?.url) &&
            !new RegExp(`^(https?:\/\/)?(www.)?${DOMAIN}$`, 'i').test(
              (req.headers?.origin as string) || 'localhost',
            )
          ) {
            //corsOptions.origin = true;
            //callback(new Error('Not allowed'), corsOptions);
            //return;
          }
          // callback expects two parameters: error and options
          callback(null, corsOptions);
        };
      }); // */

      app.register(cookie, {
        secret: COOKIE_SECRET, // for cookies signature
        parseOptions: {}, // options for parsing cookies
      } as FastifyCookieOptions);

      await app.listen({
        port: parseInt(PORT, 10),
        host: HOST,
      });
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  });
};

app.register(jwt, {
  secret: JWT_SECRET,
  credentialsRequired: true,
} as FastifyJWTOptions);

app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

//app.post('/recaptcha', Recaptcha);
app.post('/upload', {preValidation: [(app as any).authenticate]}, Upload);
app.post('/remove', {preValidation: [(app as any).authenticate]}, Remove);
app.post(
  '/sent',
  {preValidation: [(app as any).authenticate]},
  SentNotification,
);
app.get('/verification', Verification);
app.get('/reset', Reset);
//app.get('/login/facebook/callback', ProfileCallback);
//app.get('/login/google/callback', GoogleCallback);

app.register(fastifyCron, {
  jobs: [
    {
      name: 'getRates',
      // Only these two properties are required,
      // the rest is from the node-cron API:
      // https://github.com/kelektiv/node-cron#api
      cronTime: '0 */60 9-19 * * *', // Every hour between 9-19:

      // Note: the callbacks (onTick & onComplete) take the server
      // as an argument, as opposed to nothing in the node-cron API:
      onTick: async () => {
        await defaultJob();
      },
      onComplete: undefined,
      start: true,
      timeZone: 'Asia/Ulaanbaatar',
    },
  ],
});

app.addHook('onRequest', async (request, reply) => {
  if (request.cookies) {
    const result = reply.unsignCookie(request.cookies[tokenName]);
    if (result.valid && result.renew) {
      reply.setCookie(tokenName, result.value, {
        domain: !!DOMAIN && DOMAIN !== 'localhost' ? '.' + DOMAIN : '*',
        path: '/',
        httpOnly: true,
        secure: true,
        signed: false,
        sameSite: true,
      });
    } else {
      reply.clearCookie(tokenName, {path: '/'});
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
