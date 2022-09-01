document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (e) {
    e.preventDefault();
    addBook();
    popUpAlert("Buku udah ditambah ");
  });

  const searchForm = document.getElementById("search-form");
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function popUpAlert(text) {
  const popUp = document.querySelector(".alert-added");

  const emoji = ["😉", "🔥", "❤️", "⚡", "🚀", "👌", "🤙", "👍", "🤗", "✅"];
  let randomIndex = Math.floor(Math.random() * 10);

  popUp.innerText = `${text} ${emoji[randomIndex]}`;
  popUp.classList.add("animate-pop");

  setTimeout(function () {
    popUp.classList.remove("animate-pop");
  }, 3000);
}

function addBook() {
  const title = document.getElementById("input-judul").value;
  const author = document.getElementById("input-penulis").value;
  const year = document.getElementById("input-tahun").value;

  const generateID = generateId();
  const bookObject = generateBookObject(generateID, title, author, year, false);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

const books = [];
const RENDER_EVENT = "render-book";

function makeBook(bookObject) {
  const textTahun = document.createElement("h6");
  textTahun.innerText = bookObject.year;
  textTahun.classList.add("buku-tahun");

  const textPenulis = document.createElement("h4");
  textPenulis.innerText = bookObject.author;
  textPenulis.classList.add("buku-penulis");

  const textJudul = document.createElement("h1");
  textJudul.innerText = bookObject.title;
  textJudul.classList.add("buku-judul");

  const cardText = document.createElement("div");
  cardText.classList.add("card-text");
  cardText.append(textJudul, textPenulis, textTahun);

  const btnDelete = document.createElement("a");
  btnDelete.classList.add("tombol-delete");
  btnDelete.innerHTML = '<i class="bi bi-trash3-fill"></i>';

  btnDelete.addEventListener("click", function () {
    removeBook(bookObject.id);

    popUpAlert("Bukunya udah dihapus ");
  });

  const cardButton = document.createElement("div");
  cardButton.classList.add("card-tombol");
  cardButton.append(btnDelete);

  const bukuCard = document.createElement("div");
  bukuCard.classList.add("buku-card");
  bukuCard.append(cardText, cardButton);

  const bukuContainer = document.createElement("div");
  bukuContainer.setAttribute("id", `book-${bookObject.id}`);
  bukuContainer.classList.add("col-11", "col-md-4", "g-3");
  bukuContainer.append(bukuCard);

  if (bookObject.isComplete) {
    const btnUndo = document.createElement("a");
    btnUndo.classList.add("tombol-undo");
    btnUndo.innerHTML = '<i class="bi bi-arrow-repeat"></i>';

    btnUndo.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);

      popUpAlert("Baca lagi yuk ");
    });

    cardButton.append(btnUndo);
  } else {
    const btnDone = document.createElement("a");
    btnDone.classList.add("tombol-selesai");
    btnDone.innerHTML = '<i class="bi bi-check-lg"></i>';

    btnDone.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);

      popUpAlert("Yeay selesai dibaca ");
    });

    cardButton.append(btnDone);
  }

  return bukuContainer;
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedCollection = document.getElementById("uncompleted-collection");
  uncompletedCollection.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    uncompletedCollection.append(bookElement);
  }
});

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedCollection = document.getElementById("uncompleted-collection");
  uncompletedCollection.innerHTML = "";

  const completedCollection = document.getElementById("completed-collection");
  completedCollection.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) {
      uncompletedCollection.append(bookElement);
    } else {
      completedCollection.append(bookElement);
    }
  }
});

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const i in books) {
    if (books[i].id === bookId) {
      return i;
    }
  }

  return -1;
}

function searchBook() {
  let inputSearch = document.getElementById("input-search").value;

  for (const bookItem of books) {
    const hideCard = document.getElementById(`book-${bookItem.id}`);

    if (inputSearch.toLowerCase() != bookItem.title.toLowerCase()) {
      hideCard.classList.add("d-none");
    } else {
      hideCard.classList.remove("d-none");
    }

    if (inputSearch.toLowerCase() == "") {
      hideCard.classList.remove("d-none");
    }
  }
}

const deleteSearchButton = document.getElementById("delete-search");

deleteSearchButton.addEventListener("click", function () {
  document.getElementById("input-search").value = "";
});

function saveData() {
  if (isStorageExist()) {
    const bookCollection = JSON.stringify(books);
    localStorage.setItem(storageKey, bookCollection);
    document.dispatchEvent(new Event(savedEvent));
  }
}

const savedEvent = "saved-todo";
const storageKey = "muftiBooks";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser tidak kompatibel!");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const localData = localStorage.getItem(storageKey);
  let data = JSON.parse(localData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
