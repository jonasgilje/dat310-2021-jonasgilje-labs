from typing import DefaultDict, Type
import db
from flask import abort, Flask, request, send_from_directory, redirect, session
import json
import os, random, string
from PIL import Image

app = Flask(__name__, static_url_path="")
app.secret_key = "a046903eda844db1a75eed72ed287319"
app.config["UPLOAD_FOLDER"] = "./static/img"
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}

# Flask sin dokumentasjon er brukt under utvikling av filopplasting:
# kilde for filoppl. https://flask.palletsprojects.com/en/1.1.x/patterns/fileuploads/


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.errorhandler(404)
def handle_error(e):
    return redirect("/")


@app.route("/api/user")
@app.route("/api/user/<userid>")
def get_user(userid=None):
    with db.con_man(db.DATABASE) as conn:
        users = db.select_users(conn, userid)
    return (json.dumps(users), 200)


@app.route("/api/user/<userid>", methods=["PUT"])
def edit_user(userid):
    session_user = session.get("username", None)
    # må være innlogget for å kunne redigere bruker.
    if session_user is None:
        return ("", 403)
    with db.con_man(db.DATABASE) as conn:
        is_admin = db.select_users(conn, session_user)[0]["isAdmin"]
        # sjekker om man prøver å redigere annens bruker
        if not is_admin and userid != session_user:
            return ("", 403)
        # sjekker om brukeren eksisterer.
        if not db.select_users(conn, userid):
            return ("", 404)
        try:
            db.update_user(conn, userid, request.json, session_user)
        except ValueError:
            # konflikterende data (email er UNIQUE)
            return ("", 409)
    return ("", 200)


@app.route("/api/user", methods=["POST"])
def add_user():
    with db.con_man(db.DATABASE) as conn:
        try:
            db.add_user(
                conn,
                request.json["firstName"],
                request.json["lastName"],
                request.json["telephone"],
                request.json["email"],
                False,  # isAdmin
                request.json["password"],
            )
        except (TypeError, KeyError):
            return ("", 400)  # ufullstendig forespørsel
        except ValueError:
            # konflikterende data (email er UNIQUE)
            return ("", 409)
    return ("", 201)


@app.route("/api/user", methods=["DELETE"])
@app.route("/api/user/<userid>", methods=["DELETE"])
def delete_user(userid=None):
    with db.con_man(db.DATABASE) as conn:
        # sjekker om brukeren finnes
        user = db.select_users(conn, userid)
        if not user:
            return ("", 404)
        # må være innlogget.
        if session.get("username", None) is None:
            return ("", 403)
        is_admin = db.select_users(conn, session["username"])[0]["isAdmin"]
        # kun admins kan slette alle brukere (userid=None)
        if not is_admin and userid is None:
            return ("", 403)
        # vanlige brukere kan kun slette egen konto
        if not is_admin and userid != session["username"]:
            return ("", 403)
        # sjekker om vi er i ferd med å slette den siste admin-brukeren:
        if (
            userid is not None
            and user[0]["isAdmin"]
            and db.select_number_of_admins(conn) == 1
        ):
            return ("", 403)
        db.delete_user(conn, userid)
        if userid is not None and int(userid) == session.get("username", None):
            del session["username"]
            return ("", 205)
    return ("", 200)


@app.route("/api/cabin")
@app.route("/api/cabin/<cabinid>")
def get_cabin(cabinid=None):
    with db.con_man(db.DATABASE) as conn:
        cabins = db.select_cabins(conn, cabinid)
    return (json.dumps(cabins), 200)


@app.route("/api/cabin/free/<fromdate>/<todate>")
def get_free_cabins(fromdate, todate):
    with db.con_man(db.DATABASE) as conn:
        cabins = db.select_free_cabin_ids(conn, fromdate, todate)
    return (json.dumps(cabins), 200)


@app.route("/api/lucky")
def feeling_lucky():
    with db.con_man(db.DATABASE) as conn:
        cabin_ids = db.select_cabin_ids(conn)
    return (json.dumps(cabin_ids), 200)


@app.route("/api/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        if not db.valid_login(request.json["username"], request.json["password"]):
            return ("", 403)
        with db.con_man(db.DATABASE) as conn:
            loggedin_userid = db.select_user_by_email(conn, request.json["username"])[
                "id"
            ]
        session["username"] = loggedin_userid
    else:
        session_user = session.get("username", None)
        if session_user is None:
            return ("", 204)
    with db.con_man(db.DATABASE) as conn:
        user = db.select_users(conn, session["username"])[0]
    user.pop("passwordHash", None)
    return (json.dumps(user), 200)


@app.route("/api/logout", methods=["POST"])
def logout():
    session.pop("username", None)
    return ("", 200)


@app.route("/api/cabin", methods=["POST"])
def add_cabin():
    if request.files.get("image", None) is None:
        return ("", 400)
    try:
        extension = request.files["image"].filename.rsplit(".", 1)[1].lower()
    except IndexError:
        return ("", 400)
    if extension not in ALLOWED_EXTENSIONS:
        return ("", 400)

    # formdata er delt opp i to: json og bildefil
    json_dict = json.loads(request.form["json"])
    image = Image.open(request.files["image"].stream)

    if extension == "png":
        image.load()
        # Konvererterer png til jpeg.
        # kilde: https://stackoverflow.com/questions/9166400/convert-rgba-png-to-rgb-with-pil
        bg = Image.new("RGB", image.size, (255, 255, 255))
        bg.paste(image, mask=image.split()[3])
        image = bg

    # lager nytt filnavn: 32 tegn i [a-zA-Z0-9]. sjanse for to like er 1 : 62 ** 32 = 1 : 2.3e57
    new_file_name = (
        "".join(random.choice(string.ascii_letters + string.digits) for _ in range(32))
        + ".jpg"
    )
    image.save(os.path.join(app.config["UPLOAD_FOLDER"], new_file_name), quality=80)
    with db.con_man(db.DATABASE) as conn:
        db.add_cabin(
            conn,
            json_dict["name"],
            json_dict["buildDate"],
            json_dict["location"],
            json_dict["capacity"],
            json_dict["price"],
            new_file_name,
        )

    return ("", 201)


@app.route("/api/cabin", methods=["DELETE"])
@app.route("/api/cabin/<cabinid>", methods=["DELETE"])
def delete_cabin(cabinid=None):
    with db.con_man(db.DATABASE) as conn:
        # må være innlogget
        loggedin_userid = session.get("username", None)
        if loggedin_userid is None:
            return ("", 403)
        is_admin = db.select_users(conn, loggedin_userid)[0]["isAdmin"]
        # kun admins kan slette alle brukere (userid=None)
        if not is_admin:
            return ("", 403)
        cabin_list = db.select_cabins(conn, cabinid)
        if not cabin_list:
            return ("", 404)
        db.delete_cabin(conn, cabinid)
    return ("", 200)


@app.route("/api/reservation")
@app.route("/api/reservation/<reservationid>")
@app.route("/api/reservation/cabin/<cabinid>")
@app.route("/api/reservation/user/<userid>")
@app.route("/api/reservation/cabin/<cabinid>/user/<userid>")
def get_reservation(reservationid=None, cabinid=None, userid=None):
    with db.con_man(db.DATABASE) as conn:
        if cabinid is not None and userid is not None:
            reservations = db.select_reservations_by_cabin_and_user(
                conn, cabinid, userid
            )
        elif cabinid is not None:
            reservations = db.select_reservations_by_cabin(conn, cabinid)
        elif userid is not None:
            reservations = db.select_reservations_by_user(conn, userid)
        else:  # reservationid=None betyr alle reservasjoner.
            reservations = db.select_reservations(conn, reservationid)
    return (json.dumps(reservations), 200)


@app.route("/api/reservation", methods=["PUT"])
@app.route("/api/reservation/<reservationid>", methods=["PUT"])
def edit_reservation(reservationid=None):
    with db.con_man(db.DATABASE) as conn:
        # må være innlogget
        loggedin_userid = session.get("username", None)
        if loggedin_userid is None:
            return ("", 403)
        is_admin = db.select_users(conn, loggedin_userid)[0]["isAdmin"]
        # kun admins kan slette alle brukere (userid=None)
        if not is_admin:
            return ("", 403)
        if not request.json:
            return ("", 400)

        if request.json.get("verified", False):
            reservations = db.select_reservations(conn, reservationid)

            deduction_tally_dict = {}

            for reservation in reservations:
                try:
                    provisions_list = json.loads(reservation["provisionsJson"])
                except (TypeError, json.JSONDecodeError):
                    continue

                for entry in provisions_list:
                    if reservation["verified"]:
                        continue
                    # legger til antall produkter i entry til dictionary-et som holder telling med totalen.
                    if (
                        reservation["cabinId"],
                        entry["id"],
                    ) not in deduction_tally_dict:
                        deduction_tally_dict[(reservation["cabinId"], entry["id"])] = 0

                    deduction_tally_dict[(reservation["cabinId"], entry["id"])] += int(
                        entry["amount"]
                    )
                    # hvis det ikke er tilstrekkelig antall produtker tilgjengelig til å fullføre forespørselen, returner 409
                    if deduction_tally_dict[
                        (reservation["cabinId"], entry["id"])
                    ] > db.select_inventory_by_cabin_and_product(
                        conn, reservation["cabinId"], entry["id"]
                    ):
                        # konflikterende data (ikke nok produkter)
                        return ("", 409)
            # hvis det ikke er blitt returnert fra forrige løkke, gå gjennom og trekk antall produkter fra lagerbeholdning.
            for k, v in deduction_tally_dict.items():
                entry_cabinid, entry_productid = k
                old_amount = db.select_inventory_by_cabin_and_product(
                    conn, entry_cabinid, entry_productid
                )
                new_amount = old_amount - v
                db.update_inventory(conn, entry_cabinid, entry_productid, new_amount)

        db.update_reservation(conn, reservationid, request.json)
    return ("", 200)


@app.route("/api/reservation", methods=["POST"])
def add_reservation():
    with db.con_man(db.DATABASE) as conn:
        # må være logget inn.
        logged_in_username = session.get("username", None)
        if logged_in_username is None:
            return ("", 403)
        current_cabins_reservations = db.select_reservations_by_cabin(
            conn, request.json["cabinId"]
        )
        for reservation in current_cabins_reservations:
            # check for conflicting dates.
            if (
                request.json["startDate"] <= reservation["endDate"]
                and request.json["endDate"] >= reservation["startDate"]
            ):
                # konflikterende data (reservasjoner overlapper)
                return ("", 409)
        reserved_by = request.json.get("reservedBy", None)
        if reserved_by is None:
            reserved_by = logged_in_username
        db.add_reservation(
            conn,
            reserved_by,
            request.json["cabinId"],
            request.json["startDate"],
            request.json["endDate"],
            request.json["persons"],
            request.json["price"],
            request.json["provisionsJson"],
        )
    # update provisisons
    return ("", 201)


@app.route("/api/reservation", methods=["DELETE"])
@app.route("/api/reservation/<reservationid>", methods=["DELETE"])
def delete_reservation(reservationid=None):
    with db.con_man(db.DATABASE) as conn:
        # må være innlogget
        loggedin_userid = session.get("username", None)
        if loggedin_userid is None:
            return ("", 403)
        is_admin = db.select_users(conn, loggedin_userid)[0]["isAdmin"]
        # sjekker om man prøver å slette annens reservasjon
        try:
            reserved_by = db.select_reservations(conn, reservationid)[0]["reservedBy"]
        except IndexError:
            return ("", 400)  # reservasjon finnes ikke.
        if not is_admin and reserved_by != loggedin_userid:
            return ("", 403)
        db.delete_reservation(conn, reservationid)
    return ("", 200)


@app.route("/api/inventory/<cabinid>/<productid>")
def get_inventory(cabinid, productid):
    with db.con_man(db.DATABASE) as conn:
        amount = db.select_inventory_by_cabin_and_product(conn, cabinid, productid)
    return (json.dumps({"amount": amount}), 200)


@app.route("/api/inventory/<cabinid>/<productid>", methods=["POST", "PUT", "DELETE"])
def edit_inventory(cabinid, productid):
    with db.con_man(db.DATABASE) as conn:
        # må være innlogget
        loggedin_userid = session.get("username", None)
        if loggedin_userid is None:
            return ("", 403)
        is_admin = db.select_users(conn, loggedin_userid)[0]["isAdmin"]

        # må være admin
        if not is_admin:
            return ("", 403)

        # sjekker gyldig hytte-ID
        if int(cabinid) not in db.select_cabin_ids(conn):
            return ("", 404)
        # sjekker at produkt-id finnes
        if int(productid) not in db.select_product_ids(conn):
            return ("", 404)

        old_amount = db.select_inventory_by_cabin_and_product(conn, cabinid, productid)
        if request.json:
            amount = int(request.json.get("amount", 0))
        else:
            amount = 0
        db.update_inventory(conn, cabinid, productid, amount)
    if amount == 0:
        return ("", 204)
    elif old_amount == 0:
        return ("", 201)
    return ("", 200)


@app.route("/api/products/cabin/<cabinid>")
def get_products_on_cabin(cabinid):
    with db.con_man(db.DATABASE) as conn:
        inventory = db.select_inventory_by_cabin(conn, int(cabinid))
    return (json.dumps(inventory), 200)


@app.route("/api/products")
def get_products():
    with db.con_man(db.DATABASE) as conn:
        products = db.select_products(conn)
    return (json.dumps(products), 200)


@app.route("/api/products", methods=["POST"])
def add_product():
    with db.con_man(db.DATABASE) as conn:
        # må være innlogget
        loggedin_userid = session.get("username", None)
        if loggedin_userid is None:
            return ("", 403)
        is_admin = db.select_users(conn, loggedin_userid)[0]["isAdmin"]

        # må være admin
        if not is_admin:
            return ("", 403)
        try:
            name = request.json["name"]
            if name.strip() == "":
                raise ValueError()
            price = int(request.json["price"])
        except (AttributeError, TypeError, KeyError, ValueError):
            return ("", 400)

        db.add_product(conn, name, price)
    return ("", 201)


@app.route("/api/products/<productid>", methods=["DELETE"])
def delete_product(productid):
    with db.con_man(db.DATABASE) as conn:
        # må være innlogget
        loggedin_userid = session.get("username", None)
        if loggedin_userid is None:
            return ("", 403)
        is_admin = db.select_users(conn, loggedin_userid)[0]["isAdmin"]
        # må være admin
        if not is_admin:
            return ("", 403)
        if int(productid) not in db.select_product_ids(conn):
            return ("", 404)

        db.delete_product(conn, productid)
    return ("", 200)


@app.route("/static/img/<image_url>")
def resolve_image_url(image_url):
    return send_from_directory("static/img", image_url)


@app.route("/favicon.ico")
def favicon():
    return send_from_directory("static", "favicon.ico")


if __name__ == "__main__":
    db.setup()
    # app.run(ssl_context='adhoc', debug=True)
    app.run(debug=True, host="0.0.0.0")
