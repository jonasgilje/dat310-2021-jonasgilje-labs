"""
Flask: Using templates
"""

from setup_db import (select_students, select_courses, select_student, 
    select_student_grades, select_course_grades, add_grade as sql_add_grade, 
    add_student as sql_add_student,)
import sqlite3
from flask import Flask, render_template, request, redirect, url_for, g, flash
from collections import Counter

app = Flask(__name__)
app.secret_key = "BAMBOO DRYWIPES Desifix"


DATABASE = './database.db'


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.route("/")
def index():
    # get the database connection
    conn = get_db()
    return render_template("index.html", 
        # select_students executes SELECT SQL statement on database connetion
        # returns list of students
        students=sorted(select_students(conn), key=lambda x: x["student_no"]),
        courses=sorted(select_courses(conn), key=lambda x: x["course_id"].casefold()),)


# Add additional routes here.
@app.route("/course/<course_id>")
def course(course_id):
    conn = get_db()
    grades = sorted(select_course_grades(conn, course_id), key=lambda x:x["grade"])
    grade_count = sorted(Counter(map(lambda x: x["grade"], grades)).items())
    return render_template("course.html", course_id=course_id, grades=grades, 
        grade_count=grade_count)

@app.route("/student/<student_no>")
def student(student_no):
    conn = get_db()
    student_name = select_student(conn, int(student_no))
    student = {"student_no": student_no, "name": student_name}
    grades = select_student_grades(conn, student_no)
    return render_template("student.html", student=student, grades=grades)

@app.route("/add_grade", methods=["GET", "POST"])
def add_grade():
    conn = get_db()
    students = None
    courses = None
    if request.method == "POST":
        form_student = request.form["student"].strip()
        form_course = request.form["course"].strip()
        form_grade = request.form["grade"].strip()

        if form_course == "" or form_student == "" or form_grade == "":
            flash("You need to provide a student, course and grade", "error")
        else:
            error = sql_add_grade(conn, form_course, form_student, form_grade)
            if error is not None:
                flash(error, "error")
            else:
                flash(f"Added grade {form_grade} for {form_student} in course {form_grade}", "success")
                
        if request.form["student_redirect"] == "1":
            students = (form_student,)
        if request.form["course_redirect"] == "1":
            courses = (form_course,)

    student_from_url = request.args.get("student") 
    course_from_url = request.args.get("course") 

    if student_from_url is not None:
        students = (student_from_url,)
    elif students is None:
        students = [x["student_no"] for x in select_students(conn)]

    if course_from_url is not None:
        courses = (course_from_url,)
    elif courses is None:
        courses = [x["course_id"] for x in select_courses(conn)]

    return render_template("add_grade.html", students=students, courses=courses)

@app.route("/add_student", methods=["GET", "POST"])
def add_student():
    conn = get_db()
    if request.method == "POST":
        form_name = request.form["name"].strip()
        if form_name == "":
            flash("Please enter a name!", "error")
        else:
            student_ids = [x["student_no"] for x in select_students(conn)]

            for new_id in range(100_000, 1_000_000):
                if new_id not in student_ids:
                    break
            else:
                raise IndexError("All student numbers used!")

            error = sql_add_student(conn, new_id, form_name)
            if error is not None:
                flash(error, "error")
            else:
                flash(f"Added student {form_name} with no. {new_id}", "success")
                return redirect(url_for("index"))
    return render_template("add_student.html")


if __name__ == "__main__":
    app.run(debug=True)