import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));

app.use(express.static("public"));

app.get("/", (_req, res) => {
  res.sendFile(import.meta.dirname + "/views/index.html");
});

// Do not change code above this line
app.get("/api", (req, res) => {
  const currentDate = new Date();

  res.json({
    unix: currentDate.getTime(),
    utc: currentDate.toUTCString()
  });
});

app.get("/api/:date", (req, res) => {
  const dateInput = req.params.date;

  const date = /^\d+$/.test(dateInput)
    ? new Date(Number(dateInput))
    : new Date(dateInput);

  if (isNaN(date.getTime())) {
    return res.json({ error: "Invalid Date" });
  }

  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});
// Do not change code below this line

const PORT = 8000;
const listener = app.listen(PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
