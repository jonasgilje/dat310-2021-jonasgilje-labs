import sqlite3
from sqlite3 import Error
from datetime import date, timedelta
from contextlib import contextmanager
import random
from sqlite3.dbapi2 import Cursor, apilevel
from werkzeug.security import generate_password_hash, check_password_hash

DATABASE = r"./database.db"


def create_connection(dbfile):
    conn = None
    try:
        conn = sqlite3.connect(dbfile)
        return conn
    except Error as e:
        print(e)

    return conn


sql_create_users_table = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    firstName TEXT,
    lastName TEXT,
    telephone TEXT,
    email TEXT UNIQUE,
    isAdmin INTEGER,
    regDate TEXT,
    passwordHash TEXT,
    cabinFiltersJson TEXT
)
"""

sql_create_cabins_table = """
CREATE TABLE IF NOT EXISTS cabins (
    id INTEGER PRIMARY KEY,
    name TEXT,
    buildDate TEXT,
    location TEXT,
    capacity INTEGER,
    price INTEGER,
    imageURL TEXT
)
"""

sql_create_reservations_table = """
CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY,
    reservedBy INTEGER NOT NULL,
    cabinId INTEGER NOT NULL,
    paidFor INTEGER,
    verified INTEGER,
    startDate TEXT,
    endDate TEXT,
    regDate TEXT,
    provisionsJson TEXT,
    persons INTEGER,
    totalPrice INTEGER,
    FOREIGN KEY (reservedBy) REFERENCES users (id),
    FOREIGN KEY (cabinId) REFERENCES cabins (id) 
)
"""

sql_create_products_table = """
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    price INTEGER
)
"""

sql_create_inventory_table = """
CREATE TABLE IF NOT EXISTS inventory (
    cabinId INTEGER,
    productId INTEGER,
    amount INTEGER,
    PRIMARY KEY (cabinId, productId),
    FOREIGN KEY (cabinId) REFERENCES cabins (id),
    FOREIGN KEY (productId) REFERENCES products (id)
)
"""


@contextmanager
def con_man(_dbfile):
    conn = create_connection(_dbfile)
    yield conn
    conn.close()


def create_table(conn, create_table_sql):
    try:
        cur = conn.cursor()
        cur.execute(create_table_sql)
    except Error as e:
        print(e)


def add_user(conn, f_name, l_name, tel, email, is_admin, password):
    sql = """ INSERT INTO users(firstName, lastName, telephone, email, isAdmin, regDate, passwordHash)
              VALUES (?, ?, ?, ?, ?, ?, ?) """
    try:
        cur = conn.cursor()
        cur.execute(
            sql,
            (
                f_name,
                l_name,
                tel,
                email,
                int(is_admin),
                date.today().isoformat(),
                generate_password_hash(password),
            ),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        raise ValueError()
    except Error as e:
        print(e)
        raise e


def add_cabin(conn, name, build_date, location, capacity, price, imageURL):
    sql = """ INSERT INTO cabins(name, buildDate, location, capacity, price, imageURL)
              VALUES (?, ?, ?, ?, ?, ?) """

    try:
        cur = conn.cursor()
        cur.execute(sql, (name, build_date, location, capacity, price, imageURL))
        conn.commit()
    except Error as e:
        print(e)
        raise e


def add_reservation(
    conn,
    reserved_by,
    cabin_id,
    start_date,
    end_date,
    persons,
    total_price,
    provisions_json="[]",
    paid_for=False,
    verified=False,
):
    reg_date = date.today().isoformat()
    sql = """ INSERT INTO reservations(reservedBy, cabinId, startDate, endDate, regDate,
                                       persons, totalPrice, provisionsJson, paidFor, verified)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) """
    try:
        cur = conn.cursor()
        cur.execute(
            sql,
            (
                reserved_by,
                cabin_id,
                start_date,
                end_date,
                reg_date,
                persons,
                total_price,
                provisions_json,
                int(paid_for),
                int(verified),
            ),
        )
        conn.commit()
    except Error as e:
        print(e)
        raise e


def add_product(conn, name, price):
    sql = " INSERT INTO products(name, price) VALUES (?, ?) "
    try:
        cur = conn.cursor()
        cur.execute(sql, (name, price))
        conn.commit()
    except Error as e:
        print(e)
        raise e


def add_inventory(conn, cabinid, productid, amount):
    sql = """ INSERT INTO inventory(cabinId, productid, amount) 
              VALUES (?, ?, ?) """
    try:
        cur = conn.cursor()
        cur.execute(sql, (cabinid, productid, amount))
        conn.commit()
    except Error as e:
        print(e)


def init_users(conn):
    init = [
        (
            "Jonas Emanuel",
            "Gilje",
            "+47 41 35 56 43",
            "1jonasgilje@gmail.com",
            True,
            "Jonas123",
        ),
        ("Ola", "Nordmann", "12 34 56 87", "ola@nordmann.no", False, "OlaErBest"),
        ("Kari", "Nordmann", "98 76 54 32", "kari@nordmann.no", False, "KariKari"),
    ]

    for u in init:
        add_user(conn, *u)


def init_cabins(conn):
    init = [
        (
            "Dokkolstølen",
            "2019-06-29",
            "58.80321\u00b0N, 6.214114\u00b0E",
            5,
            50,
            "dokkol.jpg",
        ),
        (
            "Dirdalsstølen",
            "1720-01-01",
            "58.8307\u00b0N, 6.1539\u00b0E",
            2,
            100,
            "dirdal.jpg",
        ),
        (
            "Eikeskogstølen",
            "1820-04-20",
            "58.8771597\u00b0N, 6.3553596\u00b0E",
            3,
            60,
            "eikeskog.jpg",
        ),
        (
            "Motlandsstølen",
            "1910-03-14",
            "58.7969\u00b0N, 6.3877\u00b0E",
            10,
            40,
            "motland.jpg",
        ),
        (
            "Råsastølen",
            "1905-02-01",
            "58.8314\u00b0N, 6.2596\u00b0E",
            8,
            1000,
            "raasa.jpg",
        ),
        (
            "Øvre Frøylandsstøl (Gamlestølen)",
            "2021-05-17",
            "58.8031\u00b0N, 6.2141\u00b0E",
            3,
            100,
            "oevrefroeyland.jpg",
        ),
        (
            "Store Haraldsstølen",
            "1849-04-15",
            "59.9170\u00b0N, 10.7274\u00b0E",
            350,
            299_792_458,
            "slottet.jpg",
        ),
        (
            "Åttekantstølen",
            "1955-01-15",
            "58.935426\u00b0N, 5.700401\u00b0E",
            3,
            400,
            "aattekantstoelen.jpg",
        ),
    ]

    for c in init:
        add_cabin(conn, *c)


def init_reservations(conn):
    # bruker cabins til å generere 2 tilfeldige reservasjoner per hytte.
    # blir alltid registrert på første bruker
    user_id = select_users(conn, userid=None)[0]["id"]
    cabins = select_cabins(conn, cabinid=None)

    init = []
    for cabin in cabins:
        cabin_id = cabin["id"]
        cabin_price = cabin["price"]
        cabin_capacity = cabin["capacity"]
        curr_date = date.today()
        # legger til mellom 3 og 7 tilfeldige reservasjoner for hver hytte
        for _ in range(random.randrange(3, 8)):
            jump_dates = random.randrange(3, 17)
            duration = random.randrange(2, 5)
            persons = random.randrange(1, cabin_capacity)
            curr_date = curr_date + timedelta(days=jump_dates)
            start_date = curr_date.isoformat()
            curr_date = curr_date + timedelta(days=duration)
            end_date = curr_date.isoformat()
            init.append(
                (
                    user_id,
                    cabin_id,
                    start_date,
                    end_date,
                    persons,
                    cabin_price * duration * persons,
                )
            )

    for r in init:
        add_reservation(conn, *r)


def init_products(conn):
    init = [
        ("Kvikk lunsj", 40),
        ("Brun lapskaus", 80),
        ("Pulverkaffe", 10),
        ("Tepose", 5),
        ("Hermetiske bønner", 45),
        ("Coca cola", 20),
        ("Fyrstikker", 5),
        ("Vedkubbe", 10),
    ]

    for p in init:
        add_product(conn, *p)


def init_inventories(conn):
    product_ids = select_product_ids(conn)
    cabin_ids = select_cabin_ids(conn)

    # legger til mellom halvparten og alle produkter til hver av hyttene
    for cabinid in cabin_ids:
        products = random.sample(
            product_ids, k=random.randint(len(product_ids) // 2, len(product_ids))
        )
        for productid in products:
            add_inventory(conn, cabinid, productid, random.randint(50, 100))


def select_users(conn, userid):
    cur = conn.cursor()
    fields = (
        "id",
        "firstName",
        "lastName",
        "telephone",
        "email",
        "isAdmin",
        "regDate",
        "cabinFiltersJson",
    )

    if userid is None:
        cur.execute(f"SELECT {', '.join(fields)} FROM users")
    else:
        cur.execute(f"SELECT {', '.join(fields)} FROM users WHERE id=?", (userid,))

    return [dict(zip(fields, tuple_)) for tuple_ in cur]


def select_number_of_admins(conn):
    cur = conn.cursor()
    cur.execute(""" SELECT SUM(isAdmin) FROM users """)
    (number,) = cur.fetchone()
    return number


def update_user(conn, userid, new_values_dict, logged_in_user):
    allowed_fields = [
        "cabinFiltersJson",
        "firstName",
        "lastName",
        "telephone",
        "email",
        "password",
    ]
    if select_users(conn, logged_in_user)[0]["isAdmin"]:
        # admins kan gjøre andre folk admin.
        allowed_fields.append("isAdmin")
    filtered_dict = {
        key: new_values_dict[key]
        for key in allowed_fields
        if key in new_values_dict and new_values_dict[key] is not None
    }
    if not filtered_dict:
        return
    if "password" in filtered_dict:
        filtered_dict["passwordHash"] = generate_password_hash(
            filtered_dict["password"]
        )
        del filtered_dict["password"]
    try:
        cur = conn.cursor()
        cur.execute(
            f""" UPDATE users 
                        SET {", ".join(f"{col}=?" for col in filtered_dict.keys())}
                        WHERE id=? """,
            (*filtered_dict.values(), userid),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        raise ValueError()
    except Error as e:
        print(e)


def update_reservation(conn, reservationid, new_values_dict):
    allowed_fields = ("verified", "paidFor")
    filtered_dict = {
        key: new_values_dict[key]
        for key in allowed_fields
        if key in new_values_dict and new_values_dict[key] is not None
    }
    if not filtered_dict:
        return
    cur = conn.cursor()
    if reservationid is None:
        cur.execute(
            f"UPDATE reservations SET {', '.join(f'{col}=?' for col in filtered_dict.keys())}",
            (*filtered_dict.values(),),
        )
    else:
        cur.execute(
            f""" UPDATE reservations 
                         SET {', '.join(f'{col}=?' for col in filtered_dict.keys())}
                         WHERE id=?""",
            (*filtered_dict.values(), reservationid),
        )
    conn.commit()


def delete_user(conn, userid):
    cur = conn.cursor()
    if userid is None:
        cur.execute(
            """ DELETE FROM reservations
                        WHERE reservedBy IN (
                            SELECT id
                            FROM users
                            WHERE isAdmin=0
                        ) """
        )
        cur.execute("DELETE FROM users WHERE isAdmin=0")

    else:
        cur.execute("DELETE FROM users WHERE id=?", (userid,))
        cur.execute("DELETE FROM reservations WHERE reservedBy=?", (userid,))
    conn.commit()


def delete_reservation(conn, reservationid):
    cur = conn.cursor()
    if reservationid is None:
        cur.execute("DELETE FROM reservations")
    else:
        cur.execute("DELETE FROM reservations WHERE id=?", (reservationid,))
    conn.commit()


def delete_cabin(conn, cabinid):
    cur = conn.cursor()
    if cabinid is None:
        cur.execute("DELETE FROM reservations")
        cur.execute("DELETE FROM inventory")
        cur.execute("DELETE FROM cabins")
    else:
        # sletter tilhørende reservasjoner og lagerbeholdning
        cur.execute("DELETE FROM reservations WHERE cabinId=?", (cabinid,))
        cur.execute("DELETE FROM inventory WHERE cabinId=?", (cabinid,))
        cur.execute("DELETE FROM cabins WHERE id=?", (cabinid,))
    conn.commit()


def select_user_by_email(conn, email):
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email=?", (email,))
    result = cur.fetchone()
    fields = (
        "id",
        "firstName",
        "lastName",
        "telephone",
        "email",
        "isAdmin",
        "regDate",
        "passwordHash",
        "cabinFiltersJson",
    )
    return dict(zip(fields, result))


def select_cabins(conn, cabinid):
    cur = conn.cursor()
    if cabinid is None:
        cur.execute("SELECT * FROM cabins")
    else:
        cur.execute("SELECT * FROM cabins WHERE id=?", (cabinid,))

    fields = ("id", "name", "buildDate", "location", "capacity", "price", "imageURL")
    return [dict(zip(fields, tuple_)) for tuple_ in cur]


def select_cabin_ids(conn):
    cur = conn.cursor()
    cur.execute("SELECT id FROM cabins")
    return [tuple_[0] for tuple_ in cur]


def select_free_cabin_ids(conn, start_date, end_date):
    cur = conn.cursor()
    cur.execute(
        """ SELECT cabinId FROM reservations
                    GROUP BY cabinId
                    HAVING SUM(CASE WHEN ? <= endDate AND 
                                         ? >= startDate
                               THEN 1 ELSE 0 END) = 0 """,
        (start_date, end_date),
    )
    return [tuple_[0] for tuple_ in cur]


def select_product_ids(conn):
    cur = conn.cursor()
    cur.execute("SELECT id, price FROM products")
    return [tuple_[0] for tuple_ in cur]


def select_reservations(conn, reservationid):
    cur = conn.cursor()
    if reservationid is None:
        cur.execute("SELECT * FROM reservations")
    else:
        cur.execute("SELECT * FROM reservations WHERE id=?", (reservationid,))
    fields = (
        "id",
        "reservedBy",
        "cabinId",
        "paidFor",
        "verified",
        "startDate",
        "endDate",
        "regDate",
        "provisionsJson",
        "persons",
        "totalPrice",
    )
    return [dict(zip(fields, tuple_)) for tuple_ in cur]


def select_reservations_by_cabin(conn, cabinid):
    cur = conn.cursor()
    cur.execute("SELECT * FROM reservations WHERE cabinId=?", (cabinid,))

    fields = (
        "id",
        "reservedBy",
        "cabinId",
        "paidFor",
        "verified",
        "startDate",
        "endDate",
        "regDate",
        "provisionsJson",
        "persons",
        "totalPrice",
    )  # todo: fields bør egt. stå øverst.
    return [dict(zip(fields, tuple_)) for tuple_ in cur]


def select_reservations_by_user(conn, userid):
    return select_reservations_by_cabin_and_user(conn, cabinid=None, userid=userid)


def select_reservations_by_cabin_and_user(conn, cabinid, userid):
    cur = conn.cursor()
    reservation_fields = (
        "id",
        "cabinId",
        "paidFor",
        "verified",
        "startDate",
        "endDate",
        "regDate",
        "persons",
        "totalPrice",
        "provisionsJson",
    )
    returned_fields = (*reservation_fields, "cabinName")
    if cabinid is not None:
        cur.execute(
            f""" SELECT {', '.join(f"r.{field}" for field in reservation_fields)}, c.name FROM reservations r
                         INNER JOIN cabins c ON r.cabinId = c.id WHERE r.reservedBy =? AND r.cabinId=? """,
            (userid, cabinid),
        )
    else:
        cur.execute(
            f""" SELECT {', '.join(f"r.{field}" for field in reservation_fields)}, c.name FROM reservations r
                         INNER JOIN cabins c ON r.cabinId = c.id WHERE r.reservedBy =? """,
            (userid,),
        )

    return [dict(zip(returned_fields, tuple_)) for tuple_ in cur]


def select_products(conn):
    cur = conn.cursor()
    cur.execute("SELECT * FROM products")
    fields = ("id", "name", "price")
    return [dict(zip(fields, tuple_)) for tuple_ in cur]


def delete_product(conn, productid):
    cur = conn.cursor()
    cur.execute("DELETE FROM inventory WHERE productId=?", (productid,))
    cur.execute("DELETE FROM products WHERE id=?", (productid,))
    conn.commit()


def select_inventory(conn):
    cur = conn.cursor()
    cur.execute("SELECT * FROM inventory")
    return [tuple_ for tuple_ in cur]


def select_inventory_by_cabin_and_product(conn, cabinid, productid):
    cur = conn.cursor()
    cur.execute(
        "SELECT amount FROM inventory WHERE cabinId=? AND productId=?",
        (cabinid, productid),
    )
    result_list = list(cur)
    if not result_list:
        return 0
    return result_list[0][0]


def select_inventory_by_cabin(conn, cabinid):
    cur = conn.cursor()
    cur.execute(
        """ SELECT p.id, p.name, p.price, i.amount FROM products p 
                    INNER JOIN inventory i ON p.id = i.productId WHERE i.cabinId =? """,
        (cabinid,),
    )

    fields = ("id", "name", "price", "amount")
    return [dict(zip(fields, tuple_)) for tuple_ in cur]


def update_inventory(conn, cabinid, productid, new_amount):
    if (
        new_amount == 0
        or select_inventory_by_cabin_and_product(conn, cabinid, productid) != 0
    ):
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM inventory WHERE cabinId=? AND productId=?",
            (cabinid, productid),
        )
        conn.commit()
    if new_amount != 0:
        add_inventory(conn, cabinid, productid, new_amount)


def valid_login(username, password):
    with con_man(DATABASE) as conn:
        user = select_user_by_email(conn, username)
    if user is None:
        return False
    return check_password_hash(user["passwordHash"], password)


def setup():
    conn = create_connection(DATABASE)
    if conn is None:
        return

    create_table(conn, sql_create_users_table)
    create_table(conn, sql_create_cabins_table)
    create_table(conn, sql_create_reservations_table)
    create_table(conn, sql_create_products_table)
    create_table(conn, sql_create_inventory_table)
    if not select_users(conn, userid=None):
        init_users(conn)
    if not select_cabins(conn, cabinid=None):
        init_cabins(conn)
    if not select_reservations(conn, reservationid=None):
        init_reservations(conn)
    if not select_products(conn):
        init_products(conn)
    if not select_inventory(conn):
        init_inventories(conn)

    conn.close()


if __name__ == "__main__":
    setup()
    with con_man(DATABASE) as conn:
        pass
