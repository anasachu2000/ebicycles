function errorHandler(err, req, res, next) {
   console.log(err);
   res.render("404"); 
}


module.exports = errorHandler;