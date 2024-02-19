import Mailgen from 'mailgen';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {getModelForClass} from '@typegoose/typegoose';
import {Verify} from '../service/lists/verify.resolver';
import {t} from '../loc/I18n';
const {DOMAIN, WEB} = process?.env;

const host = 'https://' + DOMAIN;
const model = getModelForClass(Verify);

// Configure mailgen by setting a theme and your product info
const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    // Appears in header & footer of e-mails
    name: 'No reply',
    link: host,
    // Optional logo
    logo: `${WEB}/favicon.png`,
  },
});

// Prepare email contents
export const reset = function (name: string, email: string, userId: string) {
  const code = bcrypt.encodeBase64(crypto.pseudoRandomBytes(32), 32);
  const Form = new model({
    userId: userId,
    mail: email,
    code: code,
    expire: new Date(new Date().getTime() + 86400000).toISOString(),
  });
  const saved = Form.save();
  return {
    body: {
      name: name,
      greeting: t('Dear'),
      intro: t('intro reset'),
      action: {
        instructions: t('reset your password'),
        button: {
          color: '#2777f7',
          text: t('Reset your password'),
          link: `${host}/reset?code=${code}`,
        },
      },
      signature: t('Sincerely'),
      outro: t('outro reset'),
    },
  };
};

export const info = function (name: string, intro: string, outro: string) {
  return {
    body: {
      name: name,
      intro: intro,
      outro: outro,
    },
  };
};

// Prepare email contents
export const verify = function (
  name: string,
  email: string,
  userId: string = '',
) {
  const code = bcrypt.encodeBase64(crypto.pseudoRandomBytes(32), 32);
  const Form = new model({
    userId: userId,
    mail: email,
    code: code,
    expire: new Date(new Date().getTime() + 86400000).toISOString(),
  });
  const saved = Form.save();
  return {
    body: {
      name: name,
      greeting: t('Dear'),
      intro: t('intro verify'),
      action: {
        instructions: t('instructions verify'),
        button: {
          color: '#2777f7',
          text: t('Verify email'),
          link: `${host}/verification?code=${code}&email=${email}`,
        },
      },
      signature: t('Sincerely'),
      outro: t('outro verify'),
    },
  };
};

export const receipt = function (name: string, data: any) {
  const address: any = data.address;
  return {
    body: {
      title: t('Invoice number') + data.invoice,
      signature: false,
      intro: [
        t('Order Placed') + new Date().toISOString().substring(0, 10),
        t('Shipping Address') + getAddress(address),
        t('Order Total') + data.amount,
      ],
      table: {
        //title: 'Invoice',
        data: data.products,
        columns: {
          // Optionally, customize the column widths
          customWidth: {
            title: '65%',
            qty: '10%',
            amount: '25%',
          },
          // Optionally, change column text alignment
          customAlignment: {
            qty: 'right',
            amount: 'right',
          },
        },
      },
      action: {
        instructions: t('instructions receipt'),
        button: {
          color: '#2777f7',
          text: t('invoice button'),
          link: `${host}/`,
        },
      },
      outro: t('outro receipt'),
    },
  };
};

const getAddress = (address: any) => {
  return [
    address.address,
    address.address2,
    address.street,
    address.district,
    address.city,
    address.country,
  ]
    .filter(function (e) {
      return e;
    })
    .join(', ');
};

export const Message = function (toMail, title, template) {
  // Message object
  const message = {
    // Comma separated list of recipients
    to: toMail,

    // Subject of the message
    subject: title,

    // plaintext body
    text: mailGenerator.generatePlaintext(template),

    // HTML body
    html: mailGenerator.generate(template),

    list: {},
  };
  return message;
};
