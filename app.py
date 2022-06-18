import cv2

from cs50 import SQL
from flask import Flask, redirect, render_template, request, session, jsonify
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from datetime import date
from flask_mail import Mail, Message

from helpers import login_required, password_validator, email_validator, code_generator, rename_file, day_calc, hours_calc, get_challenge, posted_on
from configuration import email_config

# Path for saving uploads
UPLOAD_FOLDER = 'static/uploads'

# Allowed uploads
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Configure application
app = Flask(__name__)

# Configure upload folder
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure to use mail services
app.config["MAIL_DEFAULT_SENDER"] = email_config("username")
app.config["MAIL_PASSWORD"] = email_config("password")
app.config["MAIL_PORT"] = 587
app.config["MAIL_SERVER"] = "smtp.mailgun.org"
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = email_config("username")
mail = Mail(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///final.db")

# Test function
def liked(content_id):
    
    like = db.execute("SELECT * FROM likes WHERE content_id=? AND content_type=? AND user_id=?", content_id, 'tips',  session["user_id"])

    return len(like) != 0

# Custom filters
app.jinja_env.filters["posted_on"] = posted_on
app.jinja_env.filters["day"] = day_calc
app.jinja_env.filters["challenge"] = get_challenge

# Custom tests
app.jinja_env.tests["liked"] = liked

# Ensure that every upload is valid
def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

@app.route("/")
def index():

    # Checking if the user is logged in
    if session.get("user_id") is None:
        return render_template("index.html")

    # If not redirecting the user to the index page
    else:
        return redirect("/home")

@app.route("/home")
@login_required
def home():

    return render_template("home.html")

@app.route("/myprofile_lg")
@login_required
def myprofile():

    # Query to get info about the user
    user = db.execute("SELECT * FROM users WHERE id=?", session["user_id"])

    # Query to get user's challenge
    challenge = db.execute("SELECT * FROM challenges WHERE id=?", user[0]["challenges_id"])

    # Query to get user's posts
    posts = db.execute("SELECT * FROM posts WHERE user_id=?", session["user_id"])

    # Query to count followers
    followers = db.execute("SELECT COUNT(follower_id) AS followers FROM connections WHERE followed_id=?", session["user_id"])

    # Query to count followeds
    following = db.execute("SELECT COUNT(followed_id) AS following FROM connections WHERE follower_id=?", session["user_id"])

    posts_length = len(posts)

    return render_template("myprofileLG.html", user=user[0], 
            challenge=challenge[0], 
            hours=hours_calc(user[0]["started_on"], 
            challenge[0]["dedication"]), 
            posts=posts, 
            length=posts_length, 
            followers=followers[0]["followers"], 
            following=following[0]["following"]
        )

@app.route("/myprofile_sm")
@login_required
def myprofilesm():

    # Query to get info about the user
    user = db.execute("SELECT * FROM users WHERE id=?", session["user_id"])

    # Query to get user's challenge
    challenge = db.execute("SELECT * FROM challenges WHERE id=?", user[0]["challenges_id"])

    # Query to get user's posts
    posts = db.execute("SELECT * FROM posts WHERE user_id=?", session["user_id"])

    # Query to count followers
    followers = db.execute("SELECT COUNT(follower_id) AS followers FROM connections WHERE followed_id=?", session["user_id"])

    # Query to count followeds
    following = db.execute("SELECT COUNT(followed_id) AS following FROM connections WHERE follower_id=?", session["user_id"])

    posts_length = len(posts)

    return render_template("myprofileSM.html", user=user[0], 
            challenge=challenge[0], 
            hours=hours_calc(user[0]["started_on"], 
            challenge[0]["dedication"]), 
            posts=posts, 
            length=posts_length, 
            followers=followers[0]["followers"], 
            following=following[0]["following"]
        )

@app.route("/login", methods=["POST", "GET"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Initialize
        username = request.form.get("username").strip()
        password = request.form.get("password")

        # Ensure username was submitted
        if not username:
            return render_template("login.html", message="Must provide username", 
                    forgot_password=True, 
                    error_message="missing"
                )

        # Ensure password was submitted
        elif not password:
            return render_template("login.html", message="Must provide password", 
                    forgot_password=True, 
                    error_message="missing"
                )

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username=?", username.lower())

        # Check if email matches
        if len(rows) != 1:
            # Query database for email
            rows = db.execute("SELECT * FROM users WHERE email=?", username) 

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], password):
            return render_template("login.html", message="Invalid username and/or password",
                    forgot_password=True, 
                    error_message="missing"
                )

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Checking if the user is new
        new = db.execute("SELECT new FROM users WHERE id=?", session["user_id"])

        
        if new[0]["new"] == 1:

            # Redirect user to profile
            return redirect("/survey")

        else:

            # Redirect user to home page
            return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")

@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")

@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""

    # User reached route via post
    if request.method == "POST":

        # Initialize
        username = request.form.get("username").strip().lower()
        email = request.form.get("email").strip()
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")

        # Ensure if the user provider a username
        if not username:
            return render_template("register.html", message="Must provide username", error_message="missing")

        # Ensure username is only one word
        elif len(username.rsplit(" ")) != 1:
            return render_template("register.html", message="Username must be one word", error_message="missing")

        #  Ensure email is not empty
        elif not email:
            return render_template("register.html", message="Must provide email", error_message="missing")

        # Ensure email is valid
        elif email_validator(email) != None:
            return render_template("register.html", message=email_validator(email), error_message="email")
  
        # Ensure if the user provided password
        elif not password:
            return render_template("register.html", message="Must provide password", error_message="missing")
            
        # Ensure if the user confirmed password
        elif not confirmation:
            return render_template("register.html", message="Password not confirmed", 
                    error_message="missing")

        # Ensure if the user's password matches with confirmation
        elif password != confirmation:
            return render_template("register.html", message="Password does not match", error_message="match")

        # Ensure password is valid
        elif password_validator(password) != None:
            return render_template("register.html", message=password_validator(password), error_message="password")
         
        # Quering for a matching username in the database
        matching_user = db.execute("SELECT id, username, email FROM users WHERE username = ?", username)

        if len(matching_user) != 0:

            # Ensure the same email doesn't exist on our database
            if matching_user[0]["email"] == email:
                return render_template("register.html", message="Email already exists", error_message="exists")

            # Ensure the same username doesn't exist in the database
            else:
                return render_template("register.html", message="Username already exists", error_message="exists")

        # Generating random code
        code = code_generator()

        # Quering to insert the new user in our database
        db.execute("INSERT INTO users (username, hash, email, started_on, code) VALUES(?, ?, ?, ?, ?)", 
                username, 
                generate_password_hash(password), 
                email, 
                date.today(), 
                code
            )

        # Send email
        with mail.connect() as conn:
            email = request.form.get("email")
            message = f"Welcome {request.form.get('username').strip()}!\nStart your journey with LivingDreams.com.\nLearn from people who have walked the same journey as you.\nUse this code to complete your registration: {code}"
            subject = "Welcome Champ to LivingDreams.com!"
            msg = Message(recipients=[email],
                        body=message,
                        subject=subject)

            conn.send(msg)

        # Temporarily getting user's id to enable some functions
        session["temp_id"] = email

        # User redirected to index
        return redirect("/confirm_account")

    # User reached route via GET
    else:
        return render_template("register.html")

@app.route("/confirm_account", methods=["POST", "GET"])
def confirm_account():

    # Route reached via POST
    if request.method == "POST":
        
        # Ensure code is not empty
        if not request.form.get("code"):
            return render_template("confirm_account.html", message="Code cannot be empty", error_message="missing")

        # Querying to get code
        code = db.execute("SELECT code FROM users WHERE email=?", session["temp_id"])

        # Ensure user doesn't break the server by editing html
        try:
            # Ensure code is correct
            if int(request.form.get("code")) != code[0]["code"]:
                return render_template("confirm_account.html", message="Code does not match", error_message="count")
        
        # Ensure server doesn't break in case user manipulates HTML
        except ValueError:
            return render_template("confirm_account.html", message="Code corrupt!", error_message="match")

        # Query to specify that the user's account has been confirmed/validated
        db.execute("UPDATE users SET confirmed=1 WHERE email=?", session["temp_id"])

        # Clearing "temp_id" as it's no longer needed
        session.clear()

        # Redirect to login page
        return redirect("/login")

    # Route reached via GET
    else:
        return render_template("confirm_account.html")

@app.route("/resend_code")
def resend_code():
    
    # Generate random code
    code = code_generator()

    # Quering to update the code
    db.execute("UPDATE users SET code=? WHERE email=?", code, session["temp_id"])

    
    # Send email
    with mail.connect() as conn:
        email = session["temp_id"]
        message = f"Hi!\nStart your journey with LivingDreams.com.\nLearn from people who have walked the same journey as you.\nUse this code to complete your registration: {code}"
        subject = "Welcome Champ to LivingDreams.com!"
        msg = Message(recipients=[email],
                    body=message,
                    subject=subject)

        conn.send(msg)

        return redirect("/confirm_account")

@app.route("/forgot_password", methods=["POST", "GET"])
def forgot_password():

    # User reached route via POST
    if request.method == "POST":

        # Initialize
        email = request.form.get("email").strip()

        # Ensure email is not empty
        if not email:
            return render_template("reset.html", method="forgot_password", 
                    message="Email cannot be empty", 
                    error_message="missing"
                )

        # Querying to get user's email for validation
        rows = db.execute("SELECT email FROM users WHERE email=?", email)

        # Ensure email is correct
        if len(rows) == 0:
            return render_template("reset.html", method="forgot_password", 
                    message="Email doesn't exist in our database", 
                    error_message="exists"
                )

        # Temporarily getting user's id to enable some functions
        session["temp_id"] = rows[0]["email"]

        # Generate random code
        code = code_generator()
        
        # Send email
        with mail.connect() as conn:
            message = f"Hi Champ!\nUse this code to confirm your email: {code}"
            subject = "Welcome Champ to LivingDreams.com!"
            msg = Message(recipients=[email],
                        body=message,
                        subject=subject)

            conn.send(msg)

        # Quering to update the code
        db.execute("UPDATE users SET code=? WHERE email=?", code, session["temp_id"])

        # Redirect to confirm your email & change password
        return redirect("/reset_password")
        

    # User reached route via GET
    else:
        return render_template("reset.html", method="forgot_password")




@app.route("/reset_password", methods=["POST", "GET"])
def reset_password():

    # User reached route via POST
    if request.method == "POST":

        # Iniatialize
        code  = request.form.get("code")
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")

        # Ensure code is not empty
        if not code:
            return render_template("reset.html", method="reset_password", 
                    message="Code cannot be empty", 
                    error_message="missing"
                )

        # Ensure new password is not empty
        elif not password:
            return render_template("reset.html", method="reset_password", 
                    message="New Password cannot be empty", 
                    error_message="missing"
                )

        # Ensure confirmation is not empty
        elif not confirmation:
            return render_template("reset.html", method="reset_password", 
                    message="Please confirm your password", 
                    error_message="missing"
                )

        # Ensure password is valid
        elif password_validator(password) != None:
            return render_template("reset.html", method="reset_password", 
                    message=password_validator(password), 
                    error_message="password"
                )

        # Ensure password matches confirmation
        elif password != confirmation:
            return render_template("reset.html", method="reset_password", 
                    message="Password and confirmation does not match", 
                    error_message="match"
                )

        # Querying to get code
        code = db.execute("SELECT code FROM users WHERE email=?", session["temp_id"])

        # Ensure code is the same
        if int(request.form.get("code")) != code[0]["code"]:
            return render_template("reset.html", method="reset_password", 
                    message="Code does not match", 
                    error_message="match"
                )

        # Update user's password
        db.execute("UPDATE users SET hash=? WHERE email=?", generate_password_hash(password), session["temp_id"])

        # Send email
        with mail.connect() as conn:
            message = f"Hi!\nPassword changed successfully."
            subject = "This is LivingDreams.com!"
            msg = Message(recipients=[session["temp_id"]],
                        body=message,
                        subject=subject)

            conn.send(msg)

        # Clearing "temp_id" as it's no longer needed
        session.clear()

        # Redirect user to login
        return redirect("/login")

    # User reached route via GET
    else:
        return render_template("reset.html", method="reset_password")

@app.route("/profile", methods=["POST", "GET"])
@login_required
def profile():

    # User reached route via POST
    if request.method == "POST":
        
        # Initailize
        bio = request.form.get("bio")
            
        # Querying to update bio
        if bio:
            db.execute("UPDATE users SET bio=? WHERE id=?", bio, session["user_id"])

        # Redirecting user to home
        return redirect("/")

    # User reached route via GET
    else:
        return render_template("profile.html")

@app.route("/edit_picture", methods=["POST", "GET"])
@login_required
def edit_picture():

    # User reached route via POST
    if request.method == "POST":

        try:

            # Initialize
            file = request.files["file"]
            crop_x = int(float(request.form.get("x")))
            crop_y = int(float(request.form.get("y")))
            crop_width = int(float(request.form.get("width")))
            crop_height = int(float(request.form.get("height")))

        except ValueError:
            pass

        # Ensure file is not empty
        if file.filename != "":

                # Ensure image is allowed
                if file and allowed_file(file.filename):

                    # Ensure image is secure
                    filename = secure_filename(file.filename)

                    # Rename image
                    file_path = rename_file(file.filename, session["user_id"])

                    # Save the original image
                    file.save(os.path.join(app.config['UPLOAD_FOLDER'], file_path))

                    # Read image
                    img = cv2.imread(f"{app.config['UPLOAD_FOLDER']}/{file_path}")

                    # Ensure these values are not negative
                    if crop_x < 0:
                        crop_x = 0

                    if crop_y < 0:
                        crop_y = 0

                    # Crop image
                    crop_img = img[crop_y:crop_y+crop_height, crop_x:crop_x+crop_width]

                    # Save cropped image
                    cv2.imwrite(f"{app.config['UPLOAD_FOLDER']}/{file_path}", crop_img)

                    # Querying to update user's profile picture
                    db.execute("UPDATE users SET image=? WHERE id=?", file_path, session["user_id"])
                    
                # Ensure image is allowed and not corrupt
                else:
                    return render_template("edit_profile.html", method="picture", 
                            message="Image not allowed or corrupt", 
                            error_message="match"
                        )
        # Ensure image is selected
        else:
            return render_template("edit_profile.html", method="picture", 
                    message="No image selected", 
                    error_message="missing"
                )

        # Redirect to home page
        return redirect("/")

    # User reached route via GET
    else:
        return render_template("edit_profile.html", method="picture")

@app.route("/edit_password", methods=["POST", "GET"])
@login_required
def edit_password():

    # User reached route via POST
    if request.method == "POST":

        # Initialize
        old_password = request.form.get("old_password")
        new_password = request.form.get("new_password")
        confirmation = request.form.get("confirmation")

        # Ensure old password is not empty
        if not old_password:
            return render_template("edit_profile.html", method="password", 
                    message="Old Password Cannot Be Empty", 
                    error_message="missing"
                )

        # Ensure new password is not empty
        elif not new_password:
            return render_template("edit_profile.html", method="password", 
                    message="New Password Cannot Be Empty", 
                    error_message="missing"
                )

        # Ensure confirmation is not empty
        elif not confirmation:
            return render_template("edit_profile.html", method="password", 
                    message="Confirmation Cannot Be Empty", 
                    error_message="missing"
                )

        # Ensure new password matches confirmation
        elif new_password != confirmation:
            return render_template("edit_profile.html", method="password", 
                    message="New Password Doesn't Match Confirmation", 
                    error_message="match"
                )
        
        # Ensure password is valid
        elif password_validator(new_password) != None:
            return render_template("edit_profile.html", method="password", 
                    message=password_validator(new_password), 
                    error_message="password"
                )

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE id = ?", session["user_id"])

        # Ensure password is correct
        if not check_password_hash(rows[0]["hash"], old_password):
            return render_template("edit_profile.html", method="password", 
                    message="Incorrect password", 
                    error_message="match"
                )

        # Query database to update user's password
        db.execute("UPDATE users SET hash=? WHERE id=?", generate_password_hash(new_password), 
            session["user_id"]
        )

        # Redirects user to home page
        return redirect("/")

    # User reached route via GET 
    else:
        return render_template("edit_profile.html", method="password")

@app.route("/edit_bio", methods=["POST", "GET"])
@login_required
def edit_bio():

    # User reached route via POST
    if request.method == "POST":

        # Initialize
        bio = request.form.get("bio").strip()

        # Ensure bio is not empty
        if not bio:
            return render_template("edit_profile.html", method="bio", 
                    message="Nothing has changed", 
                    error_message="missing"
                )

        # Query to update user's bio
        db.execute("UPDATE users SET bio=? WHERE id=?", bio, session["user_id"])

        # Rediect to home page
        return redirect("/")

    # User reached route via GET
    else:
        return render_template("edit_profile.html", method="bio")

@app.route("/edit_email", methods=["POST", "GET"])
@login_required
def edit_email():

    # User reached route via POST
    if request.method == "POST":

        # Initialize
        email = request.form.get("email").strip()
        password = request.form.get("password")

        # Query to get username and hash
        row = db.execute("SELECT username, hash FROM users WHERE id=?", session["user_id"])

        # Query to get similar email
        similar_email = db.execute("SELECT email FROM users WHERE email=?", email)
        
        # Ensure email is not empty
        if not email:
            return render_template("edit_profile.html", method="email", 
                message="Email Cannot Be Empty", 
                error_message="missing"
            )

        # Ensure password is not empty
        elif not password:
            return render_template("edit_profile.html", method="email", 
                message="Password Cannot Be Empty", 
                error_message="missing"
            )
        
        # Ensure password is correct
        elif not check_password_hash(row[0]["hash"], password):
            return render_template("edit_profile.html", method="email", 
                message="Password Incorrect", 
                error_message="match"
            )

        # Ensure email doesn't exist in the database
        elif len(similar_email) != 0:
            return render_template("edit_profile.html", method="email", 
                message="Email already exists", 
                error_message="exists"
            )
        
        # Ensure email is valid
        elif email_validator(email) != None:
            return render_template("edit_profile.html", method="email", 
                message=email_validator(email), 
                error_message="missing"
            )

        # Update user's email
        db.execute("UPDATE users SET email=? WHERE id=?", email, session["user_id"])
        
        # Generating random code
        code = code_generator()

        # Send email
        with mail.connect() as conn:
            message = f"Welcome {row[0]['username']}!\nYou just changed your email\nUse this code to confirm your new email: {code}"
            subject = "Welcome Champ to LivingDreams.com!"
            msg = Message(recipients=[email],
                        body=message,
                        subject=subject)

            conn.send(msg)

        # Quering to update the code
        db.execute("UPDATE users SET code=? WHERE id=?", code, session["user_id"])

        # Temporarily getting user's id to enable some functions
        session["temp_id"] = email

        # Query to specify that the user's account is not confirmed
        db.execute("UPDATE users SET confirmed=0 WHERE email=?", session["temp_id"])

        # User redirected to confirm account
        return redirect("/confirm_account")

    # User reached route via GET   
    else:
        return render_template("edit_profile.html", method="email")

@app.route("/edit_username", methods=["POST", "GET"])
@login_required
def edit_username():

    # User reached route via POST
    if request.method == "POST":

        # Initialize
        username = request.form.get("username").strip().lower()
        password = request.form.get("password")

        # Query to get user's hash
        hash = db.execute("SELECT hash FROM users WHERE id=?", session["user_id"])

        # Query to similar username
        rows = db.execute("SELECT username FROM users WHERE username=?", username)

        # Ensure username is not empty
        if not username:
            return render_template("edit_profile.html", method="username", 
                    message="Username cannot be empty", 
                    error_message="missing"
                )

        # Ensure empty password is not empty
        elif not password:
            return render_template("edit_profile.html", method="username", 
                    message="Password cannot be empty", 
                    error_message="missing"
                )

        # Ensure password is correct
        elif not check_password_hash(hash[0]["hash"], password):
            return render_template("edit_profile.html", method="username", message="Invalid password", error_message="match")

        # Ensure username doesn't already exists
        elif len(rows) != 0:
            return render_template("edit_profile.html", method="username", 
                    message="Username already exists", 
                    error_message="exists"
                )

        # Query to update user's username
        db.execute("UPDATE users SET username=? WHERE id=?", username, session["user_id"])

        # Redirect to home page
        return redirect("/")
    
    # User reached route via GET
    else:
        return render_template("edit_profile.html", method="username")

@app.route("/edit_profile")
@login_required
def edit_profile():

    # Return edit profile page (#DEFAULT username)
    return render_template("edit_profile.html", method="username")

@app.route("/survey", methods=["POST", "GET"])
@login_required
def survey():

    # User reached route via POST
    if request.method == "POST":

        # Initialize
        Category = ["Sport", "Academics", "Technology", "Business", "Lifestyle", "Health"]
        name = request.form.get("name").strip()
        challenge = int(request.form.get("challenge"))
        category = request.form.get("category")
        frequency = int(request.form.get("freq"))

        # Ensure name is not empty
        if not name:
            return render_template("survey.html", message="You have to specify name")
    
        # Ensure challenge is not empty
        elif not challenge:
            return render_template("survey.html", message="Challenge not specified")
    
        # Ensure frequency is not empty
        elif not frequency:
            return render_template("survey.html", message="Frequency not specified")
        
        # Ensure category is valid
        elif not category in Category:
            return render_template("survey.html", message="Category corrupt. Try reloading the webpage")
            
        # Ensure challenge is valid
        elif not challenge in range(1, 4):
            return render_template("survey.html", message="Challenge corrupt. Try reloading the webpage")

        # Ensure frequency is in range (valid)
        elif not frequency in range(1, 13):
            return render_template("survey.html", message="Frequency corrupt. Try reloading the webpage")
        
        # Query to insert user challenge/journey information
        db.execute("INSERT INTO challenges (name, category, level, dedication) VALUES (?, ?, ?, ?)", 
                name, 
                category, 
                int(challenge), 
                int(frequency)
            )

        # Query to get id of the user's challenge info
        challenges_name_id = db.execute("SELECT id FROM challenges WHERE name=? AND category=? AND level=? AND dedication=?", 
                name, 
                category, 
                int(challenge), 
                int(frequency)
            )

        # Query to update user challenges id
        db.execute("UPDATE users SET challenges_id=? WHERE id=?", challenges_name_id[0]["id"], session["user_id"])

        # Query to specify that the user is has filled in the form
        db.execute("UPDATE users SET new=0 WHERE id=?", session["user_id"])

        # Redirect to profiles
        return redirect("/profile")

    # User reached route via GET
    else:

        # Query to get new information
        new = db.execute("SELECT new FROM users WHERE id=?", session["user_id"])
    
        # Checking if the user is new
        if new[0]["new"] == 1:

            # Redirect user to profile
            return render_template("survey.html")

        else:

            # Redirect user to login
            return redirect("/")

@app.route("/post", methods=["POST", "GET"])
@login_required
def post(): 

    if request.method == "POST":

        try:

            # Initialize
            caption = request.form.get("caption").strip()
            file = request.files["file"]
            crop_x = int(float(request.form.get("x")))
            crop_y = int(float(request.form.get("y")))
            crop_width = int(float(request.form.get("width")))
            crop_height = int(float(request.form.get("height")))

        except ValueError:
            pass

        # Ensure file is not empty
        if file.filename != "":

                # Ensure image is allowed
                if file and allowed_file(file.filename):

                    # Ensure image is secured
                    filename = secure_filename(file.filename)

                    # Rename image
                    file_path = rename_file(file.filename, type="post")

                    # Save the original image
                    file.save(os.path.join(app.config['UPLOAD_FOLDER'], file_path))

                    # Read image
                    img = cv2.imread(f"{app.config['UPLOAD_FOLDER']}/{file_path}")
                    
                    # Ensure these values are not empty
                    if crop_x < 0:
                        crop_x = 0

                    if crop_y < 0:
                        crop_y = 0

                    # Crop image
                    crop_img = img[crop_y:crop_y+crop_height, crop_x:crop_x+crop_width]

                    # Save cropped image
                    cv2.imwrite(f"{app.config['UPLOAD_FOLDER']}/{file_path}", crop_img)

                    if not caption:

                        # Querying to update user's profile picture
                        db.execute("INSERT INTO posts (user_id, post_address, posted_on) VALUES (?, ?, ?)", 
                                session["user_id"], 
                                file_path, 
                                date.today()
                            )

                    else:
                        
                        # Querying to update user's profile picture
                        db.execute("INSERT INTO posts (user_id, post_address, posted_on, caption) VALUES (?, ?, ?, ?)", 
                                session["user_id"], 
                                file_path, 
                                date.today(),
                                caption
                            )

                # Ensure image is allowed and not corrupt
                else:
                    return render_template("post.html", 
                            message="Image not allowed or corrupt", 
                            error_message="match"
                        )

        # Ensure an image was selected   
        else:
            return render_template("post.html", 
                        message="Choose an image file", 
                        error_message="missing"
            )

        # Redirecting to home
        return redirect("/")

    # User reached route via GET
    else:
        return render_template("post.html")

@app.route("/tips", methods=["POST", "GET"])
@login_required
def tips():

    # User reached route via POST
    if request.method == "POST":

        # Initialize
        tip = request.form.get("tip").strip()

        # Ensure tip is not empty
        if not tip:
            return render_template("tips_challenge.html", tips=tips, routes="tips", message="Tip is empty")

        # Query to insert a tip to the database
        db.execute("INSERT INTO tips (tip, posted_on, user_id) VALUES (?, ?, ?)", tip, date.today(), session["user_id"])

        # Redirect to tips
        return redirect("/tips")

    # User reached route via GET
    else:

        # Query to get tips
        tips = db.execute("SELECT * FROM tips WHERE user_id=?", session["user_id"])

        # Query to get (Started On) 
        started_on = db.execute("SELECT started_on FROM users WHERE id=?", session["user_id"])

        # Query to get user's challenge id
        challenges_id = db.execute("SELECT challenges_id FROM users WHERE id=?", session["user_id"])

        # Query to get user's challenge
        challenge = db.execute("SELECT level FROM challenges WHERE id=?", challenges_id[0]["challenges_id"])     

        # Render HTML page
        return render_template("tips_challenges.html", tips=tips, 
                route="tips", 
                started_on=started_on[0]["started_on"], 
                challenge=challenge[0]["level"]
            )

@app.route("/challenges", methods=["POST", "GET"])
@login_required
def challenges():

    # User reached route via POST
    if request.method == "POST":

        # Initialize
        challenge = request.form.get("challenge").strip()

        # Ensure challenge is not empty
        if not challenge:
            return render_template("tips_challenges.html", route="challenge", message="Challenge is empty")

        # Query to insert user challenge
        db.execute("INSERT INTO user_challenges (challenge, posted_on, user_id) VALUES (?, ?, ?)", 
                challenge, 
                date.today(), 
                session["user_id"]
            )

        # Redirect
        return redirect("/challenges")

    # User reached route via GET
    else:
        
        # Query to user's challenges
        challenges = db.execute("SELECT * FROM user_challenges WHERE user_id=?", session["user_id"])

        # Query to get (Started On) {WHEN DID THE USER OPEN HIS/HER ACCOUNT}
        started_on = db.execute("SELECT started_on FROM users WHERE id=?", session["user_id"])

        # Query to get user's challenge id
        challenges_id = db.execute("SELECT challenges_id FROM users WHERE id=?", session["user_id"])

        # Query to get user's challenge
        challenge = db.execute("SELECT level FROM challenges WHERE id=?", challenges_id[0]["challenges_id"])

        # Render HTML
        return render_template("tips_challenges.html", route="challenge", 
                challenges=challenges, 
                challenge=challenge[0]["level"], 
                started_on=started_on[0]["started_on"]
            )

@app.route("/increase_likes", methods=["POST"])
def increase_likes():

    # Payload from the client side
    payload = request.get_json(force=True)

    # Query to insert the like
    db.execute("INSERT INTO likes (content_id, content_type, user_id, date) VALUES (?, ?, ?, ?)", 
            int(payload["id"]), 
            payload["type"], 
            session["user_id"], 
            date.today()
        )

    # Check if the type is tips
    if payload["type"] == "tips":

        # Query to get likes of a tip
        likes = db.execute("SELECT likes FROM tips WHERE id=?", int(payload["id"]))

        # Query to update likes
        db.execute("UPDATE tips SET likes=? WHERE id=?", likes[0]["likes"] + 1, int(payload["id"]))

    elif payload["type"] == "posts":

        # Query to get likes of a post
        likes = db.execute("SELECT likes FROM posts WHERE id=?", int(payload["id"]))

        # Query to update likes
        db.execute("UPDATE posts SET likes=? WHERE id=?", likes[0]["likes"] + 1, int(payload["id"]))
    
    # Return success
    return {"result": "success"}

@app.route("/decrease_likes", methods=["POST"])
def decrease_likes():

    # Payload from client side
    payload = request.get_json(force=True)

    # Query to delete like connection
    db.execute("DELETE FROM likes WHERE content_id=? AND content_type=? AND user_id=?", 
            int(payload["id"]), 
            payload["type"], 
            session["user_id"]
        )

    # Check the type of the payload 
    if payload["type"] == "tips":

        # Query to get likes
        likes = db.execute("SELECT likes FROM tips WHERE id=?", int(payload["id"]))

        # Query to update likes
        db.execute("UPDATE tips SET likes=? WHERE id=?", 
                likes[0]["likes"] - 1, 
                int(payload["id"])
            )

    elif payload["type"] == "posts":

        # Query to get likes
        likes = db.execute("SELECT likes FROM posts WHERE id=?", int(payload["id"]))

        # Query to update likes
        db.execute("UPDATE posts SET likes=? WHERE id=?", 
                likes[0]["likes"] - 1, 
                int(payload["id"])
            )
    
    # Return success
    return {"result": "success"}

@app.route("/delete", methods=["POST"])
def delete():

    # Payload from client side
    payload = request.get_json(force=True)

    # Check type
    if payload["type"] == "tips":

        # Query to delete tip
        db.execute("DELETE FROM tips WHERE id=?", int(payload["id"]))

    elif payload["type"] == "challenges":

        # Query to delete user's challenge
        db.execute("DELETE FROM user_challenges WHERE id=?", int(payload["id"]))

    elif payload["type"] == "posts":

        # Query to delete user's post
        db.execute("DELETE FROM posts WHERE id=?", int(payload["id"]))
 
    # Query to delete all likes connected to the tip
    db.execute("DELETE FROM likes WHERE content_id=? AND content_type=?", 
            int(payload["id"]), 
            payload["type"]
        )

    # Query to delete all comments connected to the tip
    db.execute("DELETE FROM comments WHERE content_id=? AND content_type=?", 
            int(payload["id"]), 
            payload["type"]
        )

    # Return success
    return {"result": "success"}

@app.route("/display_likes", methods=["POST"])
def display_likes():

    # Payload from client side
    payload = request.get_json(force=True)

    # Query to get the likes 
    likes = db.execute("SELECT username, image FROM users INNER JOIN likes ON users.id = likes.user_id WHERE content_id=? AND content_type=?", 
            int(payload["id"]), 
            payload["type"]
        )

    # Return likes
    return jsonify(likes)

@app.route("/add_comment", methods=["POST"])
def add_comment():

    # Payload from client side
    payload = request.get_json(force=True)

    # Ensure comment is not empty
    if len(payload["comment"].strip()) > 0:

        # Query to insert a new comment
        db.execute("INSERT INTO comments (comment, content_id, content_type, user_id) VALUES (?, ?, ?, ?)", 
                payload["comment"].strip(), 
                int(payload["id"]), 
                payload["type"], 
                session["user_id"]
            )

        # Return success
        return {"result": "success"}

    else:

        # Return failure
        return {"result": "failure"}

@app.route("/display_comments", methods=["POST"])
def display_comments():

    # Payload form client side
    payload = request.get_json(force=True)

    # Query to get comments
    response = db.execute("SELECT username, image, comment FROM users INNER JOIN comments ON users.id = comments.user_id WHERE content_id=? AND content_type=?", 
            int(payload["id"]), 
            payload["type"]
        )

    # Return response (comments)
    return jsonify(response)

@app.route("/search", methods=["POST", "GET"])
@login_required
def search():

    # User reached route via POST
    if request.method == "POST":

        # Payload from client side
        payload = request.get_json(force=True)

        # Query to get information of the search
        response = db.execute("SELECT username, image, bio, started_on, name, dedication, level FROM users INNER JOIN challenges ON users.challenges_id=challenges.id WHERE username LIKE ?", 
                f"%{payload['search'].strip()}%"
            )

        # Check if response is not empty
        if len(response) > 0:
            return jsonify(response)
        else: 
            return jsonify([{"result": "empty"}])

    # User reached route via GET 
    else:

        # Query to get user's followers
        followers = db.execute("SELECT COUNT(follower_id) AS followers FROM connections WHERE followed_id=?", session["user_id"])

        # Render tenplate
        return render_template("search.html", followers=followers[0]["followers"])

@app.route("/get_posts", methods=["POST"])
def get_posts():

    # Payload from client side
    payload = request.get_json(force=True)

    # Query to get posts
    posts = db.execute("SELECT posts.id, post_address, likes, posted_on FROM posts INNER JOIN users ON posts.user_id=users.id WHERE username=?", 
            payload["name"].strip()
        )

    # Return response
    return jsonify(posts)

@app.route("/likes_count", methods=["POST"])
def likes_posts():

    # Payload from client side
    payload = request.get_json(force=True)

    # Query to get likes
    likes = db.execute("SELECT likes FROM posts WHERE post_address=?", payload["address"].strip())

    # Return response
    return jsonify(likes)

@app.route("/liked_by", methods=["POST"])
def liked_by():

    # Payload from the client side
    payload = request.get_json(force=True)

    if payload["type"] == "posts":

        # Query to get id of the post
        post_id = db.execute("SELECT id FROM posts WHERE post_address=?", payload["address"])

    elif payload["type"] == "tips":

        # Query to get id of the tip
        post_id = db.execute("SELECT id FROM tips WHERE id=?", payload["address"])

    elif payload["type"] == "challenges":

        # Query to get id of the user_challenge
        post_id = db.execute("SELECT id FROM user_challenges WHERE id=?", payload["address"])

    # Query to get likes
    liked = db.execute("SELECT * FROM likes WHERE user_id=? AND content_type=? AND content_id=?", 
            session["user_id"], 
            payload["type"], 
            post_id[0]["id"]
        )

    # Check if user liked the post
    if (len(liked) > 0):
        return jsonify({'results':'True'})

    else:
        return jsonify({'results':'False'})

@app.route("/get_caption", methods=["POST"])
def get_caption():

    # Payload from client side
    payload = request.get_json(force=True)

    # Query to get caption
    caption = db.execute("SELECT caption FROM posts WHERE id=?", payload["id"])

    # Return response
    return jsonify(caption)

@app.route("/connections", methods=["POST"])
def connections():

    # Query to get payload
    payload = request.get_json(force=True)

    # Query to count followers
    followers = db.execute("SELECT COUNT(follower_id) AS followers FROM connections INNER JOIN users ON connections.followed_id=users.id WHERE username LIKE ?", 
            f"%{payload['search']}%"
        )

    # Query to get followers
    connection = db.execute("SELECT username FROM users INNER JOIN connections ON users.id=connections.followed_id WHERE username=? AND follower_id=?", payload["search"], session["user_id"])

    # Check if user's followers
    if len(connection) > 0:

        followers[0]["connection"] = "true"
        return jsonify(followers)

    else:

        followers[0]["connection"] = "false"
        return jsonify(followers)

@app.route("/follow", methods=["POST"])
def follow():

    # Payload from client-side
    payload = request.get_json(force=True)

    # Query to id 
    user_id = db.execute("SELECT id FROM users WHERE username=?", payload["username"])

    # Check id
    if user_id[0]["id"] == session["user_id"]:

        # Return response
        return jsonify([{"results": "failure"}])

    else:

        # Query to get followers
        connection = db.execute("SELECT * FROM connections WHERE followed_id=? AND follower_id=?", user_id[0]["id"], session["user_id"])

        # Ensure connection doesn't exist (The user isn't already following)
        if len(connection) > 0:

            # Return response
            return jsonify([{"results": "exists"}])

        else:

            # Query to insert connection
            db.execute("INSERT INTO connections (followed_id, follower_id) VALUES (?, ?)", user_id[0]["id"], session["user_id"])

            # Return response
            return jsonify([{"results": "success"}])

@app.route("/unfollow", methods=["POST"])
def unfollow():

    # Payload from client-side
    payload = request.get_json(force=True)

    # Query to get id
    followed_id = db.execute("SELECT id FROM users WHERE username=?", payload["username"])

    # query to delete connection
    db.execute("DELETE FROM connections WHERE followed_id=? AND follower_id=?", followed_id[0]["id"], session["user_id"])

    # Return response
    return jsonify([{"results": "success"}])


@app.route("/privacy_policy")
def privacy_policy():

    return render_template("privacy_policy.html")

@app.route("/authors")
def authors():

    return render_template("authors.html")

@app.route("/report_bug", methods=["POST", "GET"])
@login_required
def report_bug():

    # User reached route via POST
    if request.method == "POST":

        # Initialize
        bug = request.form.get("bug").strip()

        # Ensure bug is not empty
        if not bug:

            # Render template with meassage
            return render_template("report_bug.html", message="No bug description was recieved.")

        # Send email
        with mail.connect() as conn:
            message = f"Bug reported on {date.today()},\n{bug}"
            subject = "Bug Found on LivingDreams.rocks!"
            msg = Message(recipients=[email_config("living_dreams.reply")],
                        body=message,
                        subject=subject)

            conn.send(msg)

        # Render template with success
        return render_template("report_bug.html", success=True)

    # User reached route via GET
    else:

        # Render template
        return render_template("report_bug.html")

@app.route("/journeys", methods=["POST", "GET"])
@login_required
def journeys():

    return render_template("journeys.html")

@app.route("/fetch_all", methods=["POST"])
def fetch_all():

    # Paload from client side
    payload = request.get_json(force=True)

    # Check type
    if payload["type"] == "posts":

        # Query to get posts
        posts = db.execute("SELECT username, image, posts.id, user_id, post_address, likes, posted_on, caption FROM users INNER JOIN posts ON users.id=posts.user_id")

    elif payload["type"] == "tips":

        # Query to get tips
        posts = db.execute("SELECT users.username, users.image, users.started_on, tips.* FROM users INNER JOIN tips ON users.id=tips.user_id")

    elif payload["type"] == "challenges":

        # Query to get challenges
        posts = db.execute("SELECT users.username, users.image, users.started_on, user_challenges.* FROM users INNER JOIN user_challenges ON users.id=user_challenges.user_id")

    # Return response
    return jsonify(posts)