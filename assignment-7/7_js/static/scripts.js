/**
 * Assignment 7
 */

/** Load the list of albums */
function listAlbums() {
  fetch("/albums", {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
    .then((res) => res.json())
    .then((res) => {
      res.forEach((album) => {
        document
          .getElementById("albums_list")
          .insertAdjacentHTML(
            "beforeend",
            `<li data-album-id="${album.album_id}"><a href="#">${album.artist} - ${album.name}</a></li>`
          );
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

/** Show details of a given album */
function showAlbum(album_id) {
  if (album_id == null) return;

  fetch(`/albuminfo?album_id=${album_id}`, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
    .then((res) => res.json())
    .then((res) => {
      document.getElementById("album_cover").innerHTML = `
        <img src="${res.image}" />
      `;
      document.getElementById("album_songs").innerHTML = `
        <table>
        <tr>
          <th>No.</th>
          <th>Title</th>
          <th>Length</th>
        </tr>
        ${res.tracks
          .map(
            (track, idx) => `<tr>
          <td class="song_no">${idx + 1}.</td>
          <td class="song_title">${track.name}</td>
          <td class="song_length">${track.duration}</td>
        </tr>`
          )
          .join("\n")}
        <tr>
          <td colspan="2"><strong>Total length:</strong></td>
          <td class="song_length"><strong>${res.tracks
            .reduce(
              (acc, val) => {
                const [min, sec] = val.duration.split(":").map(Number);
                return sec + acc[1] >= 60
                  ? [acc[0] + min + 1, acc[1] + sec - 60]
                  : [acc[0] + min, acc[1] + sec];
              },
              [0, 0]
            )
            .map((x) => x.toString().padStart(2, "0"))
            .join(":")}</strong></td>
        </tr>
        </table>
      `;
    })
    .catch((err) => {
      console.log(err);
    });
}

document.addEventListener("click", (evt) => {
  showAlbum(
    evt.target.closest("li[data-album-id]")?.getAttribute("data-album-id")
  );
});
