var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('pages/auth');
});
router.get('/auth/google', (req,res)=>{res.send("working")})

module.exports = router;
