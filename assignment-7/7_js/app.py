"""
Assignment #7: AJAX
"""

from flask import Flask, request, g
import csv, json

app = Flask(__name__)


class Albums():
    """Class representing a collection of albums."""

    def __init__(self, albums_file, tracks_file):
        self.__albums = {}
        self.__load_albums(albums_file)
        self.__load_tracks(tracks_file)

    def __load_albums(self, albums_file):
        """Loads a list of albums from a file."""
        with open(albums_file, newline="") as tsvfile:
            albums_reader = csv.reader(tsvfile, delimiter="\t")
            for album in albums_reader:
                self.__albums[album[0]] = {
                    "album_id": album[0],
                    "artist": album[1],
                    "name": album[2],
                    "image": f"static/images/{album[3]}",
                    "tracks": [],
                }

    def __load_tracks(self, tracks_file):
        """Loads a list of tracks from a file."""
        with open(tracks_file, newline="") as tsvfile:
            tracks_reader = csv.reader(tsvfile, delimiter="\t")
            for track in tracks_reader:
                self.__albums[track[0]]["tracks"].append({
                    "name": track[1],
                    "duration": track[2],
                })

    def get_albums(self):
        """Returns a list of all albums, with album_id, artist and title."""
        return list(self.__albums.values())

    def get_album(self, album_id):
        """Returns all details of an album."""
        return self.__albums[album_id]


# the Albums class is instantiated and stored in a config variable
# it's not the cleanest thing ever, but makes sure that the we load the text files only once
app.config["albums"] = Albums("data/albums.txt", "data/tracks.txt")


@app.route("/albums")
def albums():
    """Returns a list of albums (with album_id, author, and title) in JSON."""
    albums = app.config["albums"]
    return json.dumps(albums.get_albums())


@app.route("/albuminfo")
def albuminfo():
    albums = app.config["albums"]
    album_id = request.args.get("album_id", None)
    if album_id:
        return json.dumps(albums.get_album(album_id))
    return ""


@app.route("/sample")
def sample():
    return app.send_static_file("index_static.html")


@app.route("/")
def index():
    return app.send_static_file("index.html")


if __name__ == "__main__":
    app.run()
