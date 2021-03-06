// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================
const bcrypt = require("bcrypt");
// Grabbing our models

const db = require("../models");

const rug = require("random-username-generator");
const passGen = require("generate-password");


// twilio email api setup
const sgMail = require('@sendgrid/mail');
require('dotenv').config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Routes
// =============================================================
module.exports = function (app) {
  // GET route for getting all of the collaborators
  app.get("/api/collabs", function (req, res) {
    console.log(typeof db.event);
    db.collab.findAll({}).then((dbCollab) => {
      res.json(dbCollab);
      // res.json(dbEvent);
    });
  });

  //GET route for getting all of the events for 1 collab
  app.get("/api/collabs/:id/events", function (req, res) {
    db.collab
      .findOne({
        where: {
          id: req.params.id,
        },
      })
      .then(async (dbCollab) => {
        if (!dbCollab) {
          return res.json(null);
        }
        const events = await dbCollab.getEvents();
        res.json(events);
      });
  });

  app.post("/signup", (req, res) => {
    db.collab
      .create({
        username: req.body.username,
        password: req.body.password,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        phone: req.body.phone,
        // costId: req.body.costId,
        // taskId: req.body.taskId,
        // eventId: req.body.eventId
      })
      .then(function (dbCollab) {
        res.status(200).json(dbCollab);
      });
  });

  app.post("/login", (req, res) => {

    // console.log(req.body.password);
    db.collab
      .findOne({
        where: {
          username: req.body.username 
        }
      })
      .then((dbCollab) => {
        if (dbCollab.username === null) {
          console.log("could not find user");
          res.status(404).end();
        }
        if (bcrypt.compareSync(req.body.password, dbCollab.password)) {
          req.session.username = dbCollab;
          console.log("success");
          // res.redirect('/view-events');
          res.redirect("/view-events");
          res.status(200).end();
        } else {
          console.log("unsuccess");
          res.redirect("/login-fail");
          res.status(404).end();
          // res.redirect('/');
        }
      });
  })

  // creates a new user
  app.post("/signup", (req, res) => {
    db.collab
      .create({
        username: req.body.username,
        password: req.body.password,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        phone: req.body.phone,
        // costId: req.body.costId,
        // taskId: req.body.taskId,
        // eventId: req.body.eventId
      })
      .then(function (dbCollab) {
        res.status(200).json(dbCollab);
      });
  });

  // updates user account info except the email
  app.put("/signup", (req, res) => {
    db.collab
      .update(
        {
          username: req.body.username,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          password: req.body.password,
          phone: req.body.phone,
          email: req.session.username.email,
        },
        {
          where: {
            id: req.session.username.id,
          }
        }
      )
      .then((dbCollab) => res.json(dbCollab));
  });

  app.post("/login", (req, res) => {
    console.log("start of login route");
    console.log(req.body);
    console.log(req.body.username);
    // console.log(req.body.password);
    db.collab
      .findOne({
        where: {
          username: req.body.username,
        },
      })
      .then((dbCollab) => {
        if (dbCollab.username === null) {
          console.log("could not find user");
        }
        if (bcrypt.compareSync(req.body.password, dbCollab.password)) {
          req.session.username = dbCollab;
          console.log("success");
          // res.redirect('/view-events');
          res.redirect("/view-events");
        } else {
          console.log("unsuccess");
          res.redirect("/login-fail");
          // res.redirect('/');
        }
      });
  });

  //enable session storage
  app.get("/readsessions", (req, res) => {
    res.json(req.session);
  });

  // Logout route for user info
  app.delete("/logout", (req, res) => {
    req.session.destroy(function (err) {
      if (err) throw err;
      res.send("successful logout");
    });
  });

  //enable session storage
  app.get("/readsessions", (req, res) => {
    res.json(req.session);
  });

  // Logout route for user info
  app.delete("/logout", (req, res) => {
    req.session.destroy(function (err) {
      if (err) throw err;
      res.render("successful logout");
    });
  });

  // add collab form submit route - add random info
  app.post("/add-collab", (req, res) => {
    console.log("api route log");
    const tempPass = passGen.generate({ length: 10 });
    const tempUsername = rug.generate();

    db.collab
      .create({
        username: tempUsername,
        password: tempPass,
        first_name: req.body.new_name,
        last_name: "Update User Info!",
        email: req.body.email,
        // eventId: req.body.eventId
      })
      .then(function (dbCollab) {
        dbCollab.addEvent(req.body.eventId)
        console.log("after collab creation")
        // HERE IS WHERE THE EMAIL CLIENT WOULD PROBABLY DO ITS THING

        // using Twilio SendGrid's v3 Node.js Library
const msg = {
  to: req.body.email,
  from: 'togatherinvite@gmail.com',
  subject: 'Sending with Twilio SendGrid is Fun',
  text:  "test test test", //`hello! Here is your temporary login info!\nUsername: ${tempUsername}\nPassword: ${tempPass}`,
  html: `<H2>You've been invited To-Gather!</h2>
  <br><p>You're receiving this email because your assistance has been requested to help plan an event using To-Gather!</p>
  <br><strong>Hello!</strong> Here is your temporary login info!
  <br><strong>Username:</strong> ${tempUsername}
  <br><strong>Password:</strong> ${tempPass}
  <br><p>Follow the link below and login using your new login credentials.  Once you login you can edit your username and password by clicking on 'Update Account' on the nav-bar pull down menu.</p>
  <br>
  <br><a href="https://awesome-group-planner.herokuapp.com/">https://awesome-group-planner.herokuapp.com/</a>
  <h3>We hope you enjoy using To-Gather!</h3>
  <br><p>- ToGather Team</p>` //'<strong>and easy to do anywhere, even with Node.js</strong>',
};
sgMail.send(msg);


      });
  });
};
