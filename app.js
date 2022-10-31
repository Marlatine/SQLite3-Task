const sqlite3 = require("sqlite3");
const morgan = require("morgan");
const express = require("express");
const bodyParser = require("body-parser");

const db = new sqlite3.Database(__dirname + "/database.sqlite");
const app = express();

// Ignore this line, just a reminder for myself on how i can style the page
app.use(express.static(__dirname + "/public"));

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 8080;
const hostname = "localhost";

const CREATE_PETS =
  "CREATE TABLE if not exists pets (petID INTEGER PRIMARY KEY AUTOINCREMENT, petname TEXT, petage INT, ownername TEXT, species TEXT);";
const DROP_PETS = "DROP TABLE if exists pets;";

app.get("/", (req, res) => {
  res.send("Hello! Go to /create to create a pet table!");
});

app.get("/create", (req, res) => {
  db.serialize(() => {
    db.run(CREATE_PETS);
    db.each(
      "INSERT INTO pets (petname, petage, ownername, species) VALUES ('Koda',  '1', 'Martine og Nikolay', 'Hund');"
    );
    db.run(
      "INSERT INTO pets (petname, petage, ownername, species) VALUES ('Fie',  '8', 'Heidi', 'Hest');"
    );
    db.run(
      "INSERT INTO pets (petname, petage, ownername, species) VALUES ('Fluffy',  '10', 'Andreas', 'Katt');"
    );
    res.send(
      "Pet table is now created! Go to /newpet to create a new pet to the table! If you want to drop the table, go to /drop."
    );
  });
});

// Drop table
app.get("/drop", (req, res) => {
  db.run(DROP_PETS);
  res.send("Pets table droped");
});

// Get all data from table
app.get("/show", (req, res) => {
  let data = [];
  db.serialize(() => {
    db.each(
      "SELECT * FROM pets;",
      (err, row) => {
        if (err) {
          res
            .status(404)
            .json({ Error: "An error occured while loading the table" });
        }
        console.log(row.petname);
        data.push(row);
      },
      () => {
        res.send(data);
      }
    );
  });
});

// Create new pet to table
app.post("/pet", (req, res) => {
  console.log(req.body);

  let petname = req.body.petname;
  let petage = req.body.petage;
  let ownername = req.body.ownername;
  let species = req.body.species;

  db.run(
    "INSERT INTO pets (petname, petage, ownername, species) VALUES ('" +
      petname +
      "', '" +
      petage +
      "', '" +
      ownername +
      "', '" +
      species +
      "' )"
  );
  res.send(
    "The new pet has been saved to the table! Go to /show to see the entire pet table."
  );
});

// Get pet by ID
app.get("/pet/:id", (req, res) => {
  let id = req.params.id;
  let data = [];
  db.serialize(() => {
    db.each(
      "SELECT * from pets WHERE petID='" + id + "';",
      (err, row) => {
        if (err) {
          return res
            .status(404)
            .json({ Error: "There is no pet with that ID" });
        }
        console.log(row.petname);
        data.push(row);
      },
      () => {
        res.send(data);
      }
    );
  });
});

// UPDATE pets Table
app.put("/update", (req, res) => {
  db.serialize(() => {
    db.run(
      "UPDATE pets SET petage = ?, ownername = ?, species = ? WHERE petname = ?",
      [req.body.petage, req.body.ownername, req.body.species, req.body.petname],
      (err) => {
        if (err) {
          return res.status(404).json({ ERROR: "Could not update pet" });
        }
      },
      () => {
        res.send("Saved!");
      }
    );
  });
});

// Delete pet by ID from table
app.delete("/pet/:id", (req, res) => {
  let id = req.params.id;
  db.serialize(() => {
    db.run(
      "DELETE FROM pets WHERE petID='" + id + "';",
      (err) => {
        if (err) {
          return res.status(404).json({
            Error: "An error occured while loading",
          });
        }
      },
      () => {
        res.send(`Pet with ID: ${id} was successfully deleted`);
      }
    );
  });
});

app.listen(port, hostname, () => {
  console.log(`Server is running on: http://localhost:${port}`);
});
