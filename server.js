require("dotenv").config();
const app = require("./src/app");

const port = process.env.PORT || 3000;
app.set("port", port);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
