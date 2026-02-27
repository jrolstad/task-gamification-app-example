const db = require('./db');
const createApp = require('./app');

const app = createApp(db);
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Task Quest API running on http://localhost:${PORT}`);
});
