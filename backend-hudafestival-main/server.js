const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const connectDB = require('./config/db');
const candidateRoutes = require('./routes/candidateRoutes');
const teamRoutes = require('./routes/teamRoutes');
const programmeRoutes = require('./routes/programmeRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const settingsRoutes = require('./routes/settingsRoutes')
const authRoutes = require('./routes/authRoutes');
const allResultsRoutes = require('./routes/allResultsRoutes');
const pointAdjustmentRoutes = require('./routes/pointAdjustmentRoutes.js');
const importRoutes = require('./routes/importRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const topicRegistrationRoutes = require('./routes/topicRegistrationRoutes');

connectDB();
const app = express();
const PORT = process.env.PORT

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/candidates', candidateRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/programmes', programmeRoutes);
app.use('/api/leaderboards', leaderboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/results', allResultsRoutes)
app.use('/api/point-adjustments', pointAdjustmentRoutes);
app.use('/api/admin/import', importRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/topic-registrations', topicRegistrationRoutes);

const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

app.get('/', (req, res) => {
    res.send('API is running...');
})

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

})
