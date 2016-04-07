var pg = require("pg");
var Promise = require('promise');
var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');



var sequelize = new Sequelize('kevin_database', process.env.POSTGRES_USER, null, {
	host: 'localhost',
	dialect: 'postgres',
	define: {
		timestamps: false
	}
});

var User = sequelize.define('finalappusers', {
	username: Sequelize.STRING,
	email: Sequelize.STRING,
	password: Sequelize.STRING,
	name: Sequelize.STRING,
	lastname: Sequelize.STRING,
	telephone: Sequelize.STRING,
	birthday: Sequelize.DATE,
	addres: Sequelize.STRING,
	postalcode: Sequelize.STRING,
	city: Sequelize.STRING,
});

var Product = sequelize.define('finalappproducts', {
	name: Sequelize.STRING,
	brand: Sequelize.STRING,
	color: Sequelize.STRING,
	size: Sequelize.INTEGER,
	category: Sequelize.STRING,
	price: Sequelize.INTEGER,
	image1: Sequelize.STRING,
	image2: Sequelize.STRING,
	image3: Sequelize.STRING
});

var Basket = sequelize.define('basket', {
	price: Sequelize.INTEGER,
	name: Sequelize.STRING,
	size: Sequelize.INTEGER,
	image1: Sequelize.STRING,
	color: Sequelize.STRING,
	userid: Sequelize.INTEGER,
	product_id: Sequelize.INTEGER
});



var OrderProduct = sequelize.define('orders', {});

// User.hasMany(Basket);
// User.hasMany(OrderProduct);
// Basket.hasMany(Product);
// Basket.belongsTo(User);
// Basket.hasMany(OrderProduct);
// OrderProduct.belongsTo(User);
// OrderProduct.belongsTo(Basket);
// OrderProduct.belongsTo(Product);
// Product.hasMany(User);
// Product.hasMany(Basket);

app.use(session({
	secret: 'oh wow very secret much security',
	resave: true,
	saveUninitialized: false
}));

app.set('views', './src/views');
app.set('view engine', 'jade');
app.use(express.static('public'));

app.get('/', function(request, response) {
	response.render('index', {
		username: request.session.username,
	});
});

app.get('/users/new', function(request, response) {
	response.render('users/new');
});

app.get('/users/register', function(request, response) {
	response.render('users/register');
});

app.get('/users/profile', function(request, response) {
	response.render('users/profile');
});

app.get('/basket', function(request, response) {
	response.render('basket');
});

app.get('/products/singleproduct', function(request, response) {
	response.render('products/singleproduct');
});

app.get('/products/index', function(request, response) {
	var userID = request.query.userid;
	var username = request.session.username;
	var product = request.query.finalappproducts;
	var BRAND = request.query.merk;
	var CATEGORY = request.query.category;
	var COLOR = request.query.color;
	Product.findAll().then(function(products) {
			var data = products.map(function(finalappproducts) {
				return {
					id: finalappproducts.dataValues.id,
					name: finalappproducts.dataValues.name,
					brand: finalappproducts.dataValues.brand,
					color: finalappproducts.dataValues.color,
					size: finalappproducts.dataValues.size,
					category: finalappproducts.dataValues.category,
					price: finalappproducts.dataValues.price,
					image1: finalappproducts.dataValues.image1,
					image2: finalappproducts.dataValues.image2,
					image3: finalappproducts.dataValues.image3,
				}
			})
			allProducts = data;
		})
		.then(Basket.findAll({
				where: {
					userid: userID
				}
			})
			.then(function(baskets) {
				var baba = baskets.map(function(basket) {
					return {
						price: basket.dataValues.price,
						name: basket.dataValues.name,
						size: basket.dataValues.size,
						image1: basket.dataValues.image1,
						color: basket.dataValues.color,
						userid: basket.dataValues.userid,
						product_id: basket.dataValues.product_id
					}
				})
				allBaskets = baba;
			})
			.then(function() {
				var things = {
					allBaskets: allBaskets,
					allProducts: allProducts,
					username: username
				};
			})
		);
});

app.get('/products/filter', function(request, response) {
	var username = request.session.username;
	var product = request.query.finalappproducts;
	var BRAND = request.query.merk;
	var CATEGORY = request.query.category;
	var COLOR = request.query.color;
	Product.findAll().then(function(products) {
		var data = products.map(function(finalappproducts) {
			return {
				id: finalappproducts.dataValues.id,
				name: finalappproducts.dataValues.name,
				brand: finalappproducts.dataValues.brand,
				color: finalappproducts.dataValues.color,
				size: finalappproducts.dataValues.size,
				category: finalappproducts.dataValues.category,
				price: finalappproducts.dataValues.price,
				image1: finalappproducts.dataValues.image1,
				image2: finalappproducts.dataValues.image2,
				image3: finalappproducts.dataValues.image3,
			}
		})
		allProducts = data;
	}).then(function() {
		Product.findAll({
			where: Sequelize.or({
					brand: BRAND
				}, {
					category: CATEGORY
				}, {
					color: COLOR
				}
			)
		}).then(function(products) {
			var data = products.map(function(finalappproducts) {
				return {
					id: finalappproducts.dataValues.id,
					name: finalappproducts.dataValues.name,
					brand: finalappproducts.dataValues.brand,
					color: finalappproducts.dataValues.color,
					size: finalappproducts.dataValues.size,
					category: finalappproducts.dataValues.category,
					price: finalappproducts.dataValues.price,
					image1: finalappproducts.dataValues.image1,
					image2: finalappproducts.dataValues.image2,
					image3: finalappproducts.dataValues.image3,
				}
			})
			allProducts = data;
			response.render('products/index', {
				allProducts: allProducts,
				username: username,
			});
		});
	});
});

app.get('/users/:id', function(request, response) {
	var username = request.session.username;
	var ID = request.session.username.id;
	if (username === undefined) {
		response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		response.render('users/profile', {
			username: username,
		});
	}
});

app.get('/products/singleproduct/:productid', function(request, response) {
	productID = request.params.productid;
	var username = request.session.username;
	Product.findById(productID)
		.then(function(product) {
			var ID = product.dataValues.id;
			var name = product.dataValues.name;
			var brand = product.dataValues.brand;
			var color = product.dataValues.color;
			var size = product.dataValues.size;
			var category = product.dataValues.category;
			var price = product.dataValues.price;
			var image1 = product.dataValues.image1;
			var image2 = product.dataValues.image2;
			var image3 = product.dataValues.image3;
			response.render('products/singleproduct', {
				ID: ID,
				name: name,
				brand: brand,
				color: color,
				size: size,
				category: category,
				price: price,
				image1: image1,
				image2: image2,
				image3: image3,
				username: username,
			});
		});
});

app.post('/users/new', bodyParser.urlencoded({
	extended: true
}), function(request, response) {
	var usernamed = request.body.username;
	var passworded = request.body.password;
	var emailed = request.body.email;
	var named = request.body.name;
	var lastnamed = request.body.lastname;
	var telephoned = request.body.telephone;
	var addresed = request.body.addres;
	var postalcoded = request.body.postalcode;
	var cityed = request.body.city;
	var birthdayed = request.body.birthday;

	bcrypt.hash(passworded, 8, function(err, hash) {
		if (err !== undefined) {
			console.log(err);
		} else {
			console.log(hash);
			User.create({
				username: usernamed,
				password: hash,
				email: emailed,
				name: named,
				lastname: lastnamed,
				telephone: telephoned,
				addres: addresed,
				postalcode: postalcoded,
				city: cityed,
				birthday: birthdayed,
			})
			console.log("User Created in Database");
			response.redirect('/?message=' + encodeURIComponent("User created! Log in to view your profile."))
		}
	});
});


app.post('/basket', bodyParser.urlencoded({
	extended: true
}), function(request, response) {
	var username = request.session.username;
	var productid = request.query.id;
	console.log(productid);
	var object = {};
	object[request.body.name] = request.body.name;
	object[request.body.price] = request.body.price;
	object[request.body.size] = request.body.size;
	object[request.body.user] = request.body.user;
	object[request.body.userid] = request.body.userid;
	object[request.body.image1] = request.body.image1;
	object[request.body.color] = request.body.color;
	object[request.body.productid] = request.body.productid;


	var name = request.body.name;
	var price = request.body.price;
	var size = request.body.size;
	var user = request.body.user;
	var userid = request.body.userid;
	var image1 = request.body.image1;
	var color = request.body.color;
	var product_id = request.body.productid;
	
	Basket.create({
		price: price,
		name: name,
		size: size,
		image1: image1,
		color: color,
		userid: userid,
		product_id: product_id
	})
	response.render('')
});


app.post('/users/profile', bodyParser.urlencoded({
	extended: true
}), function(request, response) {
	var username = request.session.username;
	console.log(request.body.id);
	console.log(request.body.newValue);
	var username = request.session.username;
	var edit = request.body.id;
	var newValue = request.body.newValue;
	console.log(username.id);
	User.findById(username.id).then(function(username) {
		var object = {};
		object[request.body.id] = request.body.newValue;
		console.log(object);
		username.updateAttributes(object).then(function() {
			request.session.username = username;
			response.render('users/profile', {});
		})
	})
});

app.post('/login', bodyParser.urlencoded({
	extended: true
}), function(request, response) {
	User.findOne({
		where: {
			email: request.body.email
		}
	}).then(function(username) {
		var hashpassword = request.body.password;
		bcrypt.compare(hashpassword, username.password.toString(), function(err, result) {
			if (err !== undefined) {
				console.log(err);
			} else {
				console.log(result)
				if (username !== null && result === true) {
					request.session.username = username;
					response.redirect('/');
				} else {
					console.log("gaat iets fout")
					response.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
				}
			};
		});
	});
});

app.post('/logintje', bodyParser.urlencoded({
	extended: true
}), function(request, response) {
	User.findOne({
		where: {
			email: request.body.email
		}
	}).then(function(username) {
		var hashpassword = request.body.password;
		bcrypt.compare(hashpassword, username.password.toString(), function(err, result) {
			if (err !== undefined) {
				console.log(err);
			} else {
				console.log(result)
				if (username !== null && result === true) {
					request.session.username = username;
					response.redirect('/products/index?userid=' + username.id);
				} else {
					console.log("gaat iets fout")
					response.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
				}
			};
		});
	});
});

app.post('/logintjes', bodyParser.urlencoded({
	extended: true
}), function(request, response) {
	User.findOne({
		where: {
			email: request.body.email
		}
	}).then(function(username) {
		var hashpassword = request.body.password;
		bcrypt.compare(hashpassword, username.password.toString(), function(err, result) {
			if (err !== undefined) {
				console.log(err);
			} else {
				console.log(result)
				if (username !== null && result === true) {
					request.session.username = username;
					response.redirect('/products/index');
				} else {
					console.log("gaat iets fout")
					response.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
				}
			};
		});
	});
});

app.get('/logout', function(request, response) {
	request.session.destroy(function(error) {
		if (error) {
			throw error;
		}
		response.redirect('/?message=' + encodeURIComponent("Successfully logged out."));
	})
});

sequelize.sync().then(function() {
	var server = app.listen(3000, function() {
		console.log('Formadores > loaded on ' + server.address().port);
	});
});