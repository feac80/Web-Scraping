var express     = require("express"),
    app         = express(),
    mongoose    = require("mongoose"),
    flash       = require ("connect-flash"),
    bodyParser  = require("body-parser"),//handle form request
    methodOverride = require("method-override"),
    passport  = require("passport"),
    LocalStrategy = require ("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User           = require("./models/user.js"),
    Web           = require("./models/web.js"),
    request     = require ("request"),
    url         = "https://old.reddit.com/top/",
    cheerio     = require("cheerio");
    
mongoose.connect("mongodb://localhost:27017/webs", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(require("express-session")({
  secret: "Any thing I want to write",
  resave: false,
  saveUninitialized:false
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.set("view engine","ejs");//using ejs as web template
    
app.get("/", function(req, res){
    res.redirect("/login");
});

// 1 List all the webs
app.get("/webs",isLoggedIn, function(req, res){
Web.find({},function(err, results){
        if (err){
            req.flash("error" ,"Website was not found");
            res.redirect("back");
        }else{
           res.render("webs",{webs:results, currentUser:req.user}); 
        }
    });
   
});//show the webs

// 2 create webs
app.post("/webs", isLoggedIn, function(req, res){
  
     Web.create(req.body.web, function(err, web){
         if (err){
             console.log(err);
         }else{
             req.flash("success", "The web has been sucessfully added" );
             res.redirect('/webs');
         }
     });
});
// 3 show the form to add a new web
app.get("/webs/new",isLoggedIn, function(req, res){
    res.render("newweb");
} );

// 4 Show the web
app.get("/webs/:id",function(req, res){
    
   Web.findById(req.params.id, function(err, web){
       if (err){
           console.log(err);
       }else{
       res.render("showweb", {web:web});  
       }
       
   });
});

// 5 show the form to edit a web
app.get("/webs/:id/edit", function (req, res){
    
    Web.findById(req.params.id, isLoggedIn , function(err, web){
        if (err){
            res.redirect("/webs");
        }else{
            res.render("editweb", {web:web});
        }
    });
   
});

// 6 update the webs
app.put("/webs/:id", function(req, res ){
 
    Web.findByIdAndUpdate(req.params.id, req.body.web,  function(err,  updatedweb){
      if (err){
          console.log(err);
      }else{
          res.redirect("/webs");
      }
    });
 });

//  7 Delete route
app.delete("/webs/:id", function(req, res){
    Web.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/webs");
        }else{
            res.redirect("/webs");
        }
    });
});    
    
app.get("/login", function(req, res){
   res.render("login"); 
});

app.get("/register", function(req, res){
     res.render("register"); 
});

app.post("/register", function (req, res){
   const password = req.body.password,
         newUser = new User({username: req.body.username});
    
    User.register(newUser , password, function(err, user){
        if(err){
            console.log(err.message);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
          console.log("passport ok");
            req.flash("success", "You are successfully logged in as:"+ req.body.username );
            res.redirect("/webs");
        });
        
     });   
});

app.post("/login", passport.authenticate("local", {
    successRedirect:"/webs",
    failureRedirect:"/login",
    failureFlash: true,
    successFlash: 'You are suceesfully logged in!',
    //successFlash: true
}),function(req, res){
 req.flash("Welcome");
    
});
app.get("/logout", function (req, res){
   req.logout();
   req.flash("success", "You are logged out");
   res.redirect("/");
});


function isLoggedIn(req, res, next ){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please, you need to be logged in");
    res.redirect("/login");
}
// web scrapping
// request(url,function(err, res, html){
//   if (!err && res.statusCode === 200){
//      var item =[];
//      var $ = cheerio.load(html);
//      var allItems = $("#siteTable").children();
//      allItems.each(function(index){
//          item.push($("#siteTable").children().eq(index));
         
//      });
     
//      console.log(item);
//   }else{
//       console.log(err); 
//   }
   
// });

app.listen(process.env.PORT,process.env.IP, function(){
    console.log("the server is up and running");
});
    
