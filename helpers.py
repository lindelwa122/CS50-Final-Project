import re
from flask import redirect, render_template, request, session
from functools import wraps
from string import punctuation
from re import search
from datetime import date
from string import ascii_lowercase, ascii_uppercase, digits
from random import choice, randrange

def main():
    pass

def apology(message, code=400):
    """Render message as an apology to user."""
    def escape(s):
        """
        Escape special characters.

        https://github.com/jacebrowning/memegen#special-characters
        """
        for old, new in [("-", "--"), (" ", "-"), ("_", "__"), ("?", "~q"),
                         ("%", "~p"), ("#", "~h"), ("/", "~s"), ("\"", "''")]:
            s = s.replace(old, new)
        return s
    return render_template("apology.html", top=code, bottom=escape(message)), code


def login_required(f):
    """
    Decorate routes to require login.

    https://flask.palletsprojects.com/en/1.1.x/patterns/viewdecorators/
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function

def password_validator(password):

    # Ensure password is longer than or equal to 8 characters
    if len(password) < 8:
        return "The length of password must be equal or greater than 8"

    # Ensure password is shorter than 20 characters
    elif len(password) >= 20:
        return "The length of password must be smaller than 20 characters"

    # Ensure password has atleast one number
    elif search("[0-9]",password) is None:
        return "Password must contain atleast one digit"

    # Ensure password has atleat one capital letter
    elif search("[A-Z]",password) is None:
        return "Password must contain atleast one capital letter"

    # Ensure password has atleast one small character
    elif search("[a-z]", password) is None:
        return "Password must contain atleast one small letter"

    # Ensure password has atleat one special character
    for char in password:
        if char in punctuation:
            return None

    return "Password must contain atleast one character"

def rename_file(filename, id="none", type="profile"):
    if type == "profile":
        arr = filename.rsplit(".")
        return f"profile{id}.{arr[1]}"

    elif type == "post":
        arr = filename.rsplit(".")

        lower = ascii_lowercase
        upper = ascii_uppercase
        num = digits

        r = [lower, upper, num]

        random_string = "a"

        random_stop = randrange(30, 65)

        while True:
            c = choice(r)
            random_string += choice(c)
            if len(random_string) == random_stop:
                break

        return f"{random_string}.{arr[1]}"

def get_current(old_date):
    arrOld = old_date.rsplit("-")

    if arrOld[1].startswith("0"):
        arrOld[1] = arrOld[1].replace("0", "")

    old_date = date(int(arrOld[0]), int(arrOld[1]), int(arrOld[2]))

    d = date.today() - old_date

    arr = str(d).rsplit(" ")

    if arr[0].startswith("0"):
        return 0

    return int(arr[0])

def hours_calc(date, hours, challenge, method="completed"):
    if method == "completed":
        return get_current(date) * int(hours)
    elif method == "left":
        challenge = challenge.rsplit(" ")
        return (int(challenge[0]) - get_current(date)) * hours

def email_validator(email):
    email_pattern = "^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
    if (search(email_pattern, email)):
        return None
    else:
        return "Email not Valid"

def code_generator():
    return randrange(100000, 1000000)

def day_calc(old_date):
    arrOld = old_date.rsplit("-")

    if arrOld[1].startswith("0"):
        arrOld[1] = arrOld[1].replace("0", "")

    old_date = date(int(arrOld[0]), int(arrOld[1]), int(arrOld[2]))

    d = date.today() - old_date

    arr = str(d).rsplit(" ")

    if arr[0].startswith("0"):
        return 0

    return int(arr[0])

def posted_on(started, posted):
    arr_started = started.rsplit("-")

    arr_posted = posted.rsplit("-")

    if arr_started[1].startswith("0"):
        arr_started[1] = arr_started[1].replace("0", "")

    if arr_posted[1].startswith("0"):
        arr_posted[1] = arr_posted[1].replace("0", "")

    started_date = date(int(arr_started[0]), int(arr_started[1]), int(arr_started[2]))

    posted_date = date(int(arr_posted[0]), int(arr_posted[1]), int(arr_posted[2]))

    d = posted_date - started_date

    arr = str(d).rsplit(" ")

    if arr[0].startswith("0"):
        return 0

    return int(arr[0])

def hours_calc(date, hours):
    return day_calc(date) * int(hours)

def get_challenge(level):
    if level == 1:
        return 50
    elif level == 2:
        return 75
    else:
        return 100

if __name__ == "__main__":
    main()
