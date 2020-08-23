import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';


import mongoose from 'mongoose';

import { MongoClient } from 'mongodb';
import { AccountsServer, ServerHooks, AccountsJsError } from '@accounts/server';
import { AccountsPassword, CreateUserErrors } from '@accounts/password';

import accountsExpress, { userLoader } from '@accounts/rest-express';
import { Mongo, MongoDBInterface } from '@accounts/mongo';

import { get, pick } from 'lodash';
import { Random } from 'meteor/random';
import { Meteor } from 'meteor/meteor';

console.log('Initializing AccountsServer.')
console.log('MONGO_URL: ' + process.env.MONGO_URL);

Meteor.startup(async function(){
  // If you are using mongodb 3.x
  // const client = await mongodb.MongoClient.connect(process.env.MONGO_URL);
  // const db = client.db('meteor');

  // mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/meteor', {
  mongoose.connect(process.env.MONGO_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });

  const db = mongoose.connection;
  const accountsMongo = new Mongo(db, {
    // options
  });




  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());

  // interface UserDoc extends mongoose.Document {
  //   givenName: string;
  //   familyName: string;
  // }

  const User = mongoose.model(
    'User',
    new mongoose.Schema({ 
      givenName: String, 
      familyName: String 
    })
  );

  const accountsPassword = new AccountsPassword({
    // This option is called when a new user create an account
    // Inside we can apply our logic to validate the user fields
    validateNewUser: function(user){
      console.log("AccountsServer: Validating new user.")
      // For example we can allow only some kind of emails
      if (user.email.endsWith('.xyz')) {
        console.error('Invalid email.');
        throw new Error('Invalid email.');
      }

      if (!user.givenName) {
        throw new Error('First name is required');
      }
      if (user.givenName.length < 3) {
        throw new Error('First name too short');
      }

      if(get(Meteor, 'settings.private.invitationCode')){
        if (!user.invitationCode) {
          console.error('Must provide an invitation code');
          throw new Error('Must provide an invitation code');
        }  

        if (user.invitationCode !== get(Meteor, 'settings.private.invitationCode')) {
          console.error('Invalid invitation code.');
          throw new Error('Invalid invitation code.');
        }  
      }
      
      console.log('New User: ', user);
      return pick(user, ['username', 'email', 'password', 'familyName', 'givenName']);
    }
  });

  const accountsServer = new AccountsServer(
    {
      db: accountsMongo,
      tokenSecret: Random.secret(),
    },
    {
      password: accountsPassword
    }
  );

  accountsServer.on(ServerHooks.ValidateLogin, function(userLoginRequest){
    // This hook is called every time a user try to login.
    // You can use it to only allow users with verified email to login.
    // If you throw an error here it will be returned to the client.
    console.log('AccountsServer: ServerHooks.ValidateLogin()')
    console.log('AccountsServer: ValidateLogin.userLoginRequest', userLoginRequest)

    return userLoginRequest;
  });

  /**
   * Load and expose the accounts-js middleware
   */
  app.use(accountsExpress(accountsServer));

  /**
   * Return the current logged in user
   */
  app.get('/user', userLoader(accountsServer), function(req, res){
    console.log('AccountsServer: GET /user', req);

    res.json({ user: get(req, 'user', null) });
  });

  /**
   * Expose a public route to edit user informations
   * - route is protected
   * - update the current logged in user in the db
   */
  app.put('/user', userLoader(accountsServer), async function (req, res){
    console.log('AccountsServer: PUT /user', req);

    const userId = get(req, 'userId', null);

    if (!userId) {
      res.status(401);
      res.json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).exec();

    user.givenName = req.body.givenName;
    user.familyName = req.body.familyName;

    await user.save();
    res.json(true);
  });

  // app.post('/accounts/password/register', userLoader(accountsServer), async function (req, res){
  //   let body = get(req, 'body');
  //   console.log('body', 'body')
  //   res.json(true);
  // });

  // app.post('/accounts/password/register', userLoader(accountsServer), async function (req, res){
  //   let body = get(req, 'body', false);

  //   if(body){
  //     console.log('AccountsServer: POST /user/password/register', body);

  //     // const userId = get(req, 'userId', null);

  //     // if (!userId) {
  //     //   res.status(401);
  //     //   res.json({ message: 'Unauthorized' });
  //     //   return;
  //     // }

  //     // const user = await User.findById(userId).exec();

  //     // user.givenName = req.body.givenName;
  //     // user.familyName = req.body.familyName;

  //     // await user.save();

  //   } else {
  //     console.log('AccountsServer: POST received, but no body in message.');
  //   }

  //   res.json(true);
  // });

  app.listen(4000, function(){
    console.log('AccountsServer: listening on port 4000');
  });

})


