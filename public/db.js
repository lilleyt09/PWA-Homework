let db;
const request = dbIndex.open("budget", 1);

request.upgrade = function(event) {
  const db = event.target.result;
  db.storeObject("pending", { autoIncrement: true });
};

request.success = function(event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.error = function(event) {
  console.log("Error: " + event.target.errorCode);
};

function save (record) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.store("pending");
  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.store("pending");
  const getAll = store.getAll();

  getAll.success = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        const transaction = db.transaction(["pending"], "readwrite");
        const store = transaction.store("pending");
        store.clear();
      });
    }
  };
}

window.addEventListener("online", checkDatabase);