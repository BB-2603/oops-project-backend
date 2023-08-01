const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 8093;

app.use(cors());
app.use(express.json());
mongoose
  .connect(
    "mongodb+srv://bhavyabansal584:8QhPy6gFzO6XjKI1@cluster0.ezrc7ia.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("database connected successfully");
  })
  .catch((error) => {
    console.log(error);
  });

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: Number, required: true },
  address: { type: String, required: true },
  cart: { type: [String], required: true },
  loginStatus: { type: Boolean, required: true },
  admin: { type: Boolean, required: true },
  cartTotal: { type: Number, required: true },
  walletBalance: { type: Number, required: true },
  orderHistory: { type: [mongoose.Schema.Types.Mixed], required: true },
});

const items = mongoose.model("Item", itemSchema);
const users = mongoose.model("Users", userSchema);

//API requests for items
app.post("/api/Items", async (req, res) => {
  const data = req.body;

  try {
    const newItem = await items.find(data);
    return res.status(200).json(newItem);
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Error in getting the Item: ${error}` });
  }
});

app.get("/api/Items", async (req, res) => {
  try {
    const data = await items.find();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: `Encountered error: ${error}` });
  }
});

app.post("/api/addItems", async (req, res) => {
  const data = req.body;
  try {
    const newItem = new items(data);

    const retdata = await newItem.save();
    return res.status(201).json(newItem);
  } catch (error) {
    return res.status(500).json.apply({ error: "Error in adding the Item" });
  }
});

app.delete("/api/Items/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deletedTask = await items.findByIdAndDelete(id);
    return res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    return res.status(404).json({ error: `Failed to delete Item+${error}` });
  }
});

app.put("/api/Items", async (req, res) => {
  const id = req.body._id;
  const changes = req.body;
  try {
    const item = await items.findByIdAndUpdate(id, changes, { new: true });
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    return res.status(200).json(changes);
  } catch (error) {
    return res.status(500).json({ error: `failed to update item: ${error}` });
  }
});

//API requests for Users
app.get("/api/loggedIn", async (req, res) => {
  try {
    const user = await users.find({ loginStatus: true });
    if (!user) {
      return res.status(404).json({ error: "Failed to find" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: `failed sending request: ${error}` });
  }
});
app.get("/api/userList", async (req, res) => {
  try {
    const data = await users.find({ admin: false });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: `Encountered error: ${error}` });
  }
});
app.post("/api/addUser", async (req, res) => {
  const data = req.body;
  try {
    const existinguser = await users.find({ userId: data.userId });
    if (existinguser.length != 0) {
      return res.status(400).json({ message: "Username Already Taken" });
    }
    const newUser = new users(data);
    const newData = await newUser.save();
    return res.status(201).json(newData);
  } catch (error) {
    return res.status(500).json({ error: `Error Signing Up: ${error}` });
  }
});

app.put("/api/logout", async (req, res) => {
  const data = req.body;
  const id = req.body._id;
  try {
    const item = await users.findByIdAndUpdate(id, data, { new: true });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ error: `Failed Logging out: ${error}` });
  }
});

app.post("/api/User", async (req, res) => {
  const data = req.body;
  try {
    const items = await users.find(data);
    if (items.length != 0) {
      items[0].loginStatus = true;
      const id = items[0]._id;
      const item = await users.findByIdAndUpdate(id, items[0], { new: true });
    }

    return res.status(201).json(items);
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Error in finding the element: ${error}` });
  }
});

app.delete("/api/deleteUser/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await users.find({ userId: id });
    const _id = user[0]._id;
    await users.findByIdAndDelete(_id);
    res.status(200).json({ message: "User Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: `Failed to delete user: ${error}` });
  }
});

app.listen(port, () => {
  console.log("It is running fine");
});
