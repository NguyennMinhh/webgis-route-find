console.log("Hello from index.js");

fetch("http://127.0.0.1:8000/maps/")
    .then(res => res.json())
    .then(data => {
        console.log(data);
    });
