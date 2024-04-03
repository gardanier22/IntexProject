
const express = require('express');
const session = require('express-session');
// const cookieParser = require("cookie-parser");
const app = express();
const http = require('http');
// const cookieParser = require('cookie-parser')


app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
// app.use(cookieParser());
app.use(express.static(__dirname+'/content'))

app.use(session({
  secret: 'your_secret_key', // Replace 'your_secret_key' with a secret string for session encryption
  resave: false,
  saveUninitialized: true
}));
// connect to dns and http

// app.use((req, res, next) => {
//   if (!req.secure && req.get("x-forwarded-proto") !== "https") {
//     return res.redirect("https://" + req.get("host") + req.url);
//     }
//   next();
// });


// connect to database

const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.RDS_HOSTNAME || process.env.LOCAL_HOST || 'awseb-e-abg2d2xpxr-stack-awsebrdsdatabase-q4jot338m3ar.c772k4j1flwa.us-east-2.rds.amazonaws.com',
    user: process.env.RDS_USERNAME || process.env.LOCAL_USER || 'root',
    password: process.env.RDS_PASSWORD || process.env.LOCAL_PASSWORD || 'rootuser123',
    database: process.env.RDS_DB_NAME || process.env.LOCAL_DB_NAME || process.env.LOCAL_DB_NAME || 'ebdb',
    port: process.env.RDS_PORT || process.env.LOCAL_PORT || 5432,
    ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
  },
});

const port = process.env.PORT || 4000;

//  an example like in skill4 
app.get('/', (req, res) => {
    res.render('index' ); // Assuming your index.ejs is in the 'views' folder
  });







// login page works for super user and normal user


app.post('/login', (req, res) => {
  console.log("button pressed");
  console.log("username: " + req.body.username);
  console.log("password: " + req.body.password);

  const username = req.body.username;
  const password = req.body.password;

  knex.select().from('admin_users')
    .where({ username: username, password: password })
    .first()
    .then(user => {
      console.log("its working")
      if (user) {
        req.session.username = username;
        if (user.super_user === 'true') 
        {
          // User authenticated and is a super user, render the register page
          console.log("Superuser found in database");
          res.render('register');
        } 
        else 
        {
          // User authenticated but not a super user, render the dashboard
          console.log("Regular user found in database");
          console.log("session: " + req.session.username);
          res.render('normaluser')
          // knex.select().from('Participants')
          //   .then(Participants => {
          //     res.render('search', { Participants: Participants });
            // });
        }
      } 
      else 
      {
        // Credentials don't match or user not found, redirect to login or landing page
        console.log("Credentials not found in database");
        res.render('index');
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error fetching user data');
    });
});

  // getting data from register page and inserting it on database

  // ... (other code remains the same)

// POST route to handle registration
app.post('/register', (req, res) => {
  const { name, email, username, password, password2 } = req.body;

  // Basic validation (you might want more complex validation)
  if (!name || !email || !username || !password || !password2) {
    return res.status(400).send('Please fill in all fields');
  }

  if (password !== password2) {
    return res.status(400).send('Passwords do not match');
  }

  // Insert the user into the 'admin_users' table with 'super_user' set to false
  knex('admin_users')
    .insert({
      name: name,
      email: email,
      username: username,
      password: password,
      super_user: false, // Set super_user to false by default
      // Other columns as needed
    })
    .then(() => {
      // Registration successful, redirect to login or dashboard
      res.redirect('/login');
    })
//     .catch(error => {
//       console.error(error);
//       res.status(500).send('Error registering user');
//     });
});





app.get('/usermanagement', (req, res) => {

  let username = req.session.username;
  console.log("username in usermanagement: " + username);


  knex.select().from('admin_users')
  .where({username: username})
  .first()
  .then(user => {
      console.log("its working again1"); 
      if (user) {
        console.log(user.name);
        res.render("usermanagement", {user: user});
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error fetching user data in usermanagement');
    });
});




app.get('/edit', (req, res) => {

  let username = req.session.username;
  console.log("username in usermanagement: " + username);


  knex.select().from('admin_users')
  .where({username: username})
  .first()
  .then(user => {
      console.log("its working again1"); 
      if (user) {
        console.log(user.name);
        res.render("edit", {user: user});
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error fetching user data in usermanagement');
    });
});





app.post('/edit', (req, res) => {

  let username = req.session.username;
  console.log("username in usermanagement: " + username);


  knex.select().from('admin_users')
  .where({username: username})
  .update({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        })
  .then(user => {
      console.log("its working again1"); 
      if (user) {
        console.log(user.name);
        res.render("edit", {user: user});
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error fetching user data in usermanagement');
    });
});


app.get('/delete', (req, res) => {
  res.render('delete'); // Renders the delete.ejs file
});

// DELETE FUNCTIONALITY
app.post('/delete', (req, res) => {

  let username = req.session.username;
  console.log("username in usermanagement: " + username);


  knex.select().from('admin_users')
  .where({username: username})
  .del({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        })
  .then(user => {
      console.log("its working again1"); 
      if (user) {
        console.log(user.name);
        res.render("login", {user: user});
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error fetching user data in usermanagement');
    });
});




  app.get('/login', (req, res) => {
    res.render('login');
  });



  app.get('/register', (req, res) => {
    res.render('register'); 
  });

  app.get('/dashboard', (req, res) => {
    res.render('dashboard'); 
  
  });

  app.get('/survey', (req, res) => {
    res.render('survey'); 
  });
  

  const PROVO = 'Provo'; // Define PROVO as a constant representing the city name

  app.post('/survey', async (req, res) => {
    const provohardcoded = PROVO
    const [participant_id] = await knex('Participants')
    .returning('participant_id')
    .insert({
      
      age: req.body.age,
      relationship_status: req.body.relationship_status,
      occupation_status: req.body.occupation_status,
      origin: provohardcoded,
      timestamp: knex.raw('CURRENT_TIMESTAMP'),
      avg_media_time_day: req.body.avg_media_time_day,
      uses_social_media: req.body.uses_social_media,
      mindless_media_freq: req.body.mindless_media_freq,
      distracted_by_media_while_busy: req.body.distracted_by_media_while_busy,
      restlesss_without_media: req.body.restlesss_without_media,
      distractibility: req.body.distractibility,
      bothered_by_worries: req.body.bothered_by_worries,
      difficulty_concentrating: req.body.difficulty_concentrating,
      personal_comparison_media: req.body.personal_comparison_media,
      feelings_about_comparisons: req.body.feelings_about_comparisons,
      seek_validation_media: req.body.seek_validation_media,
      frequency_depressed: req.body.frequency_depressed,
      interest_fluctuation_activities: req.body.interest_fluctuation_activities,
      sleep_issues: req.body.sleep_issues,
      gender: req.body.gender
    });
    
    //redirect to the home page after submission
    res.redirect("/dashboard");

    //gather Organization types in an array
    const checkboxAffiliations = [];

    //loop through options on array values
    for (let iCount = 1; iCount <= 6; iCount++)
    {
      const name = `aff${iCount}`;
      if (req.body[name])
      {
        checkboxAffiliations.push(req.body[name]);
      };
    };
    await Promise.all(checkboxAffiliations.map(async (affiliation_id) => {
      await knex('Affiliation_Responses').insert({
        participant_id: participant_id.participant_id,
        affiliation_id: affiliation_id
      });
    }));


    //gather social media types in an array
    const checkboxPlatforms = [];
    //loop through options on array values
    for (let iCount = 1; iCount <= 9; iCount++)
    {
      const name = `plat${iCount}`;
      if (req.body[name])
      {
        checkboxPlatforms.push(req.body[name]);
      };
    };
    await Promise.all(checkboxPlatforms.map(async (platform_id) => {
      await knex('Platform_Responses').insert({
        participant_id: participant_id.participant_id,
        platform_id: platform_id
      });
    }));
  });







  // seaarch in records: 




  app.get('/search', (req, res) => {
    knex.select().from('Participants')
      .then(Participants => {
        res.render('search', { Participants: Participants });
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('Error fetching data from the database');
      });
  });
  

  app.get("/searchresponse", (req, res) => {
    const cat = req.query.category;
    const val = req.query.value;
    let limit = req.query.limit;
    limit = parseInt(limit);
    
    let query;
    if (cat == "participant_id" || cat == "age") {
      query = knex
        .select()
        .from("Participants")
        .where(cat, val)
        .limit(limit);
    } else {
      query = knex
        .select()
        .from("Participants")
        .where(cat, "like", `%${val}%`)
        .limit(limit);
    }
  
    query
      .then((Participants) => {
        // Always pass Participants, even if empty, to ensure it's defined
        res.render("search", { Participants: Participants });
      })
      .catch((error) => {
        console.error("Error querying database:", error);
        res.status(500).send("Internal Server Error");
      });
  });
  
        














app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});


