
/*
 * GET news page
 */

exports.index = function(req, res){
  res.render('news', { title: 'Express News' })
};