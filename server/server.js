const express = require('express');
const path = require('path');
const app = express();

app.use('/server/output', express.static(path.join(__dirname, 'output')));

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})