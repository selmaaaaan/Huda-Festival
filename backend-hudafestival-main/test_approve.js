require('mongoose').connect('mongodb+srv://admin:hudafestadmin123@cluster0.zb2c00b.mongodb.net/hudafestival?retryWrites=true&w=majority&appName=Cluster0').then(async () => { 
  const Result = require('./models/Result'); 
  await Result.updateMany({ programme: '6aa53238b505df4ce11fcf53' }, { $set: { status: 'pending' } }); 
  const User = require('./models/User'); 
  const jwt = require('jsonwebtoken'); 
  const adminUser = await User.findOne({ role: 'admin' }); 
  const token = jwt.sign({ id: adminUser._id }, 'your_super_secret_jwt_key_here', { expiresIn: '30d' }); 
  const http = require('http'); 
  const req = http.request({ 
    hostname: 'localhost', port: 5000, 
    path: '/api/programmes/6aa53238b505df4ce11fcf53/approve', 
    method: 'POST', 
    headers: {'Authorization': 'Bearer ' + token} 
  }, res => { 
    let d = ''; res.on('data', c => d += c); 
    res.on('end', () => {
      console.log('Approve response:', res.statusCode, d);
      process.exit();
    }); 
  }); 
  req.on('error', e => {console.error(e); process.exit();}); 
  req.end(); 
});
