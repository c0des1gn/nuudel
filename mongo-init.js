db = db.getSiblingDB('dev_db');

db.createUser({
  user: 'dev_user',
  pwd: 'Admin123',
  roles: [
    {
      role: 'readWrite',
      db: 'dev_db',
    },
  ],
});

db.createCollection('users');
db.users.insertMany([
  {
    firstname: 'admin',
    lastname: '',
    username: 'admin',
    password: '$2a$10$yl.UREsV.EWEOthiKuuIQeGVRX6DkodrDYpux9IF2tGTor5dEh7WK',
    phone: '',
    mobile: '',
    email: '',
    type: 'Admin',
    _status: 'Active',
  },
]);

db.createCollection('configs');
db.configs.insertMany([
  {
    active: true,
    minVersion: '1.0.0',
    base_url: 'http://localhost:8080',
    site_title: 'Nuudel',
    site_description: '',
    site_keywords: [],
    posts_per_page: 10,
    logo: {
      uri: 'https://i.ibb.co/82yfWM4/nuudel.png',
      width: 298,
      height: 298,
    },
    phone: '',
    location: '',
    web: '',
    color: '#f58c22',
  },
]);

db.createCollection('counters');
db.counters.insertMany([
  {
    listname: 'Category',
    sequence: 0,
  },
]);
