//node js backend server "The Glue"
const { response } = require('express');
const express = require ('express');
const app = express();
const path = require('path');
var bodyparser = require('body-parser');
const session = require('express-session');
const formidable = require('formidable');
const fs = require('fs');
const { spawn } = require('child_process');
const { rawListeners } = require('process');

const knex = require('knex')({
  client: 'mysql',
  connection: {
    host : 'localhost',
    port : 3306,
    user : 'pi',
    password : 'raspberry',
    database : 'attendance'
  },
  migrations: {
      directory: './migrations'
  }
});

const KnexSessionStore = require('connect-session-knex')(session);
const store = new KnexSessionStore({
    knex: knex,
    tablename: 'sessions'
});

const sessionParser = session({
    secret: 'shh',
    cookie: {
        maxAge: null
    },
    saveUninitialized: false,
    resave: false,
    store: store,
});
const MIN_PASSWORD_LENGTH = 3;

knex.migrate.latest()
  .then(function() {
    console.log("Knex is migrated")
}).catch((err) => {
    console.log(err);
});

function sql_drop_tables() {
    knex.schema.dropTableIfExists('sounds').then( console.log("Dropped Sound Table"))
    knex.schema.dropTableIfExists('users').then( console.log("Dropped Users Table"))
}

function sql_create_tables() {
    knex.raw("SELECT VERSION()").then(
        (version) => console.log((version[0][0]))
    ).catch((err) => { console.log( err); throw err })
    
    knex.schema.hasTable('sounds').then(function(exists) {
        if (!exists) {
            return knex.schema.createTable('sounds', function(table) {
                table.increments('id')
                table.string('name')
                table.integer('size')
                table.unique('name')
            })
            .then(() => console.log("Sounds table created"))
            .catch((err) => { console.log(err); throw err });
        } else { console.log("Sounds Table Already Exists")}
    }); 
    
    knex.schema.hasTable('users').then(function(exists) {
        if (!exists) {
            return knex.schema.createTable('users', function(table) {
                table.increments('id')
                table.string('name')
                table.string('sound')
                table.string('rfid_code')
                table.string('password')
                table.boolean('admin').defaultTo(false)
                table.integer('modifier').defaultTo(1)
                table.boolean('is_default').defaultTo(true)
                table.unique('name')
                table.unique('rfid_code')
            })
            .then(() => console.log("Users table created"))
            .catch((err) => { console.log(err); throw err });
        }
        else {
            console.log("Users Table Already Exists")
        }
    }); 
}

function sql_insert_dummy_users() {
    const demo_users = [{ name: 'seth', sound: 'test', rfid_code : 000, password: 'hello'}] 
    knex('users').insert(demo_users).then(() => console.log("data inserted"))
    .catch((err) => { console.log(err); throw err })
}

function sql_select_all_users() { 
    knex.from('users').select("*")
        .then((rows) => {
            for (row of rows) {
                console.log(row)
            }
        }).catch((err) => { console.log( err); throw err }) 
}

function sql_select_all_sounds() { 
    knex.from('sounds').select("*")
        .then((rows) => {
            for (row of rows) {
                console.log(row)
            }
        }).catch((err) => { console.log( err); throw err }) 
}

function startPythonHandler()
{
    const pythonHandler = spawn('python3',['public/python/main_handler.py']);

    pythonHandler.stdout.on('data', (data) => {
        console.log("PYTHON HANDLER:")
        console.log(`stdout: ${data}`);
        console.log("")
    });

    pythonHandler.stderr.on('data', (data) => {
        console.error(`PYTHON HANDLER stderr: ${data}`);
    });

    pythonHandler.on('close', (code) => {
        console.log(`Handler exited with code: ${code}`);
        if(code == 0)
        {
            startPythonHandler();
        } else {
            console.log("Handler Failed")
        }
    });
}
startPythonHandler();

//set port
const port = 3000;
app.use(sessionParser);
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
	extended: true
}));

//set static path
// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(__dirname + '/'));

//home page route
app.get ('/', (req, res) => {
    res.render('index.ejs');
})

app.post('/sendPython', function(req, res) {
    //pull variable from body
    var pythonData = req.body.dataPython;
    console.log(pythonData);
    if(pythonData == "drop")
        sql_drop_tables()
    if(pythonData == "create")
        sql_create_tables()
    if(pythonData == "insert")
        sql_insert_dummy_users()
    if(pythonData == "select")
        sql_select_all_users()
    if(pythonData == "select_sounds")
        sql_select_all_sounds()
    
    if(pythonData == "test")
        lcdTest();
    //res.send("This is test?")
    res.send("hello")
})

app.get ('/create_account', (req, res) => {
    res.render('create_account.ejs');
})

app.post('/account_create', function(req, res) {
    //pull variable from body
    var account_name = req.body.default_account_name;
    var new_account_name = req.body.new_account_name;
    var new_account_password = req.body.new_account_password;

    console.log("Account Creation Attempted:");
    console.log(account_name);
    console.log(new_account_name);
    console.log(new_account_password);

    var error = [];
    if(!account_name)
        error.push("Account Name Empty");
    if(!new_account_name)
        error.push("New Account Name Empty");
    if(!new_account_password)
        error.push("Password Empty");
    if(new_account_password.length < MIN_PASSWORD_LENGTH)
        error.push("Password Must Be longer");

    if(error.length == 0)
    {
        knex.from('users').select("*").where('name',account_name)
        .then((results) => {
            if(results.length == 0)
            {
                error.push("User not found");
            } else {
                user = results[0];
                if(!user.is_default)
                {
                    error.push("User is not default");   
                } else {
                    knex('users').where('name',account_name)
                    .update({
                        name: new_account_name,
                        password: new_account_password,
                        is_default: false
                    }).catch((err) => { 
                        error.push(err);
                        res.send(error);
                    });
                }
            }   
            res.send(error);
        }).catch((err) => { 
            error.push(err); 
            res.send(error);
        });
    } else {
        res.send(error);
    }
})

app.get ('/login', (req, res) => {
    if(req.session.loggedIn && (req.session.account_name != undefined))
    {
        knex.from('users').select("*").where('name',req.session.account_name)
        .then((results) => {
            if(results == 0)
            {
                //Fuck thats not good
            } else {
                var user = results[0];
                let display_password = user.password.charAt(0);
                for (let i = 1; i < user.password.length; i++) {
                    display_password = display_password + "*";
                }
                
                res.render('logged_in.ejs', {
                    account_name: user.name,
                    account_password: display_password,
                    account_sound: user.sound
                });
            } 
        }).catch((err) => { 
            console.log(err);
        })
    } else {
        res.render('login.ejs');
    }
})

app.post('/login', function(req, res) {
    //pull variable from body
    console.log("Login Attempted:");
    var account_name = req.body.account_name;
    var account_password = req.body.account_password;
    console.log(account_name);
    console.log(account_password);

    var error = [];

    if(!account_name)
        error.push("User Name is blank");
    if(!account_password)
        error.push("Password is blank");

    if(error.length == 0)
    {
        knex.from('users').select("*").where('name',account_name)
        .then(function(result){
            if(result.length == 0)
            {
                error.push("Username doesn't exist");
            } else {
                var user = result[0];
                if(user.is_default) {
                    error.push("User is default");
                } else if (user.password.toLowerCase() == account_password.toString().toLowerCase()) { 
                    req.session.loggedIn = true;
                    req.session.account_name = user.name;

                    if(user.admin)
                        req.session.isAdmin = true;
                    else
                        req.session.isAdmin = false;
                } else {
                    error.push("Password Incorrect!");
                }
            }
            res.send(error);
        }).catch(function(err) {
            error.push(err);
            res.send(err);
        });
    } else {
        res.send(error);
    } 
})

app.post('/modify_account',function(req,res) {
    console.log("Modify Account Attempted:");
    var new_account_name = req.body.new_account_name;
    var new_account_password = req.body.new_account_password;
    var account_name = req.body.account_name;
    var account_password = req.body.account_password;
    console.log(new_account_name);
    console.log(new_account_password);
    console.log(account_name);
    console.log(account_password);

    var error = [];

    if(!account_name)
        error.push("User Name is blank");
    if(!account_password)
        error.push("Password is blank");
    if(!new_account_name)
        error.push("New User Name is blank");
    if(!new_account_password)
        error.push("New Password is blank");
    if(new_account_password.length < MIN_PASSWORD_LENGTH)
        error.push("Password Must Be longer");
    if(account_name != req.session.account_name)
        error.push("Thats not your account name")

    if(error.length == 0)
    {
        knex.from('users').select("*").where('name',account_name)
        .then(function(result){
            if(result.length == 0)
            {
                error.push("Username doesn't exist, thats not good");
            } else {
                var user = result[0];
                if (user.password.toLowerCase() == account_password.toString().toLowerCase()) { 
                    knex('users').where('name',account_name)
                    .update({
                        name: new_account_name,
                        password: new_account_password,
                    }).catch((err) => { 
                        error.push(err);
                        res.send(error);
                    });
                    req.session.account_name = new_account_name;
                } else {
                    error.push("Password Incorrect!");
                }
            }
            res.send(error);
        }).catch(function(err) {
            error.push(err);
            res.send(err);
        });
    }
    else
    {
        res.send(error);
    }
})

app.post('/log_out', function(req,res) {
    console.log("Logging Out");
    req.session.loggedIn = false;
    req.session.account_name = undefined;
    res.send([]);
})

app.get ('/upload', (req, res) => {
    if(req.session.loggedIn && (req.session.account_name != undefined))
    {
        res.render('upload.ejs');
    } else {
        res.render('logged_out_upload.ejs');
    }
    
})

const isFileValid = (file) => {
    //var type = file.type.split("/").pop();
    var type = file.mimetype.split("/").pop();
    const validTypes = ["mpeg", "wav"];
    if (validTypes.indexOf(type) === -1) {
        return false;
    }
    return true;
};

const cleanPublicSounds = (directory) => {
    fs.readdir(directory, (err,files) => {
        if(err)
            console.log(err);
        else {
            files.forEach(file => {
                if(path.extname(file) != ".wav" && path.extname(file) != ".mp3")
                {
                    fs.unlinkSync(directory.concat("/",file));
                    console.log("Removed Dead File!")
                }
            })
        }
    })
}

const syncPublicSounds = (directory) => {
    fs.readdir(directory, (err, files) => {
        if(err)
            console.log(err)
        else {
            files.forEach(file => {
                knex.from('sounds').select("*").where('name', file)
                .then((results) => {
                    if(results.length == 0)
                    {
                        try {
                            fs.unlinkSync(directory.concat("/",file));
                            console.log("Removed Non Database File")
                        } catch (err) {
                            console.log(err)    
                        }
                    }
                })
            })
        }
    })
}

app.post('/uploadSound', function (req,res){
    const form = new formidable.IncomingForm()
    console.log("UploadSound Attempt")
    
    const uploadFolder = path.join(__dirname,'public','files')
    cleanPublicSounds(uploadFolder);
    syncPublicSounds(uploadFolder);

    form.multiples = false; 
    form.maxFileSize = 50*1024*1024; // 5MB
    form.uploadDir = uploadFolder;

    var error = [];
    
    form.parse(req, async (err, fields, files) => {
        if (err) {
            error.push("Error parsing the files");
            res.send(error);
        }
        // Check if multiple files or a single file
        if (!files.myFile.length) {
            //Single file
            const file = files.myFile;
            // checks if the file is valid

            let myPromise = new Promise(function(resolve) {
                const childPython = spawn('python',['public/python/soundCheck.py',file.filepath]);

                childPython.stdout.on('data', (data) => {
                    //console.log(`stdout: ${data}`);
                    resolve(data.indexOf('True') != -1);
                });
                    
                childPython.stderr.on('data', (data) => {
                    console.error(`stderr: ${data}`);
                    resolve(false);
                });

                childPython.on('close', (code) => {
                    //console.log(`child process exited with code: ${code}`);
                });
            });

            //const isValid = isFileValid(file) & canPythonPlayFile(file.filepath);
            const isValid = isFileValid(file) & await myPromise; 
            // creates a valid name by removing spaces
            const fileName = encodeURIComponent(file.originalFilename.replace(/\s/g, "-"));
            var filepath = uploadFolder.concat("/", fileName);

            if (!isValid) {
                // throes error if file isn't valid
                error.push("The file type is not a valid type");
                res.send(error);
            } else {
                try {
                    // renames the file in the directory
                    //check if there is a file with the same name
                    var isFileThereAlready = false;
                    fs.access(filepath, fs.constants.F_OK, (err) => {
                        if(!err)
                            isFileThereAlready = true;
                    });

                    if(isFileThereAlready)
                    {
                        error.push("A file with that name already exists");
                        res.send(error);
                    } else {
                        fs.renameSync(file.filepath, filepath);
                        
                        try {
                            // stores the fileName and size in the database
                            let fileSizePromise = new Promise(function(resolve) {
                                fs.stat(filepath, (err, stats) => {
                                    if(err)
                                        console.log(err);
                                    else
                                        resolve(stats.size);
                                });
                            });

                            knex('sounds').insert({
                                name: fileName,
                                size: await fileSizePromise 
                            }).then(() => {
                                console.log("File Upload Worked");
                            
                            }).catch(function(err) {
                                error.push(err);
                            });

                        } catch (err) {
                            error.push(err);
                        }
                    }
                } catch (err) {
                    error.push(err);
                    res.send(error);
                }
                
            }
        } else {
            error.push("One file at a time");
            res.send(error);
        }
    });
})

app.get('/sounds', (req, res) => {
    knex.from('sounds').select("*")
    .then((results) => {
        res.render('sounds.ejs', {
            isAdmin: (req.session.isAdmin),
            loggedIn: (req.session.loggedIn),
            soundData: results       
        });
    })
    //should have some other case where it says it cant reach the sql data base
})

app.post('/select_sound', function(req,res) {
    //var sound_name = req.params.id;
    console.log("Select Sound Attempted:");
    var sound_name  = req.body.soundId;
    console.log(sound_name);
    var error = [];

    if(!sound_name)
        error.push("No sound passed");
    if(!req.session.loggedIn)
        error.push("User is not logged in")
    if(!req.session.account_name)
        error.push("Account name not found")
    
    if(error.length == 0)
    {
        knex.from('sounds').select("*").where('name',sound_name)
        .then(function(results){
            if(results.length == 0)
            {
                error.push("Sound not found in Database");
            } else {
                knex.from('users').select('*').where('name', req.session.account_name)
                .then(function(results){
                    if(results.length == 0)
                    {
                        error.push("User not found in Database");
                    } else {
                        knex('users').where('name',req.session.account_name).update({
                            sound: sound_name,
                        }).catch((err) => { 
                            res.send(error);
                        });
                    }
                }).catch((err) => {
                    res.send(error);
                });
            }
        }).catch((err) => {
            error.push(err);
            res.send(error);
        });
        res.send(error);
    } else {
        console.log(error);
        res.send(error);
    }
})

app.listen(port, () => {
  console.log(`Senior Project App listening on port ${port}`)
})