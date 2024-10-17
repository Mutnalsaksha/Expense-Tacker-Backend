const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Create an Express app
const app = express();

// Middleware
app.use(express.json()); // For parsing JSON bodies
app.use(cors()); // Enable CORS for frontend-backend communication

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/expenseTracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

// Define the Expense schema and model directly here
const expenseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now }, // Automatically add the current date
});

const Expense = mongoose.model('Expense', expenseSchema);

// Routes
// Root route for testing the server
app.get('/', (req, res) => {
    res.send('Expense Tracker API is running');
});

// Create Expense (POST /expenses)
// app.post('/expenses', async (req, res) => {
//     const { name, amount, category } = req.body;

//     // Basic input validation
//     if (!name || !amount || !category) {
//         return res.status(400).json({ message: 'All fields are required (name, amount, category)' });
//     }

//     try {
//         const newExpense = new Expense({ name, amount, category });
//         await newExpense.save();
//         res.status(201).json(newExpense);
//     } catch (err) {
//         console.error('Error adding expense:', err);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });


app.post('/expenses', async (req, res) => {
    const { name, amount, category } = req.body;

    // Basic input validation
    if (!name || !amount || !category) {
        return res.status(400).json({ message: 'All fields are required (name, amount, category)' });
    }

    try {
        const newExpense = new Expense({ name, amount, category });
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (err) {
        console.error('Error adding expense:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Get All Expenses (GET /expenses)
app.get('/expenses', async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.status(200).json(expenses);
    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update Expense (PUT /expenses/:id)
app.put('/expenses/:id', async (req, res) => {
    const { id } = req.params;
    const { name, amount, category } = req.body;

    // Validate ObjectID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid expense ID' });
    }

    // Check for missing fields
    if (!name || !amount || !category) {
        return res.status(400).json({ message: 'All fields are required (name, amount, category)' });
    }

    try {
        const updatedExpense = await Expense.findByIdAndUpdate(
            id,
            { name, amount, category },
            { new: true } // Return the updated document
        );

        if (!updatedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json(updatedExpense);
    } catch (err) {
        console.error('Error updating expense:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete Expense (DELETE /expenses/:id)
app.delete('/expenses/:id', async (req, res) => {
    const { id } = req.params;

    // Validate ObjectID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid expense ID' });
    }

    try {
        const deletedExpense = await Expense.findByIdAndDelete(id);

        if (!deletedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json({ message: 'Expense deleted', deletedExpense });
    } catch (err) {
        console.error('Error deleting expense:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
