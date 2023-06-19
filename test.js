const fs = require("fs");

const headers = ["Name", "Age", "Email"];
const rows = [
  ["John Doe", "25", "johndoe@example.com"],
  ["Jane Smith", "30", "janesmith@example.com"],
  ["Bob Johnson", "35", "bobjohnson@example.com"],
];

// Prepare the CSV data
let csvContent = headers.join(",") + "\n";
rows.forEach((row) => {
  csvContent += row.join(",") + "\n";
});

// Write the CSV data to a file
fs.writeFile("./backend/db/data.csv", csvContent, "utf8", (err) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log("CSV file has been written successfully.");
});
