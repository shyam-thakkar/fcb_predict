const bcrypt = require("bcryptjs");

const password = "Shyam@FCBAhmedabad#26!";
const hash = "$2b$12$tcqct8bdXmbi47SrCj.BkOH9xBg8cr2SjMBdKZBvgJ4BYhNElylzq";

bcrypt.compare(password, hash).then((result) => {
  console.log(result);
});