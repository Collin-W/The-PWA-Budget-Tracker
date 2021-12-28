let db;

const request = indexedDB.open('tracker_data', 1)

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('data', {
        autoIncrement: true
    });
};

request.onsuccess = function (event) {
    db = event.target.result

    if (navigator.onLine) {
        uploadData();
    }
}


request.onerror = function (event) {
    console.log(event.target.errorCode);
};

function saveRecord(recordData) {
    const transaction = db.transaction(['data'], 'readwrite');

    const trackerObjectStore = transaction.objectStore('data');

    trackerObjectStore.add(recordData);
}
///

function uploadData() {

    const transaction = db.transaction(['data'], 'readwrite');

    const trackerObjectStore = transaction.objectStore('data');

    const getAll = trackerObjectStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                    method: 'POST',
                    body: JSON.stringify(getAll.result),
                    headers: {
                        Accept: 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(() => {
                    //serverResponse => {
                    // if (serverResponse.message) {
                    //     throw new Error(serverResponse);
                    // }

                    const transaction = db.transaction(['data'], 'readwrite');
                    const trackerObjectStore = transaction.objectStore('data');

                    trackerObjectStore.clear();
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}



window.addEventListener('online', uploadData);

 // module.exports = saveRecord