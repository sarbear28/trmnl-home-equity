require("dotenv").config();
const express = require("express");

const app = express();

function monthsSince(startDate) {
  const start = new Date(startDate);
  const now = new Date();

  return (
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth())
  );
}

function estimateMortgageBalance() {
  const homeValue = Number(process.env.HOME_VALUE);
  const principal = Number(process.env.MORTGAGE_START_BALANCE);
  const annualRate = Number(process.env.ANNUAL_INTEREST_RATE) / 100;
  const monthlyPayment = Number(process.env.MONTHLY_PAYMENT);
  const startDate = process.env.MORTGAGE_START_DATE;

  const monthlyRate = annualRate / 12;
  const n = Math.max(0, monthsSince(startDate));

  let balance = principal;

  for (let i = 0; i < n; i++) {
    const interest = balance * monthlyRate;
    const principalPaid = monthlyPayment - interest;
    balance -= principalPaid;
  }

  const equity = homeValue - balance;
  const ownershipPercent = (equity / homeValue) * 100;
  const bankPercent = 100 - ownershipPercent;

  return {
    home_value: homeValue.toFixed(0),
    mortgage_balance: balance.toFixed(0),
    equity: equity.toFixed(0),
    ownership_percent: ownershipPercent.toFixed(2),
    bank_percent: bankPercent.toFixed(2),
    last_updated: new Date().toLocaleDateString("en-CA")
  };
}

app.get("/", (req, res) => {
  res.send("TRMNL Home Equity API is running.");
});

app.get("/trmnl", (req, res) => {
  res.json(estimateMortgageBalance());
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});