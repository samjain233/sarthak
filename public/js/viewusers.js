//currUser
var currUser = "";

//getting element from javascript
const showUserPic = document.getElementById("userpic");
const userName = document.getElementById("username");
const userAge = document.getElementById("userage");
const dist = document.getElementById("distance");
const verifyelement = document.getElementById("verify2");

//getting user data

const getUser = () => {
  fetch('/api/userpic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({ number: "number" })
  }).then((res) => {
    return res.json();
  }).then((fres) => {
    // console.log(fres);
    showUserPic.src = fres.imgurl;
    userName.innerHTML = fres.name;
    userAge.innerHTML = fres.age;
    currUser = fres.userid;
    dist.innerHTML = fres.distance;
    const verify = fres.verify;
    console.log(verify);
    if(verify)
    {
      verifyelement.style.display="block";
    }
    else{
      verifyelement.style.display="none";
    }
  });
}

//liking the user
const addUsertolikedList = async () => {
  fetch('/api/likeuser', {

    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      userid: currUser
    })
  }).then((res) => {
    return res.json();
  }).then((fres) => {
    console.log(fres);
  });
}

//superliking the user
const addUsertosuperlikedList = async () => {
  fetch('/api/superlikeuser', {

    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      userid: currUser
    })
  }).then((res) => {
    return res.json();
  }).then((fres) => {
    console.log(fres);
  });
}

//saving the viewed user
const saveUser = async () => {
  fetch('/api/saveuser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({ userid: currUser })
  }).then((res) => {
    return res.json();
  }).then((fres) => {
    console.log(fres);
  });
}

//getting previous user 
const previousUser = async () => {
  fetch('/api/getprevioususer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({ number: "number" })
  }).then((res) => {
    return res.json();
  }).then((fres) => {
    // console.log(fres);
    showUserPic.src = fres.imgurl;
    userName.innerHTML = fres.name;
    userAge.innerHTML = fres.age;
    dist.innerHTML = fres.distance;
    currUser = fres.userid;
  });
}

//sending the location to the server (sos)
const fetchcoordinates = async (position) => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  fetch('/api/sos/setsos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({ lat: lat, lon: lon })
  }).then((res) => {
    return res.json();
  }).then((fres) => {
    console.log(fres);
  });
}

//fetching the coordinates of the user
const sendlocation = async () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(fetchcoordinates);

  } else {
    console.log("geolocation is not supported by the browser");
  }
}

//sending the emails to the users match list friends about sos
const sendMail = async () => {
  fetch('/api/sos/sendsosmail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({ number: "number" })
  }).then((res) => {
    return res.json();
  }).then((fres) => {
    console.log(fres);
  });
}


//intial getUser calling
getUser();

//function calling on keyboard key press
document.addEventListener("keydown", function (event) {
  const key = event.key;
  console.log(key);
  if (key == "ArrowRight")
    likeUser();
  if (key == "ArrowLeft")
    skipUser();
});

//when we skip the user
const skipUser = async () => {
  await saveUser();
  getUser();
  console.log(`you skip the user : ${currUser}`);
}


//when we like the user
const likeUser = async () => {
  await addUsertolikedList();
  await saveUser();
  await getUser();

  console.log(`you liked the user : ${currUser}`);
  console.log("now you can go ahead");
}

//when we press the undo key
const undo = async () => {
  previousUser();
}

//when we press the superlike key
const superlikeuser = async () => {
  console.log("super like button is pressed");
  await addUsertolikedList();
  await addUsertosuperlikedList();
  await saveUser();
  getUser();

}

//when we press the sos button
const sendsos = async () => {
  console.log("sos is called");
  sendlocation();
  sendMail();
  setInterval(function () { sendlocation(); }, 10000);
}

