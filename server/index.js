const express = require("express");
const morgan = require('morgan');
const secp = require("ethereum-cryptography/secp256k1");
const {keccak256} = require("ethereum-cryptography/keccak")
const { toHex,utf8ToBytes } = require("ethereum-cryptography/utils");




const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
const balances = {
  "04363a810ea98078821e4f73b4c588afe5f7c39ca3d58c39e05e9680f205f11bd8493809cdbc56ed242187d6af448669733692481004db1fb8c3ecb57e07c40e2e": 100,
  "0444110572180e9998d3e492bd2b6dfd8c267a9716958f9cce64693b483b64e4b2ed465a115053d277f5ec5d3335d3060a17e3834e1e009f4153d90f2b84c93751": 50,
  "0453aa56fe82497bc87ebbbf3a13ecca3c2f36b2d5d736298bea826db25165e35bfad01f14e193eec64c8aa60089b374f706a91a6b3f65d07b3b71f28228969843": 75,
};

const keys = 
app.get("/", (req, res) => {
  res.send("Welcome to the Simple Balance Server!");
});

app.get("/balance/:publicKey", (req, res) => {
  const { publicKey } = req.params;
 
  const balance = balances[publicKey] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount,signature ,recoveryBit} = req.body;
  setInitialBalance(sender);
  setInitialBalance(recipient);
  const message = JSON.stringify({sender,amount,recipient})
  const hashMsg = keccak256(utf8ToBytes(message))

  

  if (balances[sender] < amount || secp.verify(signature,hashMsg,sender)) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
